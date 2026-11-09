import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  evaluateAccident,
  DEFAULT_THRESHOLDS,
  SensorReading,
  DetectionThresholds,
  AccidentEvaluation,
} from './src/utils/accidentDetection.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory Database Store for SADES
export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  notifySms: boolean;
  notifyCall: boolean;
  notifyEmail: boolean;
}

export interface AccidentEvent {
  id: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  status: 'PENDING_VERIFICATION' | 'CONFIRMED' | 'FALSE_ALARM' | 'MANUAL_SOS';
  severity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  triggerReason: string;
  confidenceScore: number;
  source: 'ESP32_HARDWARE' | 'WOKWI_SIMULATOR' | 'DEMO_MODE';
  sensorSnapshot: {
    ax: number;
    ay: number;
    az: number;
    gx: number;
    gy: number;
    gz: number;
    accelMagnitude: number;
    gyroMagnitude: number;
    roll: number;
    pitch: number;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
    speedKmh: number;
    satellites: number;
    accuracyMeters: number;
    isSimulated: boolean;
  };
  verification: {
    countdownSeconds: number;
    verifiedBy: 'USER_SAFE_BUTTON' | 'USER_CONFIRMED' | 'TIMEOUT_AUTO_DISPATCH' | 'MANUAL_SOS' | null;
    resolvedAt: number | null;
  };
  notificationsSent: {
    smsCount: number;
    emailCount: number;
    hospitalAlerted: boolean;
    dispatchTime: number | null;
    recipients: string[];
  };
}

// Default System State
// Location centered around Amrutvahini College of Engineering, Sangamner, Maharashtra (from PPT)
let userProfile = {
  fullName: 'Omkar Shinde',
  email: 'omkarshinde.cse@gmail.com',
  phone: '+91 98765 43210',
  bloodGroup: 'B+',
  vehicleNumber: 'MH-17-CS-2026',
  vehicleModel: 'KTM Duke 390 / Tata Nexon EV',
  college: 'Amrutvahini College of Engineering, Sangamner',
  team: 'Team Alert (SADES 6.0)',
};

let emergencyContacts: EmergencyContact[] = [
  {
    id: 'c1',
    name: 'Anjali Nimse (Team Leader)',
    relationship: 'Project Lead / Emergency Contact',
    phone: '+91 94220 11223',
    email: 'anjali.nimse@avcoe.edu.in',
    notifySms: true,
    notifyCall: true,
    notifyEmail: true,
  },
  {
    id: 'c2',
    name: 'Family Emergency Contact',
    relationship: 'Parent / Guardian',
    phone: '+91 98223 44556',
    email: 'parent.contact@gmail.com',
    notifySms: true,
    notifyCall: true,
    notifyEmail: false,
  },
  {
    id: 'c3',
    name: 'National Emergency Response (112)',
    relationship: 'Emergency Medical & Police',
    phone: '112',
    email: 'dispatch@emergency112.gov.in',
    notifySms: true,
    notifyCall: true,
    notifyEmail: true,
  },
];

let detectionThresholds: DetectionThresholds = {
  ...DEFAULT_THRESHOLDS,
};

// Current Live Telemetry State
let currentSensorState = {
  deviceId: 'SADES-ESP32-01',
  connected: true,
  lastHeartbeat: Date.now(),
  source: 'DEMO_MODE' as 'ESP32_HARDWARE' | 'WOKWI_SIMULATOR' | 'DEMO_MODE',
  reading: {
    ax: 0.04,
    ay: 0.06,
    az: 1.01,
    gx: 0.8,
    gy: -1.2,
    gz: 0.4,
    timestamp: Date.now(),
  } as SensorReading,
  tempC: 28.5,
  location: {
    lat: 19.6138,
    lng: 74.2057,
    address: 'Amrutnagar, Ghulewadi, Sangamner, Maharashtra 422608',
    speedKmh: 42.5,
    satellites: 9,
    accuracyMeters: 2.8,
    isSimulated: true,
  },
};

// Active Accident Verification State
let activeVerification: {
  event: AccidentEvent | null;
  countdownTimer: NodeJS.Timeout | null;
  remainingSeconds: number;
} = {
  event: null,
  countdownTimer: null,
  remainingSeconds: 10,
};

