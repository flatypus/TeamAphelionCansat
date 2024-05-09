#include "BMI088.h"
#include "SoftwareSerial.h"
#include <Filters.h>
#include <Filters/Butterworth.hpp>
#include <math.h>
#include <MS5611.h>
#include <SparkFun_u-blox_GNSS_v3.h>
#include <SPI.h>
#include <TeensyThreads.h>
#include <Wire.h>

#pragma region SensorObjects
SoftwareSerial loraSerial(15, 14);
MS5611 sensor;
SFE_UBLOX_GNSS GPSGNSS;
Bmi088Accel accel(Wire, 0x18);
Bmi088Gyro gyro(Wire, 0x68);
#pragma endregion

#define GPSWire Wire1
#define gnssAddress 0x42

// reference pressure and altitude
float referencePressure;
float referenceAltitude;

long BAUD_RATE = 57600;

// magic numbers for the butterworth filter
const float f_s = 100;
const float f_c = 40;
const float f_n = 2 * f_c / f_s;
auto filter = butter<6>(f_n);

#pragma region GlobalVariables
volatile float realTemperature;
volatile float rawPressure;
volatile float realPressure;
volatile float realAltitude;
volatile float relativeAltitude;
volatile float accelX;
volatile float accelY;
volatile float accelZ;
volatile float gyroX;
volatile float gyroY;
volatile float gyroZ;
volatile float latitude;
volatile float longitude;
#pragma endregion

void sensorThread()
{
  while (1)
  {
    sensor.read();
    accel.readSensor();
    gyro.readSensor();

    realTemperature = sensor.getTemperature();
    rawPressure = sensor.getPressure();
    realPressure = filter(rawPressure);
    realAltitude = altitude(realPressure);
    relativeAltitude = realAltitude - referenceAltitude;

    accelX = accel.getAccelX_mss();
    accelY = accel.getAccelY_mss();
    accelZ = accel.getAccelZ_mss();
    gyroX = gyro.getGyroX_rads();
    gyroY = gyro.getGyroY_rads();
    gyroZ = gyro.getGyroZ_rads();
  }
}

void gpsThread()
{
  while (1)
  {
    if (GPSGNSS.getPVT() == true)
    {
      latitude = GPSGNSS.getLatitude();
      longitude = GPSGNSS.getLongitude();
    }
  }
}

void println(const char *data)
{
  int dataLength = strlen(data);
  char *str = (char *)malloc(19 + dataLength + (dataLength / 10));
  sprintf(str, "AT+SEND=69,%d,%s\r\n", dataLength, data);
  Serial.print("[Sending]: ");
  Serial.println(str);
  loraSerial.write(str);
  free(str);
}

void setup()
{
  Serial.begin(BAUD_RATE);
  loraSerial.begin(BAUD_RATE);
  Wire.begin();
  GPSWire.begin();

  if (loraSerial.isListening())
  {
    Serial.println("LoRa is listening!");
  }
  else
  {
    Serial.println("LoRa is not listening!! Check something");
    while (1)
      ;
  }

  if (sensor.begin())
  {
    Serial.println("ms5611 found!");
  }
  else
  {
    Serial.println("ms5611 not found, check wiring!");
    while (1)
      ;
  }

  while (GPSGNSS.begin(GPSWire, gnssAddress) == false)
  {
    Serial.println(F("u-blox GNSS not detected. Retrying..."));
    delay(1000);
  }
  Serial.println("GNSS module detected!");

  int status = accel.begin();
  if (status < 0)
  {
    Serial.println("Accel Initialization Error");
    Serial.println(status);
    while (1)
      ;
  }
  else
  {
    Serial.println("Acceleration initialized!");
  }

  status = gyro.begin();
  if (status < 0)
  {
    Serial.println("Gyro Initialization Error");
    Serial.println(status);
    while (1)
      ;
  }
  else
  {
    Serial.println("Gyro Initialized!");
  }

  sensor.read();
  referencePressure = sensor.getPressure();
  referenceAltitude = altitude(referencePressure);
  sensor.setOversampling(OSR_ULTRA_HIGH);
  GPSGNSS.setI2COutput(COM_TYPE_UBX);

  threads.addThread(sensorThread);
  threads.addThread(gpsThread);
}

void loop()
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
    }
  }

  char buffer[255];
  sprintf(
      buffer,
      "%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f",
      realTemperature, realPressure, realAltitude, relativeAltitude, latitude, longitude, accelX, accelY, accelZ, gyroX, gyroY, gyroZ);

  println(buffer);
}
