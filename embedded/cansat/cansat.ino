#include "BMI088.h"
#include "SoftwareSerial.h"
#include <Filters.h>
#include <Filters/Butterworth.hpp>
#include <MS5611.h>
#include <PWMServo.h>
#include <SparkFun_u-blox_GNSS_v3.h>
#include <SPI.h>
#include <TeensyThreads.h>
#include <Wire.h>

PWMServo weakServo;  // create servo object to control a servo
PWMServo tinyServo;

#pragma region SensorObjects
SoftwareSerial loraSerial(15, 14);
MS5611 sensor;
SFE_UBLOX_GNSS GPSGNSS;
Bmi088Accel accel(Wire, 0x18);
Bmi088Gyro gyro(Wire, 0x68);
#pragma endregion

#define GPSWire Wire1
#define gnssAddress 0x42

float referencePressure;
float referenceAltitude;

long BAUD_RATE = 57600;

// magic numbers for the butterworth filter
const float f_s = 100;
const float f_c = 40;
const float f_n = 2 * f_c / f_s;
auto filter = butter<6>(f_n);

#pragma region GlobalVariables
volatile int realTemperature;
volatile int rawPressure;
volatile int realPressure;
volatile int realAltitude;
volatile int relativeAltitude;
volatile int accelX;
volatile int accelY;
volatile int accelZ;
volatile int gyroX;
volatile int gyroY;
volatile int gyroZ;
volatile int latitude = 0;
volatile int longitude = 0;
volatile int confirmation = 0;
#pragma endregion

Threads::Mutex lora_lock;

int factor = 1000;

void mainSensorThread() {
  while (1) {
    sensor.read();
    accel.readSensor();
    gyro.readSensor();

    realTemperature = sensor.getTemperature() * factor;
    float localPressure = sensor.getPressure();
    rawPressure = localPressure * factor;
    float localRealPressure = filter(localPressure);
    realPressure = localRealPressure * factor;
    float localRealAltitude = altitude(localRealPressure);
    realAltitude = localRealAltitude * factor;
    relativeAltitude = (localRealAltitude - referenceAltitude) * factor;
    accelX = accel.getAccelX_mss() * factor;
    accelY = accel.getAccelY_mss() * factor;
    accelZ = accel.getAccelZ_mss() * factor;
    gyroX = gyro.getGyroX_rads() * factor;
    gyroY = gyro.getGyroY_rads() * factor;
    gyroZ = gyro.getGyroZ_rads() * factor;

    delay(1);
  }
}

void gpsThread() {
  while (1) {
    if (GPSGNSS.getPVT()) {
      latitude = GPSGNSS.getLatitude() / 10e6;
      longitude = GPSGNSS.getLongitude() / 10e6;
    }
    delay(1);
  }
}

void read() {
  char data[255];
  int i = 0;

  if (loraSerial.available()) {
    while (loraSerial.available()) {
      data[i] = loraSerial.read();
      i++;
    }
    int command = parseMessage(data);
    if (command != -1) {
      Serial.print("[Recieved]: ");
      Serial.println(command);
      confirmation = 1;
    }
  }
}

void setup() {
  Serial.begin(BAUD_RATE);
  loraSerial.begin(BAUD_RATE);
  Wire.begin();
  GPSWire.begin();
  weakServo.attach(22);
  tinyServo.attach(23);

  while (!loraSerial.isListening()) {
    Serial.println("LoRa is not listening!! Check something");
    delay(1000);
  }
  Serial.println("LoRa is listening!");

  while (!sensor.begin()) {
    Serial.println("ms5611 not found, check wiring!");
    delay(1000);
  }
  Serial.println("ms5611 found!");

  while (GPSGNSS.begin(GPSWire, gnssAddress) == false) {
    Serial.println(F("u-blox GNSS not detected. Retrying..."));
    delay(1000);
  }
  Serial.println("GNSS module detected!");

  while (accel.begin() < 0) {
    Serial.println("Accel Initialization Error");
    delay(1000);
  }
  Serial.println("Acceleration initialized!");

  while (gyro.begin() < 0) {
    Serial.println("Gyro Initialization Error");
    delay(1000);
  }
  Serial.println("Gyro Initialized!");

  sensor.read();
  referencePressure = sensor.getPressure();
  referenceAltitude = altitude(referencePressure);
  sensor.setOversampling(OSR_ULTRA_HIGH);
  GPSGNSS.setI2COutput(COM_TYPE_UBX);

  threads.addThread(mainSensorThread);
  threads.addThread(gpsThread);
}

void println(const char *data) {
  threads.suspend(1);
  threads.suspend(2);
  int dataLength = strlen(data);
  char *str = (char *)malloc(15 + dataLength + (dataLength / 10));
  sprintf(str, "AT+SEND=69,%d,%s", dataLength, data);
  Serial.print("[Sending]: ");
  Serial.println(str);
  loraSerial.println(str);
  free(str);
  threads.restart(1);
  threads.restart(2);
}

void loop() {
  for (int i = 0; i < 10; i++) {
    if (confirmation == 1) {
      break;
    }
    read();
    delay(50);
  }

  char buffer[255];
  sprintf(
    buffer,
    "%i,%i,%i,%i,%i,%i,%i,%i,%i,%i,%i,%i",
    realTemperature, realPressure, realAltitude, relativeAltitude, latitude, longitude, accelX, accelY, accelZ, gyroX, gyroY, gyroZ);

  if (confirmation == 1) {
    confirmation = 0;
    delay(250);
  }

  println(buffer);
}
