/**
 * SADES - Smart Accident Detection & Emergency Response System
 * Target Microcontroller: ESP32 Dev Module
 * Components:
 *   - MPU6050 (I2C: SDA=21, SCL=22)
 *   - SSD1306 128x64 OLED (I2C: SDA=21, SCL=22)
 *   - NEO-6M GPS Module (UART2: RX=16, TX=17)
 *   - Piezo Buzzer (Pin 25)
 *   - "I'M SAFE" Pushbutton (Pin 14, INPUT_PULLUP)
 *   - Manual SOS Pushbutton (Pin 27, INPUT_PULLUP)
 *
 * Developed for Team Alert - Amrutvahini College of Engineering, Sangamner
 */

#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// Pin Definitions
#define PIN_BUZZER 25
#define PIN_BTN_SAFE 14
#define PIN_BTN_SOS 27

// Wi-Fi Credentials (Wokwi-GUEST for simulator, or local hotspot)
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Backend API Endpoint
// In Wokwi or real ESP32, replace with your deployed SADES App URL or Local IP
const char* serverUrl = "http://localhost:3000/api/sensors";
const char* verifyUrl = "http://localhost:3000/api/accidents/verify";

Adafruit_MPU6050 mpu;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Detection Thresholds
const float IMPACT_THRESHOLD_G = 3.2; // Accel magnitude threshold
const float TILT_THRESHOLD_DEG = 60.0; // Rollover tilt threshold

// System State
bool isAccidentState = false;
unsigned long accidentTriggerTime = 0;
const int COUNTDOWN_SECONDS = 10;
unsigned long lastTelemetryTime = 0;
const int TELEMETRY_INTERVAL_MS = 1000;

// Simulated GPS Coordinates (Amrutvahini College, Sangamner)
float currentLat = 19.6138;
float currentLng = 74.2057;
float currentSpeed = 42.5;

void setupDisplay() {
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 OLED initialization failed"));
  } else {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(10, 15);
    display.println("SADES SYSTEM v6.0");
    display.setCursor(10, 30);
    display.println("Team Alert - AVCOE");
    display.setCursor(10, 45);
    display.println("Booting Sensors...");
    display.display();
    delay(1500);
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== SADES ESP32 Starting ===");

  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_BTN_SAFE, INPUT_PULLUP);
  pinMode(PIN_BTN_SOS, INPUT_PULLUP);
  digitalWrite(PIN_BUZZER, LOW);

  Wire.begin(21, 22);

  setupDisplay();

  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
  } else {
    Serial.println("MPU6050 initialized successfully");
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }

  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(300);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWi-Fi Connected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nWi-Fi connection timeout. Operating in Standalone/Simulator mode.");
  }
}

void triggerBuzzer(bool state) {
  digitalWrite(PIN_BUZZER, state ? HIGH : LOW);
}

