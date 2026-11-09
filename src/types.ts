export interface SensorData {
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
  timestamp: number;
}

export interface ProcessedData extends SensorData {
  accelMagnitude: number;
  gyroMagnitude: number;
  roll: number;
  pitch: number;
}

export interface AccidentEvaluation {
  isAccidentSuspected: boolean;
  severity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  triggerReason: string;
  confidenceScore: number;
  processedData: ProcessedData;
}

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  speedKmh: number;
  satellites: number;
  accuracyMeters: number;
  isSimulated: boolean;
}

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

export type UserRole = 'DRIVER' | 'SADES_DEPARTMENT' | 'EMERGENCY_RESPONDER';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string;
  badgeNumber?: string;
  department?: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  bloodGroup?: string;
  college?: string;
  avatarUrl?: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: string;
  vehicleNumber: string;
  vehicleModel: string;
  college: string;
  team: string;
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
  location: LocationData;
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

export interface NearbyHospital {
  id: string;
  name: string;
  type: string;
  distanceKm: number;
  responseTimeMin: number;
  phone: string;
  status: string;
  lat: number;
  lng: number;
}