// Helper function to create timestamped historical events within last 30 days
function generateSeedHistory(): AccidentEvent[] {
  const now = Date.now();
  const dayMs = 86400000;

  const rawSeeds: Array<{
    daysAgo: number;
    hour: number;
    minute: number;
    status: 'CONFIRMED' | 'FALSE_ALARM' | 'MANUAL_SOS';
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    reason: string;
    accel: number;
    roll: number;
    location: string;
    verifiedBy: 'USER_SAFE_BUTTON' | 'USER_CONFIRMED' | 'TIMEOUT_AUTO_DISPATCH' | 'MANUAL_SOS';
  }> = [
    // Late Night & Early Dawn (00:00 - 05:59)
    { daysAgo: 3, hour: 1, minute: 15, status: 'CONFIRMED', severity: 'CRITICAL', reason: 'High-speed rollover & highway barrier crash', accel: 4.8, roll: 85, location: 'NH-50 Ghat Section, Sangamner', verifiedBy: 'TIMEOUT_AUTO_DISPATCH' },
    { daysAgo: 7, hour: 2, minute: 40, status: 'CONFIRMED', severity: 'HIGH', reason: 'Severe head-on collision at bypass intersection', accel: 3.9, roll: 24, location: 'Pune-Nashik Highway Bypass, Sangamner', verifiedBy: 'TIMEOUT_AUTO_DISPATCH' },
    { daysAgo: 14, hour: 4, minute: 10, status: 'FALSE_ALARM', severity: 'LOW', reason: 'Unpaved road construction bump impact', accel: 2.2, roll: 8, location: 'Ghulewadi Rural Link Road', verifiedBy: 'USER_SAFE_BUTTON' },
    { daysAgo: 21, hour: 3, minute: 30, status: 'CONFIRMED', severity: 'HIGH', reason: 'Night freight truck side-impact collision', accel: 3.7, roll: 35, location: 'Akole Road Junction, Sangamner', verifiedBy: 'USER_CONFIRMED' },

    // Morning Peak (06:00 - 11:59)
    { daysAgo: 1, hour: 8, minute: 45, status: 'CONFIRMED', severity: 'MODERATE', reason: 'Two-wheeler skid during morning commute', accel: 2.9, roll: 68, location: 'College Road, near AVCOE Campus', verifiedBy: 'USER_CONFIRMED' },
    { daysAgo: 5, hour: 9, minute: 20, status: 'FALSE_ALARM', severity: 'LOW', reason: 'Speed breaker abrupt deceleration', accel: 2.1, roll: 4, location: 'Amrutnagar Main Avenue', verifiedBy: 'USER_SAFE_BUTTON' },
    { daysAgo: 9, hour: 8, minute: 15, status: 'CONFIRMED', severity: 'HIGH', reason: 'Multi-vehicle chain collision in fog', accel: 3.8, roll: 15, location: 'NH-50 Sangamner North Tollway', verifiedBy: 'TIMEOUT_AUTO_DISPATCH' },
    { daysAgo: 12, hour: 10, minute: 30, status: 'MANUAL_SOS', severity: 'HIGH', reason: 'Manual SOS: Engine fire and brake malfunction', accel: 1.0, roll: 0, location: 'Sangamner Bus Stand Road', verifiedBy: 'MANUAL_SOS' },
    { daysAgo: 18, hour: 9, minute: 50, status: 'CONFIRMED', severity: 'MODERATE', reason: 'Bicycle crossover side-swipe collision', accel: 2.7, roll: 55, location: 'Ghulewadi Market Square', verifiedBy: 'USER_CONFIRMED' },

    // Afternoon Transit (12:00 - 17:59)
    { daysAgo: 2, hour: 14, minute: 28, status: 'FALSE_ALARM', severity: 'LOW', reason: 'Sudden deceleration over highway speed bump (2.4g)', accel: 2.4, roll: 7, location: 'NH-50 Pune-Nashik Highway, Sangamner Bypass', verifiedBy: 'USER_SAFE_BUTTON' },
    { daysAgo: 6, hour: 15, minute: 12, status: 'CONFIRMED', severity: 'MODERATE', reason: 'Rear-end bumper impact at traffic light', accel: 2.8, roll: 6, location: 'Sangamner City Center Signal', verifiedBy: 'USER_CONFIRMED' },
    { daysAgo: 11, hour: 13, minute: 45, status: 'FALSE_ALARM', severity: 'LOW', reason: 'Pothole impact on rural bridge approach', accel: 2.3, roll: 5, location: 'Pravara River Bridge approach', verifiedBy: 'USER_SAFE_BUTTON' },
    { daysAgo: 16, hour: 16, minute: 20, status: 'CONFIRMED', severity: 'HIGH', reason: 'Overtaking collision with utility van', accel: 3.6, roll: 42, location: 'Sangamner-Sinnar Highway Stretch', verifiedBy: 'TIMEOUT_AUTO_DISPATCH' },
    { daysAgo: 24, hour: 14, minute: 50, status: 'FALSE_ALARM', severity: 'LOW', reason: 'Emergency braking to avoid stray animal', accel: 2.5, roll: 9, location: 'Amrutnagar Ring Road', verifiedBy: 'USER_SAFE_BUTTON' },

    // Evening & Night Peak (18:00 - 23:59) - Highest incidence rate
    { daysAgo: 2, hour: 18, minute: 35, status: 'CONFIRMED', severity: 'HIGH', reason: 'Evening rush-hour intersection broadside crash', accel: 3.8, roll: 38, location: 'Sangamner Bypass NH-50', verifiedBy: 'TIMEOUT_AUTO_DISPATCH' },
    { daysAgo: 4, hour: 19, minute: 15, status: 'CONFIRMED', severity: 'CRITICAL', reason: 'Severe head-on collision at high speed', accel: 4.5, roll: 75, location: 'Ghat section curve near Chandapuri', verifiedBy: 'TIMEOUT_AUTO_DISPATCH' },
    { daysAgo: 8, hour: 20, minute: 5, status: 'CONFIRMED', severity: 'HIGH', reason: 'Rollover into drainage ditch off highway', accel: 3.9, roll: 82, location: 'NH-50 near Ghulewadi Phata', verifiedBy: 'TIMEOUT_AUTO_DISPATCH' },
    { daysAgo: 10, hour: 18, minute: 50, status: 'FALSE_ALARM', severity: 'LOW', reason: 'Hard curb impact during parallel parking', accel: 2.0, roll: 3, location: 'Sangamner Market Street', verifiedBy: 'USER_SAFE_BUTTON' },
    { daysAgo: 13, hour: 21, minute: 30, status: 'CONFIRMED', severity: 'CRITICAL', reason: 'High impact collision & vehicle inversion', accel: 4.6, roll: 88, location: 'Pune-Nashik Express corridor', verifiedBy: 'TIMEOUT_AUTO_DISPATCH' },
    { daysAgo: 17, hour: 19, minute: 40, status: 'MANUAL_SOS', severity: 'HIGH', reason: 'Manual SOS: Vehicle rollover assistance', accel: 1.0, roll: 0, location: 'Near AVCOE Engineering Hostel', verifiedBy: 'MANUAL_SOS' },
    { daysAgo: 20, hour: 20, minute: 25, status: 'CONFIRMED', severity: 'HIGH', reason: 'Blind turn collision during heavy rain', accel: 3.7, roll: 30, location: 'Loni-Sangamner Link Road', verifiedBy: 'USER_CONFIRMED' },
    { daysAgo: 25, hour: 22, minute: 10, status: 'CONFIRMED', severity: 'CRITICAL', reason: 'Night highway median barrier crash', accel: 4.4, roll: 70, location: 'NH-50 Sangamner South Corridor', verifiedBy: 'TIMEOUT_AUTO_DISPATCH' },
    { daysAgo: 28, hour: 23, minute: 5, status: 'CONFIRMED', severity: 'HIGH', reason: 'Rear impact by heavy commercial vehicle', accel: 3.9, roll: 25, location: 'Sangamner Industrial Estate road', verifiedBy: 'TIMEOUT_AUTO_DISPATCH' },
  ];

  return rawSeeds.map((seed, idx) => {
    const timestamp = now - seed.daysAgo * dayMs + (seed.hour * 3600000 + seed.minute * 60000);
    const dateObj = new Date(timestamp);
    const id = `EVT-2026-${(100 + idx).toString()}`;

    return {
      id,
      timestamp,
      dateStr: dateObj.toLocaleDateString(),
      timeStr: `${seed.hour.toString().padStart(2, '0')}:${seed.minute.toString().padStart(2, '0')}:00`,
      status: seed.status,
      severity: seed.severity,
      triggerReason: seed.reason,
      confidenceScore: seed.severity === 'CRITICAL' ? 98 : seed.severity === 'HIGH' ? 88 : seed.severity === 'MODERATE' ? 74 : 45,
      source: 'WOKWI_SIMULATOR',
      sensorSnapshot: {
        ax: Number((seed.accel * 0.7).toFixed(2)),
        ay: Number((seed.accel * 0.4).toFixed(2)),
        az: Number((seed.accel * 0.5).toFixed(2)),
        gx: Number((seed.roll * 1.5).toFixed(1)),
        gy: Number((seed.roll * 1.2).toFixed(1)),
        gz: 25.0,
        accelMagnitude: seed.accel,
        gyroMagnitude: Number((seed.roll * 2.0).toFixed(1)),
        roll: seed.roll,
        pitch: Number((seed.roll * 0.3).toFixed(1)),
      },
      location: {
        lat: 19.6105 + (Math.random() - 0.5) * 0.03,
        lng: 74.2012 + (Math.random() - 0.5) * 0.03,
        address: seed.location,
        speedKmh: seed.status === 'CONFIRMED' ? 0 : 35.0,
        satellites: 8,
        accuracyMeters: 3.0,
        isSimulated: true,
      },
      verification: {
        countdownSeconds: 10,
        verifiedBy: seed.verifiedBy,
        resolvedAt: timestamp + 6500,
      },
      notificationsSent: {
        smsCount: seed.status === 'CONFIRMED' || seed.status === 'MANUAL_SOS' ? 3 : 0,
        emailCount: seed.status === 'CONFIRMED' || seed.status === 'MANUAL_SOS' ? 2 : 0,
        hospitalAlerted: seed.status === 'CONFIRMED' || seed.status === 'MANUAL_SOS',
        dispatchTime: seed.status === 'CONFIRMED' || seed.status === 'MANUAL_SOS' ? timestamp + 8000 : null,
        recipients: emergencyContacts.map((c) => `${c.name} (${c.phone})`),
      },
    };
  });
}