void sendTelemetryToServer(float ax, float ay, float az, float gx, float gy, float gz, float temp) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<300> doc;
  doc["device_id"] = "SADES-ESP32-HARDWARE";
  doc["source"] = "WOKWI_SIMULATOR";
  doc["ax"] = ax;
  doc["ay"] = ay;
  doc["az"] = az;
  doc["gx"] = gx;
  doc["gy"] = gy;
  doc["gz"] = gz;
  doc["temp"] = temp;
  doc["lat"] = currentLat;
  doc["lng"] = currentLng;
  doc["speed"] = currentSpeed;
  doc["sats"] = 8;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpResponseCode = http.POST(requestBody);
  if (httpResponseCode > 0) {
    Serial.print("Telemetry Sent, Response: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("Error sending HTTP POST: ");
    Serial.println(httpResponseCode);
  }
  http.end();
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // Convert m/s^2 to g (1g = 9.806 m/s^2)
  float ax_g = a.acceleration.x / 9.806;
  float ay_g = a.acceleration.y / 9.806;
  float az_g = a.acceleration.z / 9.806;

  float gx_deg = g.gyro.x * 57.2958;
  float gy_deg = g.gyro.y * 57.2958;
  float gz_deg = g.gyro.z * 57.2958;

  float accelMag = sqrt(ax_g * ax_g + ay_g * ay_g + az_g * az_g);
  float roll = atan2(ay_g, az_g) * 57.2958;
  float pitch = atan2(-ax_g, sqrt(ay_g * ay_g + az_g * az_g)) * 57.2958;

  // Check Buttons
  bool safePressed = digitalRead(PIN_BTN_SAFE) == LOW;
  bool sosPressed = digitalRead(PIN_BTN_SOS) == LOW;

  if (sosPressed && !isAccidentState) {
    isAccidentState = true;
    accidentTriggerTime = millis();
    Serial.println("MANUAL SOS BUTTON PRESSED!");
  }

  // Accident Detection Condition
  if (!isAccidentState) {
    if (accelMag >= IMPACT_THRESHOLD_G || abs(roll) >= TILT_THRESHOLD_DEG) {
      isAccidentState = true;
      accidentTriggerTime = millis();
      Serial.println(">>> ACCIDENT DETECTED BY SENSORS <<<");
      Serial.print("Magnitude: "); Serial.print(accelMag);
      Serial.print("g | Roll: "); Serial.println(roll);
    }
  }

  // Handle Verification Countdown
  if (isAccidentState) {
    unsigned long elapsed = (millis() - accidentTriggerTime) / 1000;
    int remaining = COUNTDOWN_SECONDS - elapsed;

    // Check if user pressed "I'M SAFE"
    if (safePressed) {
      isAccidentState = false;
      triggerBuzzer(false);
      Serial.println("User pressed I'M SAFE! Alert Cancelled.");
      display.clearDisplay();
      display.setCursor(20, 25);
      display.setTextSize(1);
      display.println("ALERT CANCELLED");
      display.setCursor(25, 40);
      display.println("STATUS: SAFE");
      display.display();
      delay(2000);
      return;
    }

    if (remaining > 0) {
      // Pulse buzzer during countdown
      triggerBuzzer((millis() / 250) % 2 == 0);

      // OLED Alert UI
      display.clearDisplay();
      display.fillRect(0, 0, 128, 16, SSD1306_WHITE);
      display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
      display.setTextSize(1);
      display.setCursor(4, 4);
      display.println("! ACCIDENT DETECTED !");

      display.setTextColor(SSD1306_WHITE);
      display.setTextSize(2);
      display.setCursor(18, 22);
      display.print("SAFE? ");
      display.print(remaining);
      display.print("s");

      display.setTextSize(1);
      display.setCursor(2, 45);
      display.println("Press BTN 14 if Safe");
      display.setCursor(2, 55);
      display.print("GPS: ");
      display.print(currentLat, 3);
      display.print(", ");
      display.print(currentLng, 3);
      display.display();
    } else {
      // Countdown expired: CONFIRMED EMERGENCY
      triggerBuzzer(true);
      display.clearDisplay();
      display.fillRect(0, 0, 128, 24, SSD1306_WHITE);
      display.setTextColor(SSD1306_BLACK, SSD1306_WHITE);
      display.setTextSize(1);
      display.setCursor(10, 4);
      display.println("EMERGENCY ALERT!");
      display.setCursor(14, 14);
      display.println("DISPATCHING HELP");

      display.setTextColor(SSD1306_WHITE);
      display.setCursor(4, 32);
      display.println("SMS & Location Sent");
      display.setCursor(4, 44);
      display.println("Hospital 108 Alerted");
      display.setCursor(4, 54);
      display.println("Team Alert AVCOE");
      display.display();

      // Transmit to Cloud API
      sendTelemetryToServer(ax_g, ay_g, az_g, gx_deg, gy_deg, gz_deg, temp.temperature);
      delay(3000);
    }
  } else {
    // Normal OLED Status Display
    triggerBuzzer(false);

    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("SADES 6.0 | ");
    display.println(WiFi.status() == WL_CONNECTED ? "ONLINE" : "OFFLINE");
    display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

    display.setCursor(0, 14);
    display.print("Accel: ");
    display.print(accelMag, 2);
    display.println(" g");

    display.setCursor(0, 26);
    display.print("Roll: ");
    display.print((int)roll);
    display.print(" | Pitch: ");
    display.print((int)pitch);
    display.println(" deg");

    display.setCursor(0, 38);
    display.print("GPS Lat: ");
    display.println(currentLat, 4);

    display.setCursor(0, 50);
    display.print("GPS Lng: ");
    display.print(currentLng, 4);
    display.display();
  }

  // Periodic Telemetry Dispatch
  if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = millis();
    sendTelemetryToServer(ax_g, ay_g, az_g, gx_deg, gy_deg, gz_deg, temp.temperature);
  }

  delay(100);
}
