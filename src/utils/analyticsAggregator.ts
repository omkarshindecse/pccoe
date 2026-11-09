import { AccidentEvent } from '../types';

export interface TimeSlotData {
  timeLabel: string; // e.g. "00:00", "01:00", etc.
  hour: number;
  total: number;
  confirmed: number;
  falseAlarms: number;
  critical: number;
  high: number;
  moderate: number;
}

export interface TimePeriodSummary {
  periodName: string;
  hoursRange: string;
  count: number;
  confirmed: number;
  percentage: number;
}

export interface AnalyticsStats {
  total30Days: number;
  confirmedCount: number;
  falseAlarmCount: number;
  peakHour: string;
  peakCount: number;
  highRiskPercentage: number;
  averageResponseSec: number;
}

/**
 * Aggregates accident events occurring within the last 30 days by time of day (24-hour slots)
 */
export function aggregateAccidentsByTimeOfDay(
  events: AccidentEvent[],
  nowMs = Date.now()
): {
  hourlySlots: TimeSlotData[];
  periodSummaries: TimePeriodSummary[];
  stats: AnalyticsStats;
} {
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const cutoffTime = nowMs - thirtyDaysMs;

  // Filter events within last 30 days
  const recentEvents = events.filter((e) => e.timestamp >= cutoffTime);

  // Initialize 24-hour slots
  const slots: TimeSlotData[] = Array.from({ length: 24 }, (_, i) => ({
    timeLabel: `${i.toString().padStart(2, '0')}:00`,
    hour: i,
    total: 0,
    confirmed: 0,
    falseAlarms: 0,
    critical: 0,
    high: 0,
    moderate: 0,
  }));

  let totalResponseSec = 0;
  let responseCount = 0;

  recentEvents.forEach((evt) => {
    const d = new Date(evt.timestamp);
    const hour = d.getHours();

    if (hour >= 0 && hour < 24) {
      slots[hour].total += 1;
      if (evt.status === 'CONFIRMED' || evt.status === 'MANUAL_SOS') {
        slots[hour].confirmed += 1;
      } else if (evt.status === 'FALSE_ALARM') {
        slots[hour].falseAlarms += 1;
      }

      if (evt.severity === 'CRITICAL') slots[hour].critical += 1;
      else if (evt.severity === 'HIGH') slots[hour].high += 1;
      else if (evt.severity === 'MODERATE') slots[hour].moderate += 1;
    }

    if (evt.verification?.resolvedAt && evt.timestamp) {
      const diffSec = Math.max(1, Math.round((evt.verification.resolvedAt - evt.timestamp) / 1000));
      totalResponseSec += diffSec;
      responseCount += 1;
    }
  });

  // Calculate Peak Hour
  let peakSlot = slots[0];
  slots.forEach((s) => {
    if (s.total > peakSlot.total) {
      peakSlot = s;
    }
  });

  // Calculate 4 major time periods:
  // Late Night: 00:00 - 06:00
  // Morning:    06:00 - 12:00
  // Afternoon:  12:00 - 18:00
  // Evening:    18:00 - 24:00
  const periods = [
    { periodName: 'Late Night / Early Dawn', start: 0, end: 5, hoursRange: '00:00 – 05:59' },
    { periodName: 'Morning Peak', start: 6, end: 11, hoursRange: '06:00 – 11:59' },
    { periodName: 'Afternoon Transit', start: 12, end: 17, hoursRange: '12:00 – 17:59' },
    { periodName: 'Evening & Night Rush', start: 18, end: 23, hoursRange: '18:00 – 23:59' },
  ];

  const totalRecent = recentEvents.length;
  const periodSummaries: TimePeriodSummary[] = periods.map((p) => {
    let count = 0;
    let confirmed = 0;
    for (let h = p.start; h <= p.end; h++) {
      count += slots[h].total;
      confirmed += slots[h].confirmed;
    }
    return {
      periodName: p.periodName,
      hoursRange: p.hoursRange,
      count,
      confirmed,
      percentage: totalRecent > 0 ? Math.round((count / totalRecent) * 100) : 0,
    };
  });

  const confirmedTotal = recentEvents.filter(
    (e) => e.status === 'CONFIRMED' || e.status === 'MANUAL_SOS'
  ).length;
  const falseAlarmTotal = recentEvents.filter((e) => e.status === 'FALSE_ALARM').length;
  const highRiskTotal = recentEvents.filter(
    (e) => e.severity === 'CRITICAL' || e.severity === 'HIGH'
  ).length;

  const stats: AnalyticsStats = {
    total30Days: totalRecent,
    confirmedCount: confirmedTotal,
    falseAlarmCount: falseAlarmTotal,
    peakHour: `${peakSlot.timeLabel} – ${(peakSlot.hour + 1).toString().padStart(2, '0')}:00`,
    peakCount: peakSlot.total,
    highRiskPercentage: totalRecent > 0 ? Math.round((highRiskTotal / totalRecent) * 100) : 0,
    averageResponseSec: responseCount > 0 ? Math.round(totalResponseSec / responseCount) : 8,
  };

  return {
    hourlySlots: slots,
    periodSummaries,
    stats,
  };
}
