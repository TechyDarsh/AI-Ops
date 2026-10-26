#include <DHT.h>

// Pin Definitions based on Master Prompt
#define DHTPIN 2
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define MQ2_PIN A0
#define MQ9_PIN A1

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  // DHT requires at least 2000ms between readings
  delay(2000); 

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // Fallback if sensor fails to read
  if (isnan(h) || isnan(t)) {
    h = 0.0;
    t = 0.0;
  }

  // Read MQ-2
  int mq2_raw = analogRead(MQ2_PIN);
  float mq2_voltage = mq2_raw * (5.0 / 1023.0);

  // Read MQ-9
  int mq9_raw = analogRead(MQ9_PIN);
  float mq9_voltage = mq9_raw * (5.0 / 1023.0);

  // Construct and emit structured JSON over Serial
  Serial.print("{");
  Serial.print("\"deviceId\":\"ARDUINO-001\",");
  Serial.print("\"source\":\"REAL\",");
  
  Serial.print("\"dht22\":{\"temperature\":");
  Serial.print(t, 2);
  Serial.print(",\"humidity\":");
  Serial.print(h, 2);
  Serial.print("},");
  
  Serial.print("\"mq2\":{\"raw\":");
  Serial.print(mq2_raw);
  Serial.print(",\"voltage\":");
  Serial.print(mq2_voltage, 2);
  Serial.print("},");
  
  Serial.print("\"mq9\":{\"raw\":");
  Serial.print(mq9_raw);
  Serial.print(",\"voltage\":");
  Serial.print(mq9_voltage, 2);
  Serial.println("}}");
}
