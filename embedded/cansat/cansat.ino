#include "BMI088.h"
#include "SoftwareSerial.h"
#include <Filters.h>
#include <Filters/Butterworth.hpp>
#include <math.h>
#include <MS5611.h>
#include <SparkFun_u-blox_GNSS_v3.h>
#include <SPI.h>
#include <Wire.h>

SoftwareSerial loraSerial(15, 14);
MS5611 sensor;
SFE_UBLOX_GNSS GPSGNSS;
Bmi088Accel accel(Wire, 0x18);
Bmi088Gyro gyro(Wire, 0x68);

#define SEALEVELPRESSURE_HPA (1013.25)
#define GPSWire Wire1
#define gnssAddress 0x42

float referencePressure;
float referenceAltitude;
long BAUD_RATE = 57600;

// Sampling frequency
const float f_s = 100; // Hz

// Cut-off frequency (-3 dB)
const float f_c = 40; // Hz

// Normalized cut-off frequency
const float f_n = 2 * f_c / f_s;

// Sixth-order Butterworth filter
auto filter = butter<6>(f_n);

float altitude(float pressure)
{
  return 44308 * (1 - pow((pressure / SEALEVELPRESSURE_HPA), 0.190284));
}

int parseMessage(char *msg)
{
  char *token = strtok(msg, ",");
  int counter = 0;
  while (token != NULL)
  {
    if (counter == 2)
    {
      return atoi(token);
    }
    token = strtok(NULL, ",");
    counter++;
  }
  return -1;
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
}

void println(const char *data)
{
  Serial.print("[Sending]: ");
  Serial.println(data);
  int dataLength = strlen(data);
  char *str = (char *)malloc(19 + dataLength + (dataLength / 10));
  sprintf(str, "AT+SEND=69,%d,%s\r\n", dataLength, data);
  loraSerial.write(str);
  free(str);
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
    if (command != -1){
      Serial.print("[Recieved]: ");
      Serial.println(command);
    }
  }

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

  if (GPSGNSS.getPVT())
  {
    latitude = GPSGNSS.getLatitude() / 10e6;
    longitude = GPSGNSS.getLongitude() / 10e6;
  }

  char buffer[255];
  sprintf(
      buffer,
      "%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f",
      realTemperature, realPressure, realAltitude, relativeAltitude, latitude, longitude, accelX, accelY, accelZ, gyroX, gyroY, gyroZ);

  println(buffer);
}
