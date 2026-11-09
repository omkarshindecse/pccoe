import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMagnitude,
  calculateOrientation,
  evaluateAccident,
  DEFAULT_THRESHOLDS,
  SensorReading,
} from './accidentDetection.ts';

test('calculateMagnitude correctly computes 3D Euclidean norm', () => {
  assert.equal(calculateMagnitude(0, 0, 0), 0);
  assert.equal(calculateMagnitude(3, 4, 0), 5);
  // Gravity at rest (0, 0, 1.0) -> 1.0g
  assert.equal(calculateMagnitude(0, 0, 1.0), 1.0);
});

test('calculateOrientation produces 0 degrees when level upright', () => {
  const { roll, pitch } = calculateOrientation(0, 0, 1.0);
  assert.equal(roll, 0);
  assert.equal(pitch, 0);
});

test('calculateOrientation detects 90 degree roll when on side', () => {
  const { roll } = calculateOrientation(0, 1.0, 0);
  assert.equal(Math.round(roll), 90);
});

test('evaluateAccident reports NONE for normal driving', () => {
  const normalDriving: SensorReading = {
    ax: 0.05,
    ay: 0.08,
    az: 0.98,
    gx: 1.2,
    gy: 2.1,
    gz: 0.5,
    timestamp: Date.now(),
  };

  const evalResult = evaluateAccident(normalDriving, DEFAULT_THRESHOLDS);
  assert.equal(evalResult.isAccidentSuspected, false);
  assert.equal(evalResult.severity, 'NONE');
});

test('evaluateAccident triggers CRITICAL on high impact plus rollover', () => {
  const severeCrash: SensorReading = {
    ax: 3.5,
    ay: 2.8,
    az: 1.2, // ~4.64g magnitude
    gx: 120,
    gy: 180,
    gz: 90,
    timestamp: Date.now(),
  };

  const evalResult = evaluateAccident(severeCrash, DEFAULT_THRESHOLDS);
  assert.equal(evalResult.isAccidentSuspected, true);
  assert.ok(['HIGH', 'CRITICAL'].includes(evalResult.severity));
  assert.ok(evalResult.confidenceScore > 80);
});

test('evaluateAccident triggers MODERATE on vehicle rollover without high G', () => {
  // Vehicle upside down or tilted 90 degrees
  const rollover: SensorReading = {
    ax: 0.1,
    ay: 0.95,
    az: 0.05,
    gx: 5.0,
    gy: 4.0,
    gz: 2.0,
    timestamp: Date.now(),
  };

  const evalResult = evaluateAccident(rollover, DEFAULT_THRESHOLDS);
  assert.equal(evalResult.isAccidentSuspected, true);
  assert.equal(evalResult.severity, 'MODERATE');
  assert.ok(evalResult.triggerReason.includes('Rollover'));
});
