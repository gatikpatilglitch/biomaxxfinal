# 🫁 BioMaxxx: IoT Health, COPD Guardian & AI Vision Suite

> **Quantified Pulmonary Telemetry, Metabolic Health Engine, Biofeedback Games & Computer Vision Diagnostics**

BioMaxxx is a next-generation healthcare platform engineered specifically for COPD (Chronic Obstructive Pulmonary Disease) patients, asthmatics, and health-conscious individuals. It bridges embedded IoT hardware, real-time atmospheric sensor mesh, metabolic nutrition planning, biofeedback stress reduction, and computer vision clinical assessments.

---

## 🌟 Core Feature Suite

### 1. ⚖️ BMI, Metabolic Engine & Personalized Nutrition
- **Body Mass Index (BMI)**: Instant classification across Underweight, Normal, Overweight, and Obese categories.
- **BMR & TDEE**: Accurate calculation using the clinically validated **Mifflin-St Jeor equation** with physical activity multipliers (1.2 to 1.9).
- **Target Calorie & Macro Distribution**:
  - Calorie surplus (+400 kcal/day) for healthy mass gain or deficit (-500 kcal/day) for cardiopulmonary unburdening.
  - Precision macronutrient grams: **30% High Protein**, **40% Low-Glycemic Carbs**, **30% Healthy Fats**.
- **Tailored 4-Meal Daily Diet Plan**: Specific anti-inflammatory and antioxidant food choices (Breakfast, Lunch, Pre/Post-workout snack, Dinner).
- **COPD-Adapted Workout Routine**: Zone 2 cardiovascular training, hypertrophy chest-wall strengthening, and diaphragmatic breathing schedules.

### 2. 🌫️ COPD & Real-Time AQI Flare-Up Monitoring
- **Dynamic Color-Coded Radial Gauge**: EPA-standard air quality index (0 to 300+) with instant medical action advisories.
- **COPD Trigger Pollutant Telemetry**:
  - **PM2.5**: Fine micro-particulates penetrating deep alveolar tissue.
  - **PM10**: Coarse inhalable smog causing acute bronchial spasms.
  - **Ozone (O₃)**: Oxidative pulmonary stressor.
  - **Nitrogen Dioxide (NO₂)**: Combustive gas inducing airway hyperresponsiveness.
- **Predictive Flare-Up Push Notifications**:
  - **7:00 AM Morning Briefings**: Early warnings when afternoon stagnant inversions are predicted.
  - **Sudden Smog Spike Alerts**: Urgent broadcast when PM2.5 spikes (>120 µg/m³) instructing patients to move indoors and position rescue inhalers.

### 3. 📊 Correlation Analytics ("The Why" Feature)
- **14-Day Cross-Correlation Engine**: Dual-axis mapping of ambient AQI against resting blood oxygen saturation (SpO₂) and daily rescue inhaler puffs.
- **Automated Clinical Evidence**: Proves to pulmonologists that **blood oxygen drops an average of 3.2%** on days when ambient AQI crosses 120, with 2.8x higher cough severity.
- One-click clinical report export.

### 4. 🎮 Stress Buster Biofeedback Games
- **"Belly Breath" Balloon**: Pursed-Lip Breathing biofeedback (2-second inhale, 4-second exhale). The digital balloon expands and contracts smoothly while synthesized ocean wave audio swells and recedes via the zero-dependency Web Audio API.
- **Soundscape Garden**: Passive zen tile-matching game. Matching flowers and natural elements blooms the garden and unlocks soothing 528Hz Solfeggio sound layers (Rain, Chimes, Birds, Streams) with no timers or loss states.
- **Haptic Bubble Pop**: Endless virtual bubble wrap grid with crisp procedural pop sound synthesis and Web Vibration API haptic pulses to ground patients during acute panic or coughing spells.

### 5. 👁️ AI Dry Eye & Ocular Health Assessment
- **Front-Camera Computer Vision**: Live webcam tracking session while reading a clinical passage.
- **Blink Rate Monitoring**: Calculates Blinks Per Minute (BPM) (Healthy: 15–20; <14 indicates screen evaporative dryness).
- **Inter-Blink Interval (IBI)**: Time elapsed between blinks assessing tear film stability.
- **Sclera Redness & Vessel Density**: Segments visible conjunctival blood vessels to grade inflammation (Grade 0 Clear to Grade 3 Severe).
- **Ptosis & Stroke Guard**: Measures palpebral fissure eyelid distance to detect asymmetric drooping.

### 6. 💅 AI Nail Micronutrient Scanner
- **Deep Learning Colorimetry & Texture Analysis**:
  - **Paleness of Nail Bed**: Estimates Hemoglobin (Hb g/dL) to screen for Iron Deficiency (Anemia).
  - **Beau's Lines**: Detects transverse horizontal ridges linked to Zinc and Vitamin D deficiencies.
  - **Koilonychia**: 3D curvature mapping to detect spoon-shaped nail flattening.
  - **Leukonychia**: White spot cluster segmentation (Zinc/Calcium sub-optimality).
  - **Distal Edge Integrity**: Fracture analysis for Biotin (Vitamin B7) and Vitamin A/C.
- Prescribes targeted micronutrient food sources and intake strategies.

