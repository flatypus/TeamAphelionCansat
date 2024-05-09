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

float referencePressure;
float referenceAltitude;

long BAUD_RATE = 57600;

// magic numbers for the butterworth filter
const float f_s = 100;
const float f_c = 40;
const float f_n = 2 * f_c / f_s;
auto filter = butter<6>(f_n);

void setup()
{
  Serial.begin(BAUD_RATE);
  loraSerial.begin(BAUD_RATE);
  Wire.begin();
  GPSWire.begin();

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

  while (accel.begin() < 0)
  {
    Serial.println("Accel Initialization Error");
    delay(1000);
  }
  Serial.println("Acceleration initialized!");

  while (gyro.begin() < 0)
  {
    Serial.println("Gyro Initialization Error");
    delay(1000);
  }
  Serial.println("Gyro Initialized!");

  sensor.read();
  referencePressure = sensor.getPressure();
  referenceAltitude = altitude(referencePressure);
  sensor.setOversampling(OSR_ULTRA_HIGH);
  GPSGNSS.setI2COutput(COM_TYPE_UBX);
}

void println(const char *data)
{
  int dataLength = strlen(data);
  char *str = (char *)malloc(15 + dataLength + (dataLength / 10));
  sprintf(str, "AT+SEND=69,%d,%s", dataLength, data);
  Serial.print("[Sending]: ");
  Serial.println(str);
  loraSerial.println(str);
  free(str);
}

void loop()
{
  sensor.read();
  accel.readSensor();
  gyro.readSensor();

  float realTemperature = sensor.getTemperature();
  float rawPressure = sensor.getPressure();
  float realPressure = filter(rawPressure);
  float realAltitude = altitude(realPressure);
  float relativeAltitude = realAltitude - referenceAltitude;
  float latitude = 0;
  float longitude = 0;
  float accelX = accel.getAccelX_mss();
  float accelY = accel.getAccelY_mss();
  float accelZ = accel.getAccelZ_mss();
  float gyroX = gyro.getGyroX_rads();
  float gyroY = gyro.getGyroY_rads();
  float gyroZ = gyro.getGyroZ_rads();

  // if (GPSGNSS.getPVT())
  // {
  //   latitude = GPSGNSS.getLatitude() / 10e6;
  //   longitude = GPSGNSS.getLongitude() / 10e6;
  // }

  char buffer[255];
  sprintf(
      buffer,
      "%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f",
      realTemperature, realPressure, realAltitude, relativeAltitude, latitude, longitude, accelX, accelY, accelZ, gyroX, gyroY, gyroZ);

  println(buffer);
  delay(1000);
}
