#include <Arduino.h>
#include <Wire.h>
#include <SparkFun_SCD4x_Arduino_Library.h>

SCD4x sensor;

void led_power(int count, bool power);
void show_level(int level);

#define SCL_PIN 22
#define SDA_PIN 21
const bool powered = true;

const int light_pins[8] = {32, 33, 25, 26, 27, 14, 12, 13};
const int levels[8] = {400, 600, 700, 800, 1000, 1200, 1400, 2000};

void setup() {

  Serial.begin(9600);
  leds_off();
  Wire.begin();

  if(!sensor.begin(Wire)) {
    Serial.println("CO2 sensor not detected");
    while(1) {}
  }

  sensor.startPeriodicMeasurement();

  Serial.println("\nReady to detect CO2");
  delay(3000);
}

void loop() {
  if (sensor.readMeasurement()) {
    int co2 = sensor.getCO2();
    float temp = sensor.getTemperature();
    float hum = sensor.getHumidity();

    show_level(co2);
    led_power(0, true);

    // Measurement print
    Serial.print("CO2: "); Serial.print(co2); Serial.println(" ppm");
    Serial.print("Temperature: ");   Serial.print(temp, 1); Serial.println(" °C");
    Serial.print("Humidity: ");   Serial.print(hum, 1); Serial.println("%");
    Serial.println();
  }

  delay(500);
}

void led_power(int count, bool power) {
  if (count < 0 || count >= 8) return;

  if (powered) {
    if (power) {
      digitalWrite(light_pins[count], HIGH);
    } else {
      digitalWrite(light_pins[count], LOW);
    }
  } else {
    if (power) {
      digitalWrite(light_pins[count], LOW);
    } else {
      digitalWrite(light_pins[count], HIGH);
    }
  }
}

void leds_off(){
  for (int i = 0; i < 8; i++) {
    pinMode(light_pins[i], OUTPUT);
    led_power(i, false);
  }
  led_power(0, true); // First led all time is on (co2 is ideal)
}

void show_level (int level) {
  for (int i = 0; i < 8; i++) {
    led_power(i, level >= levels[i]);
  }
}
