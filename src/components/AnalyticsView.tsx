import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { AccidentEvent } from '../types';
import { aggregateAccidentsByTimeOfDay } from '../utils/analyticsAggregator';

interface AnalyticsViewProps {
  events: AccidentEvent[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ events }) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'CONFIRMED' | 'FALSE_ALARM'>('ALL');
  const [chartMetric, setChartMetric] = useState<'STATUS' | 'SEVERITY'>('STATUS');

  // Compute 30-day analytics aggregation based on existing history data
  const { hourlySlots, periodSummaries, stats } = useMemo(() => {
    return aggregateAccidentsByTimeOfDay(events);
  }, [events]);

  // Filtered data for the bar chart
  const chartData = useMemo(() => {
    return hourlySlots.map((slot) => {
      if (filterMode === 'CONFIRMED') {
        return {
          ...slot,
          displayTotal: slot.confirmed,
        };
      }
      if (filterMode === 'FALSE_ALARM') {
        return {
          ...slot,
          displayTotal: slot.falseAlarms,
        };
      }
      return {
        ...slot,
        displayTotal: slot.total,
      };
    });
  }, [hourlySlots, filterMode]);

  // Custom Dark Tooltip matching frontend-design discipline
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg shadow-xl text-xs space-y-1.5 font-mono">
          <div className="text-slate-300 font-sans font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>Time Window: {label} – {((data.hour + 1) % 24).toString().padStart(2, '0')}:00</span>
          </div>
          <div className="border-t border-slate-800 pt-1 space-y-1">
            <div className="flex justify-between gap-4 text-slate-300">
              <span className="text-slate-400">Total Incidents:</span>
              <strong className="text-white">{data.total}</strong>
            </div>
            <div className="flex justify-between gap-4 text-rose-400">
              <span>Confirmed Accidents:</span>
              <strong>{data.confirmed}</strong>
            </div>
            <div className="flex justify-between gap-4 text-emerald-400">
              <span>False Alarms Filtered:</span>
              <strong>{data.falseAlarms}</strong>
            </div>
            <div className="flex justify-between gap-4 text-amber-400 text-[11px] pt-1 border-t border-slate-800/80">
              <span>Critical Severity:</span>
              <strong>{data.critical}</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 font-semibold">
              Temporal Accident Analytics
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" /> Last 30 Days (Rolling Window)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Accident Frequency by Time of Day
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Correlates MPU-6050 crash detections and verification telemetry over a 24-hour diurnal cycle to identify high-risk transit hours and optimize emergency response dispatch.
          </p>
        </div>

        {/* View Controls & Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Chart Breakdown Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setChartMetric('STATUS')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                chartMetric === 'STATUS'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              By Verification Status
            </button>
            <button
              onClick={() => setChartMetric('SEVERITY')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                chartMetric === 'SEVERITY'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              By Severity Level
            </button>
          </div>

          {/* Filter Status Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterMode === 'ALL'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterMode('CONFIRMED')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterMode === 'CONFIRMED'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Confirmed Only
            </button>
            <button
              onClick={() => setFilterMode('FALSE_ALARM')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterMode === 'FALSE_ALARM'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              False Alarms
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] uppercase font-mono text-slate-400 flex items-center justify-between">
            <span>30-Day Total Incidents</span>
            <Layers className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
              {stats.total30Days}
            </span>
            <span className="text-xs text-slate-500">recorded</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono flex justify-between">
            <span>Confirmed: <strong className="text-rose-400">{stats.confirmedCount}</strong></span>
            <span>False: <strong className="text-emerald-400">{stats.falseAlarmCount}</strong></span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] uppercase font-mono text-slate-400 flex items-center justify-between">
            <span>Peak Accident Window</span>
            <Clock className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-rose-400 tabular-nums">
              {stats.peakHour}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            <span>Incidents at Peak: <strong className="text-white">{stats.peakCount}</strong></span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] uppercase font-mono text-slate-400 flex items-center justify-between">
            <span>High/Critical Ratio</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
              {stats.highRiskPercentage}%
            </span>
            <span className="text-xs text-slate-500">of events</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            <span>Severe impact or rollover</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] uppercase font-mono text-slate-400 flex items-center justify-between">
            <span>Avg Verification Time</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
              {stats.averageResponseSec}s
            </span>
            <span className="text-xs text-slate-500">avg latency</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            <span>10s countdown window</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Bar Chart Container */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              24-Hour Diurnal Accident Distribution (Hourly Bins)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Number of verified accident incidents versus filtered road disturbances across each hour of the day.
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            Source: SADES Telemetry History DB
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                interval={1}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                allowDecimals={false}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />

              {chartMetric === 'STATUS' ? (
                <>
                  <Bar
                    dataKey="confirmed"
                    name="Confirmed Emergency (Dispatched)"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="falseAlarms"
                    name="False Alarms (Dismissed via I'm Safe)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                </>
              ) : (
                <>
                  <Bar
                    dataKey="critical"
                    name="Critical Severity (G-Force > 4.0g + Inversion)"
                    fill="#e11d48"
                    radius={[4, 4, 0, 0]}
                    stackId="s"
                  />
                  <Bar
                    dataKey="high"
                    name="High Severity (>3.0g Shock / Rollover)"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    stackId="s"
                  />
                  <Bar
                    dataKey="moderate"
                    name="Moderate Severity (High Spin / Decel)"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                    stackId="s"
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          <span>* X-axis hours represent local vehicular time (IST - Indian Standard Time)</span>
          <span className="font-mono">Data sample: {events.length} lifetime logs</span>
        </div>
      </div>

      {/* 4-Period Transit Risk Windows (from PPT & Traffic Analysis) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {periodSummaries.map((p, idx) => {
          const isHighest = p.count === Math.max(...periodSummaries.map((s) => s.count));

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                isHighest
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-md'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  {p.hoursRange}
                </span>
                {isHighest && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-500 text-white font-bold">
                    PEAK RISK
                  </span>
                )}
              </div>

              <div className="text-xs font-bold text-white">{p.periodName}</div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {p.count} <span className="text-xs text-slate-500 font-normal">incidents</span>
                </span>
                <span className="text-xs font-mono font-semibold text-rose-400">
                  {p.percentage}%
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${isHighest ? 'bg-rose-500' : 'bg-slate-700'}`}
                  style={{ width: `${p.percentage}%` }}
                />
              </div>

              <div className="mt-2 text-[10px] text-slate-400 font-mono">
                Confirmed: <strong className="text-slate-200">{p.confirmed}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Engineering Insights & Road Safety Correlations (From Research & References) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Accident Time-of-Day Engineering Insights & Findings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300 leading-relaxed pt-1">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-white font-semibold">1. Evening Rush Hour Peak (18:00 – 21:00)</div>
            <p className="text-[11px] text-slate-400">
              Corresponds to dense commuter convergence on NH-50 Sangamner bypass. Visual fatigue and lighting transitions heighten intersection collisions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-white font-semibold">2. Late Night High-G Severity (00:00 – 04:00)</div>
            <p className="text-[11px] text-slate-400">
              While overall traffic density is lower, average impact deceleration peaks at 4.4g due to high highway speeds and commercial freight truck rollovers in ghat sections.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <div className="text-white font-semibold">3. False Alarm Filtering Rate</div>
            <p className="text-[11px] text-slate-400">
              Daytime false alarms peak around 14:00 over urban speed bumps and road repairs. The 10-second verification countdown filtered out {stats.falseAlarmCount} benign shocks without initiating emergency dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