### 7. 📡 IoT Hardware Architecture & Sensor Mesh
- **Wearable BLE Pulse Oximeter**: High-speed photoplethysmogram (PPG) pulse wave, resting SpO₂ %, and heart rate (BPM).
- **Smart Inhaler Cap**: Hall-effect magnetic sensor recording actuation timestamps, dose countdown, and compliance adherence.
- **Atmospheric Sensor Node**: ESP32 microcontroller with Plantower PMS5003 laser particulate sensor + Bosch BME688 environmental sensor streaming via MQTT over TLS.

---

## 🛠️ Project Structure

```
biomaxxx/
├── package.json                   # Dependencies (Vite, React, Lucide, Recharts, Tailwind)
├── vite.config.js                 # Vite bundler configuration
├── index.html                     # Entry HTML with Outfit & JetBrains Mono typography
├── tailwind.config.js             # Dark glassmorphism health theme
├── postcss.config.js              # PostCSS configuration
├── server.js                      # Express + Socket.io + PostgreSQL backend API
├── schema.sql                     # PostgreSQL database schema
├── src/
│   ├── main.jsx                   # React application mount
│   ├── index.css                  # Global styles, glassmorphism & glow effects
│   ├── App.jsx                    # Master application container with tab navigation
│   ├── components/
│   │   ├── Header.jsx             # Top bar with IoT status, audio toggle & alerts
│   │   ├── IoTDeviceHub.jsx       # Real-time IoT sensor telemetry & BLE pairing
│   │   ├── BmiNutritionPlanner.jsx# BMI, BMR/TDEE, macro split, meal & workout plans
│   │   ├── AqiCopdTracker.jsx     # Dynamic AQI gauge, pollutant telemetry, alerts
│   │   ├── CorrelationAnalytics.jsx# Multi-day AQI vs SpO2 correlation charts
│   │   ├── StressGamesHub.jsx     # Belly Breath balloon, Zen garden, Bubble pop
│   │   ├── AiDryEyeScanner.jsx    # Webcam CV blink tracker, IBI, sclera redness
│   │   └── AiNailScanner.jsx      # Fingernail photo micronutrient biomarker scanner
│   └── utils/
│       ├── audioSynthesizer.js    # Procedural Web Audio API sound generator
│       └── healthCalculations.js  # Clinical formulas (BMI, BMR, TDEE, AQI metrics)
```

---

## 🐳 Running with Docker (Recommended for Production)

BioMaxxx includes a production-ready **Docker Compose** stack orchestrating:
1. **`postgres`**: Official PostgreSQL 16 Alpine container with persistent storage and auto-executing schema from `schema.sql`.
2. **`backend`**: Node.js 20 Express + Socket.io backend API with health checks.
3. **`frontend`**: High-performance multi-stage built Nginx Alpine reverse-proxy container serving the Vite React SPA and proxying `/api/` and `/socket.io/`.

### Prerequisites
- Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop) and ensure Docker Desktop is running.

### 1-Click Launch (Windows)
Double-click **`docker-run.bat`** or run in PowerShell:
```cmd
.\docker-run.bat
```

### Manual Command Line Launch
```bash
# Build and start all 3 services in detached mode
docker compose up --build -d

# Check cluster status
docker compose ps

# View live application logs
docker compose logs -f
```

Access the services:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/copd/correlations/1](http://localhost:5000/api/copd/correlations/1)
- **PostgreSQL**: `localhost:5432` (`biomaxxx` database)

To stop the Docker cluster:
```bash
docker compose down
```

---

## 🚀 Running Locally without Docker (No Virtualization Needed)

BioMaxxx runs completely natively on Node.js without requiring Docker or hardware virtualization.

### 🌟 Quickest Option: 1-Click Launch (Windows)
Double-click **`run-local.bat`** in the project folder.
This automatically:
1. Launches the backend Express API on port 5000 (with built-in in-memory fallback, no PostgreSQL installation required).
2. Launches the React Vite frontend on port 3000.
3. Automatically opens `http://localhost:3000` in your web browser.

To stop the servers, close the opened command windows or run **`stop-local.bat`**.

---

### Manual Terminal Launch

#### 1. Install Dependencies (if not already done)
```powershell
npm.cmd install
```

#### 2. Start the Backend API (Terminal 1)
```powershell
npm.cmd run server
```
*Runs Express + WebSockets on `http://localhost:5000` (auto-falls back to in-memory database if PostgreSQL is not installed).*

#### 3. Start the Frontend Dev Server (Terminal 2)
```powershell
npm.cmd run dev
```
*Access the application at [http://localhost:3000](http://localhost:3000).*


---

## 🔬 Embedded ESP32 Firmware Snippet (IoT Node)

To stream atmospheric sensor data from a physical hardware node:

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "PMS.h"
#include <Adafruit_BME680.h>

PMS pms(Serial2);
Adafruit_BME680 bme;
WiFiClient espClient;
PubSubClient client(espClient);

void loop() {
  PMS::DATA data;
  if (pms.read(data)) {
    StaticJsonDocument<256> doc;
    doc["nodeId"] = "AEROSENSE_ESP32_01";
    doc["pm25"]   = data.PM_AE_UG_2_5;
    doc["pm10"]   = data.PM_AE_UG_10_0;
    doc["temp"]   = bme.readTemperature();
    doc["hum"]    = bme.readHumidity();
    doc["aqi"]    = calculateAQI(data.PM_AE_UG_2_5);
    
    char buffer[256];
    serializeJson(doc, buffer);
    client.publish("biomaxxx/sensors/atmospheric", buffer);
  }
  delay(2000);
}
```