// Historical Accident Logs Seeded with realistic 30-day entries
let accidentHistory: AccidentEvent[] = generateSeedHistory();

// Helper: Broadcast SSE Clients
const sseClients: Response[] = [];

function broadcastState() {
  const payload = JSON.stringify({
    type: 'TELEMETRY_UPDATE',
    sensors: currentSensorState,
    evaluation: evaluateAccident(currentSensorState.reading, detectionThresholds),
    activeVerification: activeVerification.event
      ? {
          event: activeVerification.event,
          remainingSeconds: activeVerification.remainingSeconds,
        }
      : null,
  });

  sseClients.forEach((client) => {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      // client disconnected
    }
  });
}

// Trigger Accident Verification Workflow
function triggerAccidentWorkflow(
  evaluation: AccidentEvaluation,
  source: 'ESP32_HARDWARE' | 'WOKWI_SIMULATOR' | 'DEMO_MODE'
) {
  // If already in verification or confirmed, don't re-trigger within countdown
  if (activeVerification.event && activeVerification.event.status === 'PENDING_VERIFICATION') {
    return activeVerification.event;
  }

  const now = Date.now();
  const eventId = `EVT-SADES-${now.toString().slice(-6)}`;
  const dateObj = new Date(now);

  const newEvent: AccidentEvent = {
    id: eventId,
    timestamp: now,
    dateStr: dateObj.toLocaleDateString(),
    timeStr: dateObj.toLocaleTimeString(),
    status: 'PENDING_VERIFICATION',
    severity: evaluation.severity,
    triggerReason: evaluation.triggerReason,
    confidenceScore: evaluation.confidenceScore,
    source,
    sensorSnapshot: {
      ax: currentSensorState.reading.ax,
      ay: currentSensorState.reading.ay,
      az: currentSensorState.reading.az,
      gx: currentSensorState.reading.gx,
      gy: currentSensorState.reading.gy,
      gz: currentSensorState.reading.gz,
      accelMagnitude: evaluation.processedData.accelMagnitude,
      gyroMagnitude: evaluation.processedData.gyroMagnitude,
      roll: evaluation.processedData.roll,
      pitch: evaluation.processedData.pitch,
    },
    location: { ...currentSensorState.location },
    verification: {
      countdownSeconds: 10,
      verifiedBy: null,
      resolvedAt: null,
    },
    notificationsSent: {
      smsCount: 0,
      emailCount: 0,
      hospitalAlerted: false,
      dispatchTime: null,
      recipients: [],
    },
  };

  // Clear existing timer if any
  if (activeVerification.countdownTimer) {
    clearInterval(activeVerification.countdownTimer);
  }

  activeVerification.event = newEvent;
  activeVerification.remainingSeconds = 10;

  // Start 10-second countdown interval
  activeVerification.countdownTimer = setInterval(() => {
    activeVerification.remainingSeconds -= 1;
    broadcastState();

    if (activeVerification.remainingSeconds <= 0) {
      // Countdown finished without user pressing I'M SAFE!
      // Automatically confirm accident & dispatch emergency alert!
      confirmAccidentEvent('TIMEOUT_AUTO_DISPATCH');
    }
  }, 1000);

  broadcastState();
  return newEvent;
}

