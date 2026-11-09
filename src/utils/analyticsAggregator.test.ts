import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateAccidentsByTimeOfDay } from './analyticsAggregator.ts';
import { AccidentEvent } from '../types.ts';

const createMockEvent = (hoursAgo: number, hourOfDay: number, status: any = 'CONFIRMED'): AccidentEvent => {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(hoursAgo / 24));
  d.setHours(hourOfDay, 15, 0, 0);

  return {
    id: `EVT-${Math.random()}`,
    timestamp: d.getTime(),
    dateStr: d.toLocaleDateString(),
    timeStr: `${hourOfDay}:15:00`,
    status,
    severity: 'HIGH',
    triggerReason: 'Crash impact',
    confidenceScore: 90,
    source: 'WOKWI_SIMULATOR',
    sensorSnapshot: {
      ax: 3.5, ay: 0, az: 1, gx: 0, gy: 0, gz: 0,
      accelMagnitude: 3.6, gyroMagnitude: 0, roll: 0, pitch: 0,
    },
    location: {
      lat: 19.6, lng: 74.2, address: 'Sangamner Bypass', speedKmh: 45, satellites: 8, accuracyMeters: 3, isSimulated: true,
    },
    verification: { countdownSeconds: 10, verifiedBy: 'TIMEOUT_AUTO_DISPATCH', resolvedAt: d.getTime() + 10000 },
    notificationsSent: { smsCount: 2, emailCount: 1, hospitalAlerted: true, dispatchTime: d.getTime(), recipients: [] },
  };
};

test('aggregateAccidentsByTimeOfDay generates 24 hour slots', () => {
  const result = aggregateAccidentsByTimeOfDay([]);
  assert.equal(result.hourlySlots.length, 24);
  assert.equal(result.hourlySlots[0].timeLabel, '00:00');
  assert.equal(result.hourlySlots[23].timeLabel, '23:00');
});

test('aggregateAccidentsByTimeOfDay correctly maps events into corresponding hour slot', () => {
  const mockEvents = [
    createMockEvent(10, 14), // 14:00 (2 PM)
    createMockEvent(12, 14), // 14:00 (2 PM)
    createMockEvent(20, 20), // 20:00 (8 PM)
  ];

  const result = aggregateAccidentsByTimeOfDay(mockEvents);
  assert.equal(result.hourlySlots[14].total, 2);
  assert.equal(result.hourlySlots[20].total, 1);
  assert.equal(result.stats.total30Days, 3);
  assert.equal(result.stats.peakHour, '14:00 – 15:00');
});

test('aggregateAccidentsByTimeOfDay excludes events older than 30 days', () => {
  const freshEvent = createMockEvent(24 * 5, 10); // 5 days ago, 10:00
  const oldEvent = createMockEvent(24 * 40, 10); // 40 days ago (outside 30-day window)

  const result = aggregateAccidentsByTimeOfDay([freshEvent, oldEvent]);
  assert.equal(result.stats.total30Days, 1);
  assert.equal(result.hourlySlots[10].total, 1);
});
