# SADES – Smart Accident Detection & Emergency Response System

**Academic Capstone Project & Hackathon Entry**  
**Team Alert:** Anjali Nimse (Leader), Ojasvi Padol, Omkar Shinde, Sahil Pardeshi  
**Institution:** Amrutvahini College of Engineering, Sangamner  
**Department:** Computer Engineering  
**Domain:** Disaster Resilience, Public Health & Community Well-being  
**Theme:** Automotive Technology, Robotics and Automation  
**Wokwi Hardware Simulation:** [https://wokwi.com/projects/405361372814750721](https://wokwi.com/projects/405361372814750721)

---

## 1. Project Overview & Objective

SADES is a smart Internet-of-Things (IoT) vehicular accident detection and automated emergency response system designed to drastically reduce emergency response times—saving lives within the critical **Golden Hour Rescue Window** (the initial 60 minutes following severe vehicular trauma).

### The 5-Phase Automated Response Mechanism:
```
[1. DETECT]   --> [2. VERIFY]    --> [3. LOCATE]   --> [4. ALERT]   --> [5. RESPOND]
MPU6050           10s Verification    NEO-6M GPS        Automated SMS,   Nearby Trauma Center
Accel & Gyro      Countdown Window    Latitude/         Call & Email     & Highway Rescue 108
Trigger Shock     ("I'M SAFE" vs      Longitude         with Google      Dispatched
Threshold         Confirmation)       Coordinates       Maps Link        (Golden Hour)
```

1. **Accident Detection**: High-G impact or vehicular rollover triggers edge threshold detection on the ESP32.
2. **Accident Verification**: An audible buzzer sounds and a 10-second countdown runs on both the SSD1306 OLED in-vehicle screen and web dashboard. If the driver is unharmed, clicking **"I'M SAFE"** cancels the alert to prevent false alarms.
3. **Location Detection**: If 10 seconds expire or **"SEND EMERGENCY ALERT"** is pressed, the system locks the exact GPS coordinates (Latitude & Longitude) and vehicle speed.
4. **Emergency Alert**: Automated alerts (SMS, Voice Call, Email) containing Google Maps live navigation links and driver blood group are dispatched to designated emergency contacts.
5. **Emergency Response**: The alert is escalated to the SADES Central Department Console, trauma centers (e.g., Sangamner Civil Trauma Hospital, Tambe Hospital), and 108 Highway Ambulance dispatchers.

---

## 2. Quick Start: How to Run on Any Computer

### Prerequisites
- **Node.js** version 18.x, 20.x, or 22.x ([Download Node.js](https://nodejs.org))
- **npm** (comes bundled with Node.js) or **yarn** / **pnpm** / **bun**

### Installation & Launch Steps
```bash
# 1. Open terminal inside the project directory
cd sades-project

# 2. Install all dependencies
npm install

# 3. Launch the full-stack development server
npm run dev
```

The application will start on:
👉 **`http://localhost:3000`**

Open `http://localhost:3000` in your web browser (Chrome, Edge, Firefox, or Safari).

---

## 3. How to Upload This Project to GitHub

Follow these steps in your terminal to create a new GitHub repository:

```bash
# Step 1: Initialize Git in your project folder
git init

# Step 2: Add all project files
git add .

# Step 3: Create your initial commit
git commit -m "Initial commit: SADES IoT Accident Detection & Emergency Response System v6.0"

# Step 4: Rename default branch to main
git branch -M main

# Step 5: Link to your newly created GitHub repository
# (Replace YOUR_USERNAME and YOUR_REPO_NAME with your GitHub details)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Step 6: Push the project to GitHub
git push -u origin main
```

---

## 4. Hardware Simulation & Pinout Setup (Wokwi & ESP32)

All virtual hardware files are pre-configured in the `/hardware` folder:
- `hardware/esp32_firmware/sades_esp32_firmware.ino` (Arduino C++ sketch)
- `hardware/wokwi/diagram.json` (Wiring diagram for Wokwi)
- `hardware/wokwi/libraries.txt` (Required Arduino libraries)
- `hardware/WOKWI_VS_MOKXI_SIMULATOR_ANALYSIS.md` (Comparative technical analysis)

### Hardware Pin Connection Table
| Component | ESP32 Pin | Interface | Function |
| :--- | :--- | :--- | :--- |
| **MPU6050 SDA** | GPIO 21 | I2C Data | Accelerometer & Gyroscope reading |
| **MPU6050 SCL** | GPIO 22 | I2C Clock | I2C bus clock line |
| **SSD1306 OLED SDA** | GPIO 21 | I2C Data | 128x64 display screen |
| **SSD1306 OLED SCL** | GPIO 22 | I2C Clock | 128x64 display screen |
| **GPS NEO-6M TX** | GPIO 16 (RX2) | Serial UART | GPS coordinate reception |
| **GPS NEO-6M RX** | GPIO 17 (TX2) | Serial UART | GPS command transmission |
| **Piezo Buzzer (+)** | GPIO 25 | Digital Out | Collision & countdown alert tone |
| **Push Button (I'm Safe)** | GPIO 33 | Digital In (Pull-up) | Hardware false alarm cancellation |
| **VCC (All Sensors)** | 3.3V / 5V | Power | Power rail |
| **GND (All Sensors)** | GND | Ground | Common ground |

### Running in Wokwi Simulator
1. Open the project URL: [https://wokwi.com/projects/405361372814750721](https://wokwi.com/projects/405361372814750721)
2. Copy `hardware/esp32_firmware/sades_esp32_firmware.ino` into the code tab.
3. Copy `hardware/wokwi/diagram.json` into the `diagram.json` tab.
4. Click the green **Play** button to begin simulating.

---

## 5. System Features & Views

- **Driver Portal**: In-vehicle dashboard with live kinematic meters, GPS coordinates, 10s accident verification modal, and manual SOS trigger.
- **SADES Department Console**: Centralized dispatch desk for emergency command centers, hospital alert coordination, and 108 highway ambulance triage.
- **30-Day Analytics**: Interactive Recharts visualization showing accidents by time of day, hourly peak hazard windows, and diurnal period distributions along highway corridors.
- **Live Sensor Telemetry**: High-frequency streaming of 3-axis accelerometer, 3-axis gyroscope, resultant vector magnitude, and 3D vehicle orientation canvas.
- **Virtual Hardware Workbench**: Embedded virtual SSD1306 OLED screen emulator, MPU6050 simulation sliders, and real-time firmware code preview.
- **Geospatial Map**: Real-time Leaflet OpenStreetMap view with collision coordinates and nearby trauma center radar.

---

## 6. Academic Accreditation
- **Project Name:** SADES – Smart Accident Detection & Emergency Response System
- **College:** Amrutvahini College of Engineering, Sangamner (AVCOE)
- **Team Name:** Team Alert (AVPOLY)
- **Team Members:** Anjali Nimse, Ojasvi Padol, Omkar Shinde, Sahil Pardeshi