// Confirm Accident and Dispatch Emergency Alert
function confirmAccidentEvent(
  verifiedBy: 'USER_CONFIRMED' | 'TIMEOUT_AUTO_DISPATCH' | 'MANUAL_SOS'
) {
  if (activeVerification.countdownTimer) {
    clearInterval(activeVerification.countdownTimer);
    activeVerification.countdownTimer = null;
  }

  if (!activeVerification.event) return;

  const event = activeVerification.event;
  event.status = verifiedBy === 'MANUAL_SOS' ? 'MANUAL_SOS' : 'CONFIRMED';
  event.verification.verifiedBy = verifiedBy;
  event.verification.resolvedAt = Date.now();

  // Simulate Dispatching Notifications to Contacts
  event.notificationsSent = {
    smsCount: emergencyContacts.filter((c) => c.notifySms).length,
    emailCount: emergencyContacts.filter((c) => c.notifyEmail).length,
    hospitalAlerted: true,
    dispatchTime: Date.now(),
    recipients: emergencyContacts.map((c) => `${c.name} (${c.phone})`),
  };

  // Add to permanent history log (prepend latest)
  accidentHistory.unshift({ ...event });

  broadcastState();
}

// Dismiss as False Alarm ("I'M SAFE" button)
function dismissFalseAlarm() {
  if (activeVerification.countdownTimer) {
    clearInterval(activeVerification.countdownTimer);
    activeVerification.countdownTimer = null;
  }

  if (!activeVerification.event) return null;

  const event = activeVerification.event;
  event.status = 'FALSE_ALARM';
  event.verification.verifiedBy = 'USER_SAFE_BUTTON';
  event.verification.resolvedAt = Date.now();

  accidentHistory.unshift({ ...event });
  activeVerification.event = null;
  activeVerification.remainingSeconds = 0;

  broadcastState();
  return event;
}

