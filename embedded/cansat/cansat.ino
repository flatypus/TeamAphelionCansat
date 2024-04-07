#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include "Adafruit_BMP3XX.h"
#include "SoftwareSerial.h"

SoftwareSerial lora(0, 1);
Adafruit_BMP3XX bmp;

long BAUD_RATE = 57600;
#define SEALEVELPRESSURE_HPA (1013.25)

void setup()
{
  Serial.begin(BAUD_RATE);
  lora.begin(BAUD_RATE);

  if (!bmp.begin_I2C())
  { // hardware I2C mode, can pass in address & alt Wire
    Serial.println("Could not find a valid BMP3 sensor, check wiring!");
    while (1)
      ;
  }

  bmp.setTemperatureOversampling(BMP3_OVERSAMPLING_8X);
  bmp.setPressureOversampling(BMP3_OVERSAMPLING_4X);
  bmp.setIIRFilterCoeff(BMP3_IIR_FILTER_COEFF_3);
  bmp.setOutputDataRate(BMP3_ODR_50_HZ);
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
  Serial.println("Reading!");
  if (!bmp.performReading())
  {
    Serial.println("Failed to perform reading");
    return;
  }

  char buffer[100];
  sprintf(buffer, "{temperature:%f,pressure:%f,altitude:%f}", bmp.temperature, bmp.pressure / 100.0, bmp.readAltitude(SEALEVELPRESSURE_HPA));
  println(buffer);

  delay(100);

  
}
