#include "SoftwareSerial.h"
#include <Filters.h>
#include <Filters/Butterworth.hpp>
#include <MS5611.h>
#include <SparkFun_u-blox_GNSS_v3.h>
#include <SPI.h>
#include <Wire.h>

SoftwareSerial lora(34, 35);
MS5611 sensor;
SFE_UBLOX_GNSS GPSGNSS;

#define SEALEVELPRESSURE_HPA (1013.25)
#define GPSWire Wire2
#define gnssAddress 0x42

double referencePressure;
double referenceAltitude;
long BAUD_RATE = 57600;

// Sampling frequency
const double f_s = 100; // Hz

// Cut-off frequency (-3 dB)
const double f_c = 40; // Hz

// Normalized cut-off frequency
const double f_n = 2 * f_c / f_s;

// Sixth-order Butterworth filter
auto filter = butter<6>(f_n);


double altitude(double pressure)
{
  return 44308 * (1 - pow((pressure / SEALEVELPRESSURE_HPA), 0.190284));
}

void setup()
{
  Serial.begin(BAUD_RATE);
  lora.begin(BAUD_RATE);
  Wire.begin();
  GPSWire.begin();

  if (!sensor.begin())
  {
    Serial.println("ms5611 not found, check wiring!");
    while (1)
      ;
  }

  while (GPSGNSS.begin(GPSWire, gnssAddress) == false)
  {
      Serial.println(F("u-blox GNSS not detected. Retrying..."));
      delay (1000);
  }

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
  sprintf(str, "AT+SEND=420,%d,%s", dataLength, data);
  lora.println(str);
  free(str);
}

void loop()
{
  sensor.read();

  double realTemperature = sensor.getTemperature();
  double rawPressure = sensor.getPressure();
  double realPressure = filter(rawPressure);
  double realAltitude = altitude(realPressure);
  double relativeAltitude = realAltitude - referenceAltitude;
  double latitude = 0;
  double longitude = 0;

  if (GPSGNSS.getPVT())
  {
    latitude = GPSGNSS.getLatitude() / 10e6;
    longitude = GPSGNSS.getLongitude() / 10e6;
  }

  char buffer[255];
  sprintf(
    buffer, 
    "{temperature:%f,pressure:%f,altitude:%f,relativeAltitude:%f,latitude:%f,longitude:%f}", 
    realTemperature, realPressure, realAltitude, relativeAltitude, latitude, longitude
  );

  println(buffer);
  delay(100);
}
