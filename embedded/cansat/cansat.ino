#include "BMI088.h"
#include "SoftwareSerial.h"
#include <Filters.h>
#include <Filters/Butterworth.hpp>
#include <MS5611.h>
#include <PWMServo.h>
#include <Servo.h>
#include <SparkFun_u-blox_GNSS_v3.h>
#include <SPI.h>
#include <TeensyThreads.h>
#include <Wire.h>

PWMServo tankServo; // create servo object to control a servo
PWMServo verticalServo;
Servo drill;

#pragma region SensorObjects
SoftwareSerial loraSerial(15, 14);
MS5611 sensor;
SFE_UBLOX_GNSS GPSGNSS;
Bmi088 bmi(Wire, 0x18, 0x68);
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
// volatile int gyroX = 0;
// volatile int gyroY = 0;
// volatile int gyroZ = 0;
volatile int gyroVelX = 0;
volatile int gyroVelY = 0;
volatile int gyroVelZ = 0;
volatile int latitude = 0;
volatile int longitude = 0;
volatile int confirmation = 0;
#pragma endregion

Threads::Mutex lora_lock;

int factor = 1000;

void mainSensorThread()
{
  while (1)
  {
    sensor.read();
    bmi.readSensor();

    realTemperature = sensor.getTemperature() * factor;
    float localPressure = sensor.getPressure();
    rawPressure = localPressure * factor;
    float localRealPressure = filter(localPressure);
    realPressure = localRealPressure * factor;
    float localRealAltitude = altitude(localRealPressure);
    realAltitude = localRealAltitude * factor;
    relativeAltitude = (localRealAltitude - referenceAltitude) * factor;
    accelX = bmi.getAccelX_mss() * factor;
    accelY = bmi.getAccelY_mss() * factor;
    accelZ = bmi.getAccelZ_mss() * factor;
    gyroVelX = bmi.getGyroX_rads() * factor;
    gyroVelY = bmi.getGyroY_rads() * factor;
    gyroVelZ = bmi.getGyroZ_rads() * factor;

    delay(1);
  }
}

void gpsThread()
{
  while (1)
  {
    if (GPSGNSS.getPVT())
    {
      latitude = GPSGNSS.getLatitude();
      longitude = GPSGNSS.getLongitude();
    }
    delay(1);
  }
}

void executeCommand(int command)
{
  int position;
  switch (command)
  {
  case 0: // Move drill up
    verticalServo.write(160);
    break;
  case 1: // Hold drill
    verticalServo.write(100);
    break;
  case 2: // Move drill down
    verticalServo.write(30);
    break;
  case 3: // Drill start
    position = drill.readMicroseconds();
    if (position != 1000)
      return;
    for (int i = 0; i < 7; i++)
    {
      drill.writeMicroseconds(1300 + i * 100);
      delay(1000);
    }
    break;
  case 4: // Drill stop
    drill.writeMicroseconds(1000);
    break;
  case 6: // Rest chamber
    tankServo.write(133);
    break;
  case 7: // Water chamber
    tankServo.write(81);
    break;
  case 8: // Test chamber
    tankServo.write(60);
    break;
  case 9: // FPV ON
    digitalWrite(12, HIGH);
    break;
  case 10: // FPV OFF
    digitalWrite(12, LOW);
    break;
  case 11: // Landing legs
    digitalWrite(10, HIGH);
    delay(100);
    digitalWrite(10, LOW);
    break;
  default:
    Serial.println("Unknown command");
    break;
  }
}

void read()
{
  char data[255];
  int i = 0;

  if (loraSerial.available())
  {
    while (loraSerial.available())
    {
      data[i] = loraSerial.read();
      i++;
    }
    int command = parseMessage(data);
    if (command != -1)
    {
      Serial.print("[Recieved]: ");
      Serial.println(command);
      executeCommand(command);
      confirmation = 1;
    }
  }
}

void setup()
{
  Serial.begin(BAUD_RATE);
  loraSerial.begin(BAUD_RATE);
  Wire.begin();
  GPSWire.begin();
  verticalServo.attach(22);
  tankServo.attach(23);
  pinMode(10, OUTPUT);
  pinMode(12, OUTPUT);
  drill.attach(9, 1000, 2000);
  drill.writeMicroseconds(1000);
  delay(500);
  drill.writeMicroseconds(1100);
  delay(1000);
  drill.writeMicroseconds(1000);

  while (!loraSerial.isListening())
  {
    Serial.println("LoRa is not listening!! Check something");
    delay(1000);
  }
  Serial.println("LoRa is listening!");

  while (!sensor.begin())
  {
    Serial.println("ms5611 not found, check wiring!");
    delay(1000);
  }
  Serial.println("ms5611 found!");

  while (GPSGNSS.begin(GPSWire, gnssAddress) == false)
  {
    Serial.println(F("u-blox GNSS not detected. Retrying..."));
    delay(1000);
  }
  Serial.println("GNSS module detected!");

  while (bmi.begin() < 0)
  {
    Serial.println("BMI Initialization Error");
    delay(1000);
  }
  Serial.println("BMI Initialized!");

  sensor.read();
  referencePressure = sensor.getPressure();
  referenceAltitude = altitude(referencePressure);
  sensor.setOversampling(OSR_ULTRA_HIGH);
  GPSGNSS.setI2COutput(COM_TYPE_UBX);

  threads.addThread(mainSensorThread);
  threads.addThread(gpsThread);
}

void println(const char *data)
{
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

void loop()
{
  for (int i = 0; i < 10; i++)
  {
    if (confirmation == 1)
    {
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

  if (confirmation == 1)
  {
    confirmation = 0;
    delay(250);
  }

  println(buffer);
}
