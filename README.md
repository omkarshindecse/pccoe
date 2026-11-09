# SADES – Smart Accident Detection & Emergency Response System

**Academic Capstone Project & Hackathon Entry**  
**Team Alert:** Anjali Nimse (Leader), Ojasvi Padol, Omkar Shinde, Sahil Pardeshi  
**Institution:** Amrutvahini College of Engineering, Sangamner  
**Domain:** Disaster Resilience, Public Health & Community Well-being  
**Theme:** Automotive Technology, Robotics and Automation  
**Wokwi Reference Project:** [https://wokwi.com/projects/405361372814750721](https://wokwi.com/projects/405361372814750721)

---

## 1. System Overview
SADES is an Internet-of-Things (IoT) automotive safety platform engineered to reduce emergency response times (addressing the critical **Golden Hour Rescue Window**) when a vehicular collision or rollover occurs.

The system incorporates:
- **ESP32 Dual-Core Microcontroller**: Real-time sensor acquisition, edge threshold filtering, and Wi-Fi transmission.
- **MPU6050 6-Axis Inertial Motion Sensor**: 3-axis accelerometer ($\pm 8g$) and 3-axis gyroscope ($\pm 500^\circ/s$) measuring linear impact deceleration and angular roll/pitch tilt.
- **NEO-6M GPS Module**: Micro-positioning coordinates (latitude, longitude, speed, satellites, timestamp).
- **SSD1306 128x64 I2C OLED Display**: In-vehicle heads-up telemetry, 10-second false-alarm countdown, and alert dispatch status.
- **Piezo Buzzer**: Multi-frequency auditory alert signaling potential collision.
- **Full-Stack Express & React Dashboard**: Real-time telemetry streaming, interactive Leaflet OpenStreetMap geospatial mapping, and automated emergency notification dispatch to contacts & trauma centers.

---

## 2. The 5-Phase Automated Accident-Response Mechanism
```
[1. DETECT]   --> [2. VERIFY]    --> [3. LOCATE]   --> [4. ALERT]   --> [5. RESPOND]
MPU6050           10s Verification    NEO-6M GPS        Automated SMS,   Nearby Trauma Center
Accel & Gyro      Countdown Window    Latitude/         Call & Email     & Highway Rescue 108
Trigger Shock     ("I'M SAFE" vs      Longitude         with Google      Dispatched
Threshold         Confirmation)       Coordinates       Maps Link        (Golden Hour)
```

---

## 3. Getting Started Locally

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation & Run
```bash
# 1. Clone repository and install dependencies
npm install

# 2. Run full-stack development server (Express API + Vite React UI)
npm run dev
```
The application will launch at `http://localhost:3000`.

---

## 4. Virtual Hardware Simulator (Wokwi) Setup

The project includes all files needed to run in the Wokwi simulator:
- **Firmware:** `/hardware/esp32_firmware/sades_esp32_firmware.ino`
- **Circuit Layout:** `/hardware/wokwi/diagram.json`
- **Libraries:** `/hardware/wokwi/libraries.txt`
- **Comparative Analysis:** `/hardware/WOKWI_VS_MOKXI_SIMULATOR_ANALYSIS.md`

### To run in Wokwi:
1. Open [https://wokwi.com/projects/405361372814750721](https://wokwi.com/projects/405361372814750721) or create a new ESP32 project.
2. Paste the contents of `diagram.json` into the `diagram.json` tab.
3. Paste `sades_esp32_firmware.ino` into the code editor.
4. Add the required libraries from `libraries.txt`.
5. Press the green **Start Simulation** button.

---

## 5. College Demonstration / Demo Mode
The application includes a compulsory **Demo Mode** on the top navigation bar with 1-click test scenarios:
1. **Normal Movement**: Simulates steady 48 km/h highway driving (0.05g, stable orientation).
2. **Sudden Impact**: Simulates high-G head-on deceleration (4.2g impact).
3. **High Rotation**: Simulates vehicular spin (310°/s yaw rate).
4. **Possible Accident**: Triggers full crash physics, activates the 10-second verification countdown, sounds the buzzer, and demonstrates the emergency alert workflow.
5. **Reset Simulation**: Restores sensors to idle resting values.

---

## 6. Project Architecture & Communication Protocol

### REST API Endpoints:
- `GET /api/stream`: Server-Sent Events (SSE) live sensor telemetry stream.
- `POST /api/sensors`: Ingests JSON telemetry from ESP32 or Wokwi.
- `POST /api/accidents/verify`: Handles user confirmation (`SAFE` cancels alert; `CONFIRM` elevates to emergency).
- `POST /api/accidents/sos`: Manual SOS emergency button trigger.
- `GET /api/accidents/history`: Comprehensive audit trail of past incidents.
- `GET /api/hospitals/nearby`: Nearby trauma centers and emergency services registry.
- `GET /api/config` & `PUT /api/config`: Calibrate G-force thresholds and emergency contacts.
