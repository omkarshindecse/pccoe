/**
 * SADES - Smart Accident Detection & Emergency Response System
 * Pure Accident Detection & Sensor Processing Logic
 */

export interface SensorReading {
  ax: number; // Accelerometer X in g
  ay: number; // Accelerometer Y in g
  az: number; // Accelerometer Z in g
  gx: number; // Gyroscope X in deg/s
  gy: number; // Gyroscope Y in deg/s
  gz: number; // Gyroscope Z in deg/s
  timestamp: number;
}

export interface DetectionThresholds {
  impactGThreshold: number; // e.g. 3.2 g
  gyroRateThreshold: number; // e.g. 250 deg/s
  rollThreshold: number; // e.g. 60 deg
  pitchThreshold: number; // e.g. 60 deg
}

export const DEFAULT_THRESHOLDS: DetectionThresholds = {
  impactGThreshold: 3.2,
  gyroRateThreshold: 250,
  rollThreshold: 60,
  pitchThreshold: 60,
};

export interface ProcessedSensorData extends SensorReading {
  accelMagnitude: number; // in g
  gyroMagnitude: number; // in deg/s
  roll: number; // in degrees
  pitch: number; // in degrees
}

export interface AccidentEvaluation {
  isAccidentSuspected: boolean;
  severity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  triggerReason: string;
  confidenceScore: number; // 0 to 100%
  processedData: ProcessedSensorData;
}

/**
 * Computes vector magnitude: sqrt(x^2 + y^2 + z^2)
 */
export function calculateMagnitude(x: number, y: number, z: number): number {
  return Number(Math.sqrt(x * x + y * y + z * z).toFixed(2));
}

/**
 * Calculates roll and pitch angles from accelerometer readings in degrees
 */
export function calculateOrientation(ax: number, ay: number, az: number): { roll: number; pitch: number } {
  const radToDeg = 180 / Math.PI;
  // Roll: rotation about X-axis
  const roll = Math.atan2(ay, az) * radToDeg;
  // Pitch: rotation about Y-axis
  const pitch = Math.atan2(-ax, Math.sqrt(ay * ay + az * az)) * radToDeg;

  return {
    roll: Number(roll.toFixed(1)),
    pitch: Number(pitch.toFixed(1)),
  };
}

/**
 * Enriches raw sensor reading with computed physics values
 */
export function processSensorReading(reading: SensorReading): ProcessedSensorData {
  const accelMagnitude = calculateMagnitude(reading.ax, reading.ay, reading.az);
  const gyroMagnitude = calculateMagnitude(reading.gx, reading.gy, reading.gz);
  const { roll, pitch } = calculateOrientation(reading.ax, reading.ay, reading.az);

  return {
    ...reading,
    accelMagnitude,
    gyroMagnitude,
    roll,
    pitch,
  };
}

/**
 * Evaluates sensor readings against accident detection criteria
 */
export function evaluateAccident(
  reading: SensorReading,
  thresholds: DetectionThresholds = DEFAULT_THRESHOLDS
): AccidentEvaluation {
  const processed = processSensorReading(reading);

  const hasHighImpact = processed.accelMagnitude >= thresholds.impactGThreshold;
  const hasExtremeImpact = processed.accelMagnitude >= thresholds.impactGThreshold * 1.35;
  const hasHighRotation = processed.gyroMagnitude >= thresholds.gyroRateThreshold;
  const hasRollover = Math.abs(processed.roll) >= thresholds.rollThreshold || Math.abs(processed.pitch) >= thresholds.pitchThreshold;

  // Filter out normal potholes/vibrations:
  // Potholes often cause vertical vibration (az fluctuation) but low gyro rate and 0 rollover.
  if (!hasHighImpact && !hasHighRotation && !hasRollover) {
    return {
      isAccidentSuspected: false,
      severity: 'NONE',
      triggerReason: 'Normal vehicle movement within safety limits',
      confidenceScore: 0,
      processedData: processed,
    };
  }

  // Combined Multi-Condition Classification
  if (hasExtremeImpact && hasRollover) {
    return {
      isAccidentSuspected: true,
      severity: 'CRITICAL',
      triggerReason: `Severe Collision & Vehicle Rollover (${processed.accelMagnitude}g impact, Roll: ${processed.roll}°)`,
      confidenceScore: 98,
      processedData: processed,
    };
  }

  if (hasHighImpact && hasRollover) {
    return {
      isAccidentSuspected: true,
      severity: 'HIGH',
      triggerReason: `High Impact with Vehicle Inversion (${processed.accelMagnitude}g, Roll: ${processed.roll}°)`,
      confidenceScore: 92,
      processedData: processed,
    };
  }

  if (hasHighImpact && hasHighRotation) {
    return {
      isAccidentSuspected: true,
      severity: 'HIGH',
      triggerReason: `High-G Impact with Rapid Vehicular Spin (${processed.accelMagnitude}g, ${processed.gyroMagnitude}°/s)`,
      confidenceScore: 88,
      processedData: processed,
    };
  }

  if (hasExtremeImpact) {
    return {
      isAccidentSuspected: true,
      severity: 'HIGH',
      triggerReason: `Severe Sudden Deceleration / Head-On Impact (${processed.accelMagnitude}g)`,
      confidenceScore: 85,
      processedData: processed,
    };
  }

  if (hasRollover) {
    return {
      isAccidentSuspected: true,
      severity: 'MODERATE',
      triggerReason: `Abnormal Vehicle Tilt / Possible Rollover (${processed.roll}° Roll, ${processed.pitch}° Pitch)`,
      confidenceScore: 78,
      processedData: processed,
    };
  }

  if (hasHighImpact) {
    return {
      isAccidentSuspected: true,
      severity: 'MODERATE',
      triggerReason: `Abnormal Impact Shock Exceeded Threshold (${processed.accelMagnitude}g)`,
      confidenceScore: 72,
      processedData: processed,
    };
  }

  if (hasHighRotation) {
    return {
      isAccidentSuspected: true,
      severity: 'LOW',
      triggerReason: `Abnormal Rotational Rate (${processed.gyroMagnitude}°/s)`,
      confidenceScore: 55,
      processedData: processed,
    };
  }

  return {
    isAccidentSuspected: false,
    severity: 'NONE',
    triggerReason: 'Minor road bump filtered out',
    confidenceScore: 10,
    processedData: processed,
  };
}