// Periodic background telemetry drift when in DEMO mode to simulate live sensor stream
setInterval(() => {
  if (
    currentSensorState.source === 'DEMO_MODE' &&
    (!activeVerification.event || activeVerification.event.status !== 'PENDING_VERIFICATION')
  ) {
    // Subtle normal road vibration noise
    const noise = () => (Math.random() - 0.5) * 0.04;
    currentSensorState.reading = {
      ax: Number((0.02 + noise()).toFixed(3)),
      ay: Number((-0.03 + noise()).toFixed(3)),
      az: Number((1.0 + noise()).toFixed(3)),
      gx: Number((noise() * 5).toFixed(2)),
      gy: Number((noise() * 5).toFixed(2)),
      gz: Number((noise() * 3).toFixed(2)),
      timestamp: Date.now(),
    };
    currentSensorState.lastHeartbeat = Date.now();
    broadcastState();
  }
}, 1000);

// --- REST API ROUTES ---

// Server-Sent Events endpoint for live real-time dashboard telemetry
app.get('/api/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  // Send initial state immediately
  res.write(
    `data: ${JSON.stringify({
      type: 'INITIAL_STATE',
      sensors: currentSensorState,
      evaluation: evaluateAccident(currentSensorState.reading, detectionThresholds),
      activeVerification: activeVerification.event
        ? {
            event: activeVerification.event,
            remainingSeconds: activeVerification.remainingSeconds,
          }
        : null,
      profile: userProfile,
      contacts: emergencyContacts,
      thresholds: detectionThresholds,
    })}\n\n`
  );

  req.on('close', () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// Device / System Status
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    system: 'SADES 6.0 Online',
    version: '1.0.0',
    device: {
      id: currentSensorState.deviceId,
      connected: Date.now() - currentSensorState.lastHeartbeat < 15000,
      source: currentSensorState.source,
      lastHeartbeat: currentSensorState.lastHeartbeat,
    },
    activeVerification: activeVerification.event ? true : false,
    historyCount: accidentHistory.length,
  });
});

