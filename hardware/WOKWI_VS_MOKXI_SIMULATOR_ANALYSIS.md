# Virtual Hardware Simulator Evaluation: Wokwi vs. Mokxi
**Project:** SADES – Smart Accident Detection & Emergency Response System  
**College:** Amrutvahini College of Engineering, Sangamner (Team Alert)

## 1. Executive Summary & Recommendation
For an IoT-based automotive safety system featuring an ESP32, 6-axis MPU6050 inertial motion sensor, 128x64 I2C OLED display, and GPS telemetry, **Wokwi is the most capable, technically mature, and practical platform**. 

While Mokxi provides basic visual simulation, it lacks interactive multi-axis accelerometer manipulation and full SSD1306 I2C graphical rendering needed to demonstrate crash physics and live warning screens.

---

## 2. Head-to-Head Feature Comparison

| Evaluation Dimension | Wokwi Simulator | Mokxi / Alternative Simulators | SADES Engineering Impact |
| :--- | :--- | :--- | :--- |
| **ESP32 Core Emulation** | Full QEMU-based Xtensa dual-core ESP32 emulation with FreeRTOS & interrupts. | Limited microcontroller set; partial FreeRTOS timing. | High: Needed for concurrent sensor polling and network dispatch. |
| **MPU6050 Motion Sensor** | **Native `wokwi-mpu6050` part** with interactive slider controls for Accel X/Y/Z (in g) and Gyroscope Roll/Pitch/Yaw (in °/s). | Generic analog potentiometers or non-interactive mock. | Critical: Allows demonstrator to simulate 4.5g impact and 80° rollover on demand. |
| **SSD1306 OLED (128x64)** | Full frame-buffer I2C emulation (`board-ssd1306`) matching Adafruit GFX pixel-for-pixel. | Often text-only 16x2 LCD or basic terminal display. | High: Displays live telemetry, 10s countdown timer, and alert status. |
| **Piezo Buzzer** | Native PWM audio synthesis through browser Web Audio. | Visual indicator only or no audio. | Essential: Demonstrates audible in-cabin alert during the 10-second verification window. |
| **GPS Module Emulation** | UART serial injection (NMEA $GPRMC/$GPGGA strings) via virtual secondary serial port. | Mock coordinates in code only. | Medium: Supports realistic NMEA parsing or direct coordinate injection. |
| **Network & Outbound HTTP** | Supports `Wokwi-GUEST` virtual WiFi with Wokwi IoT Gateway / WebSocket bridge. | Browser sandboxed without outbound socket bridge. | High: Connects ESP32 telemetry to the SADES backend API. |
| **Community & Academic Acceptance** | Industry standard used in IEEE, ACM, and university capstone projects worldwide. | Emerging tool with limited public project repositories. | High: Recognized and trusted by college project evaluation committees. |

---

## 3. Simulator to Application Integration Architecture

```
+-----------------------------------------------------------+
|                   VIRTUAL HARDWARE (WOKWI)                |
|                                                           |
|  [MPU6050] (I2C)                                          |
|  [SSD1306 OLED] (I2C)  --->  [ESP32 Microcontroller]     |
|  [Piezo Buzzer] (GPIO 25)           |                     |
|  [I'M SAFE Button] (GPIO 14)        |                     |
+-------------------------------------|---------------------+
                                      |
                           Wi-Fi (Wokwi-GUEST)
                                      |
                                      v
                        [Wokwi IoT Gateway / Bridge]
                                      |
                                      | HTTP POST /api/sensors
                                      v
+-----------------------------------------------------------+
|                 SADES BACKEND (Node.js / Express)         |
|                                                           |
|  - Real-Time Sensor Processing & Vector Math              |
|  - Multi-Threshold Accident Detection Algorithm           |
|  - 10-Second Verification State Machine                   |
|  - Automated Emergency Dispatch Engine                    |
+-----------------------------------------------------------+
                                      |
                                      | Server-Sent Events (SSE)
                                      v
+-----------------------------------------------------------+
|                  SADES APPLICATION DASHBOARD              |
|                                                           |
|  - Live G-Force & Gyroscope Waveforms                     |
|  - Interactive Virtual ESP32 Hardware Workbench           |
|  - Leaflet OpenStreetMap GPS Tracking                     |
|  - 10s Countdown Audio-Visual Verification HUD            |
|  - Emergency Response Workflow & Historical Audit Trail   |
+-----------------------------------------------------------+
```

---

## 4. Addressing Local Networking Restrictions
In standard browser-based simulators (including Wokwi), direct HTTP requests to `localhost:3000` from the browser-sandboxed WASM ESP32 can be restricted by browser CORS / loopback security. 

To ensure **100% reliability for college presentations and demonstrations**, SADES implements a **Dual Integration Architecture**:
1. **Direct HTTP REST API (`POST /api/sensors`)**: Works directly when using the Wokwi Desktop VS Code Extension or Wokwi Bridge tool with physical or simulated ESP32.
2. **Interactive Virtual Hardware Workbench**: Built directly into the SADES Web Application! This provides an interactive ESP32, animated SSD1306 OLED canvas rendering, pitch/roll vehicle attitude indicators, synthetic piezo buzzer sounds, and simulated GPS telemetry—allowing seamless demonstration on any computer without needing external bridge setups.