// Get Latest Sensor Reading
app.get('/api/sensors/latest', (req: Request, res: Response) => {
  const evaluation = evaluateAccident(currentSensorState.reading, detectionThresholds);
  res.json({
    sensors: currentSensorState,
    evaluation,
  });
});

// Ingest Sensor Data from Virtual ESP32 / Wokwi / Hardware
app.post('/api/sensors', (req: Request, res: Response) => {
  const { ax, ay, az, gx, gy, gz, temp, lat, lng, speed, sats, source, device_id } = req.body;

  if (ax === undefined || ay === undefined || az === undefined) {
    res.status(400).json({ error: 'Missing required accelerometer ax, ay, az fields' });
    return;
  }

  const reading: SensorReading = {
    ax: Number(ax),
    ay: Number(ay),
    az: Number(az),
    gx: Number(gx ?? 0),
    gy: Number(gy ?? 0),
    gz: Number(gz ?? 0),
    timestamp: Date.now(),
  };

  currentSensorState.reading = reading;
  currentSensorState.deviceId = device_id || currentSensorState.deviceId;
  currentSensorState.lastHeartbeat = Date.now();
  currentSensorState.source = source || 'WOKWI_SIMULATOR';

  if (temp !== undefined) currentSensorState.tempC = Number(temp);
  if (lat !== undefined && lng !== undefined) {
    currentSensorState.location.lat = Number(lat);
    currentSensorState.location.lng = Number(lng);
    currentSensorState.location.isSimulated = source !== 'PHYSICAL_GPS';
  }
  if (speed !== undefined) currentSensorState.location.speedKmh = Number(speed);
  if (sats !== undefined) currentSensorState.location.satellites = Number(sats);

  // Evaluate accident detection algorithm
  const evaluation = evaluateAccident(reading, detectionThresholds);

  if (evaluation.isAccidentSuspected) {
    triggerAccidentWorkflow(evaluation, currentSensorState.source);
  }

  broadcastState();

  res.json({
    success: true,
    evaluation,
    activeVerification: activeVerification.event ? true : false,
  });
});

// Accident Verification Endpoint ("I'M SAFE" or "SEND EMERGENCY ALERT")
app.post('/api/accidents/verify', (req: Request, res: Response) => {
  const { action } = req.body; // 'SAFE' or 'CONFIRM'

  if (action === 'SAFE') {
    const dismissed = dismissFalseAlarm();
    res.json({
      success: true,
      message: 'Accident alert cancelled. Logged as false alarm.',
      event: dismissed,
    });
    return;
  }

  if (action === 'CONFIRM') {
    confirmAccidentEvent('USER_CONFIRMED');
    res.json({
      success: true,
      message: 'Emergency confirmed. Emergency responders and contacts notified.',
      event: activeVerification.event,
    });
    return;
  }

  res.status(400).json({ error: 'Invalid verification action. Must be SAFE or CONFIRM.' });
});

// Manual SOS Button
app.post('/api/accidents/sos', (req: Request, res: Response) => {
  // Clear any pending verification countdown timer
  if (activeVerification.countdownTimer) {
    clearInterval(activeVerification.countdownTimer);
    activeVerification.countdownTimer = null;
  }

  const now = Date.now();
  const eventId = `EVT-SOS-${now.toString().slice(-6)}`;
  const dateObj = new Date(now);

  const sosEvent: AccidentEvent = {
    id: eventId,
    timestamp: now,
    dateStr: dateObj.toLocaleDateString(),
    timeStr: dateObj.toLocaleTimeString(),
    status: 'MANUAL_SOS',
    severity: 'HIGH',
    triggerReason: 'Manual SOS triggered by vehicle operator',
    confidenceScore: 100,
    source: currentSensorState.source,
    sensorSnapshot: {
      ax: currentSensorState.reading.ax,
      ay: currentSensorState.reading.ay,
      az: currentSensorState.reading.az,
      gx: currentSensorState.reading.gx,
      gy: currentSensorState.reading.gy,
      gz: currentSensorState.reading.gz,
      accelMagnitude: 1.0,
      gyroMagnitude: 0,
      roll: 0,
      pitch: 0,
    },
    location: { ...currentSensorState.location },
    verification: {
      countdownSeconds: 0,
      verifiedBy: 'MANUAL_SOS',
      resolvedAt: now,
    },
    notificationsSent: {
      smsCount: emergencyContacts.filter((c) => c.notifySms).length,
      emailCount: emergencyContacts.filter((c) => c.notifyEmail).length,
      hospitalAlerted: true,
      dispatchTime: now,
      recipients: emergencyContacts.map((c) => `${c.name} (${c.phone})`),
    },
  };

  activeVerification.event = sosEvent;
  activeVerification.remainingSeconds = 0;
  accidentHistory.unshift({ ...sosEvent });
  broadcastState();

  res.json({
    success: true,
    message: 'Manual SOS triggered successfully.',
    event: sosEvent,
  });
});

// Dismiss / Stand Down Active Emergency or SOS
app.post('/api/accidents/dismiss', (req: Request, res: Response) => {
  if (activeVerification.countdownTimer) {
    clearInterval(activeVerification.countdownTimer);
    activeVerification.countdownTimer = null;
  }
  activeVerification.event = null;
  activeVerification.remainingSeconds = 0;
  broadcastState();

  res.json({
    success: true,
    message: 'Active emergency or SOS stood down and cleared.',
  });
});

// Accident History
app.get('/api/accidents/history', (req: Request, res: Response) => {
  res.json({
    total: accidentHistory.length,
    events: accidentHistory,
  });
});

// Clear History
app.delete('/api/accidents/history', (req: Request, res: Response) => {
  accidentHistory = [];
  res.json({ success: true, message: 'Accident history cleared.' });
});

// Config: Thresholds, Profile, Emergency Contacts
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    profile: userProfile,
    contacts: emergencyContacts,
    thresholds: detectionThresholds,
  });
});

app.put('/api/config', (req: Request, res: Response) => {
  const { profile, contacts, thresholds } = req.body;
  if (profile) userProfile = { ...userProfile, ...profile };
  if (contacts) emergencyContacts = contacts;
  if (thresholds) detectionThresholds = { ...detectionThresholds, ...thresholds };

  broadcastState();
  res.json({
    success: true,
    profile: userProfile,
    contacts: emergencyContacts,
    thresholds: detectionThresholds,
  });
});

// Demo Mode Preset Triggers
app.post('/api/simulator/trigger', (req: Request, res: Response) => {
  const { preset } = req.body;

  currentSensorState.source = 'DEMO_MODE';
  currentSensorState.lastHeartbeat = Date.now();

  switch (preset) {
    case 'NORMAL_MOVEMENT': {
      currentSensorState.reading = {
        ax: 0.05,
        ay: -0.04,
        az: 1.02,
        gx: 1.2,
        gy: 0.8,
        gz: 0.3,
        timestamp: Date.now(),
      };
      currentSensorState.location.speedKmh = 48.0;
      if (activeVerification.countdownTimer) {
        clearInterval(activeVerification.countdownTimer);
        activeVerification.countdownTimer = null;
      }
      activeVerification.event = null;
      activeVerification.remainingSeconds = 0;
      break;
    }

    case 'SUDDEN_IMPACT': {
      // 4.2g Deceleration / Head-on collision
      currentSensorState.reading = {
        ax: 3.8,
        ay: 0.6,
        az: 1.7,
        gx: 35.0,
        gy: 42.0,
        gz: 18.0,
        timestamp: Date.now(),
      };
      currentSensorState.location.speedKmh = 0.0; // Sudden stop
      const evaluation = evaluateAccident(currentSensorState.reading, detectionThresholds);
      triggerAccidentWorkflow(evaluation, 'DEMO_MODE');
      break;
    }

    case 'HIGH_ROTATION': {
      // 320 deg/s spin / yaw drift
      currentSensorState.reading = {
        ax: 1.2,
        ay: 1.8,
        az: 0.9,
        gx: 110.0,
        gy: 140.0,
        gz: 310.0,
        timestamp: Date.now(),
      };
      const evaluation = evaluateAccident(currentSensorState.reading, detectionThresholds);
      triggerAccidentWorkflow(evaluation, 'DEMO_MODE');
      break;
    }

    case 'POSSIBLE_ACCIDENT': {
      // Full Critical Crash: High G-force (4.6g) + Rollover (82 deg roll) + Spin
      currentSensorState.reading = {
        ax: 3.9,
        ay: 2.4,
        az: 0.4,
        gx: 180.0,
        gy: 210.0,
        gz: 95.0,
        timestamp: Date.now(),
      };
      currentSensorState.location.speedKmh = 0.0;
      const evaluation = evaluateAccident(currentSensorState.reading, detectionThresholds);
      triggerAccidentWorkflow(evaluation, 'DEMO_MODE');
      break;
    }

    case 'RESET': {
      currentSensorState.reading = {
        ax: 0.01,
        ay: 0.02,
        az: 1.0,
        gx: 0.0,
        gy: 0.0,
        gz: 0.0,
        timestamp: Date.now(),
      };
      currentSensorState.location.speedKmh = 40.0;
      if (activeVerification.countdownTimer) {
        clearInterval(activeVerification.countdownTimer);
        activeVerification.countdownTimer = null;
      }
      activeVerification.event = null;
      activeVerification.remainingSeconds = 0;
      break;
    }

    default:
      res.status(400).json({ error: 'Unknown preset' });
      return;
  }

  broadcastState();
  res.json({
    success: true,
    preset,
    reading: currentSensorState.reading,
    activeVerification: activeVerification.event ? true : false,
  });
});

// Nearby Emergency Medical Facilities & Police Dispatch Centers (Sangamner & Highway Area)
app.get('/api/hospitals/nearby', (req: Request, res: Response) => {
  res.json([
    {
      id: 'hosp-1',
      name: 'Amrutvahini Rural Hospital & Trauma Centre',
      type: 'Trauma & Emergency Care',
      distanceKm: 1.2,
      responseTimeMin: 4,
      phone: '+91 2425 259000',
      status: 'PRE_ALERTED',
      lat: 19.6145,
      lng: 74.2089,
    },
    {
      id: 'hosp-2',
      name: 'Sangamner Sub-District Hospital (Civil)',
      type: 'Government Civil Hospital',
      distanceKm: 3.4,
      responseTimeMin: 8,
      phone: '+91 2425 225102',
      status: 'AVAILABLE',
      lat: 19.5788,
      lng: 74.2125,
    },
    {
      id: 'hosp-3',
      name: 'National Highway Highway Patrol & Rescue 108',
      type: 'Ambulance & Highway Police',
      distanceKm: 2.1,
      responseTimeMin: 6,
      phone: '108',
      status: 'DISPATCH_READY',
      lat: 19.621,
      lng: 74.198,
    },
  ]);
});

// Start Full-Stack Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`SADES Full-Stack Engine running on port ${PORT}`);
  });
}

startServer();
