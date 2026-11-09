import React, { useState, useEffect } from 'react';
import { Activity, Gauge, Compass, AlertCircle } from 'lucide-react';
import { ProcessedData } from '../types';

interface SensorMonitoringProps {
  processed: ProcessedData;
  source: string;
  tempC: number;
}

interface HistoryPoint {
  time: string;
  accel: number;
  gyro: number;
}

export const SensorMonitoring: React.FC<SensorMonitoringProps> = ({
  processed,
  source,
  tempC,
}) => {
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  // Keep last 30 data points for live sparkline / waveform chart
  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getSeconds()}s`;
    setHistory((prev) => {
      const next = [
        ...prev,
        {
          time: timeStr,
          accel: processed.accelMagnitude,
          gyro: processed.gyroMagnitude,
        },
      ];
      return next.slice(-30);
    });
  }, [processed.accelMagnitude, processed.gyroMagnitude, processed.timestamp]);

  // Compute SVG polyline paths for the live waveform chart
  const svgWidth = 600;
  const svgHeight = 120;
  const maxAccel = Math.max(5.0, ...history.map((h) => h.accel));

  const accelPoints = history
    .map((pt, idx) => {
      const x = (idx / Math.max(1, history.length - 1)) * svgWidth;
      const y = svgHeight - (pt.accel / maxAccel) * (svgHeight - 20) - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Sensor Data Source Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-200">
            MPU-6050 6-Axis Motion Sensor Telemetry
          </span>
          <span className="text-slate-500">·</span>
          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-sky-950/80 text-sky-300 border border-sky-800/40">
            Source: {source}
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Temp: <strong className="text-slate-200">{tempC.toFixed(1)}°C</strong></span>
          <span>Sampling: <strong className="text-emerald-400">10 Hz</strong></span>
          <span>Status: <strong className="text-emerald-400">NOMINAL</strong></span>
        </div>
      </div>

      {/* Primary Vector Magnitudes Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Acceleration Magnitude</span>
            <Gauge className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {processed.accelMagnitude}
            </span>
            <span className="text-sm font-medium text-slate-400">g</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Resting: 1.0g</span>
            <span className={processed.accelMagnitude >= 3.0 ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
              {processed.accelMagnitude >= 3.0 ? 'CRITICAL IMPACT' : 'NORMAL'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Rotation Magnitude</span>
            <Compass className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {processed.gyroMagnitude}
            </span>
            <span className="text-sm font-medium text-slate-400">°/s</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Threshold: 250°/s</span>
            <span className={processed.gyroMagnitude >= 250 ? 'text-purple-400 font-semibold' : 'text-slate-500'}>
              {processed.gyroMagnitude >= 250 ? 'SPIN DETECTED' : 'STABLE'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Roll Angle (Lateral Tilt)</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {processed.roll}
            </span>
            <span className="text-sm font-medium text-slate-400">°</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Rollover limit: ±60°</span>
            <span className={Math.abs(processed.roll) >= 60 ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
              {Math.abs(processed.roll) >= 60 ? 'VEHICLE INVERTED' : 'UPRIGHT'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Pitch Angle (Fore/Aft Tilt)</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {processed.pitch}
            </span>
            <span className="text-sm font-medium text-slate-400">°</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Incline limit: ±60°</span>
            <span className={Math.abs(processed.pitch) >= 60 ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
              {Math.abs(processed.pitch) >= 60 ? 'EXTREME PITCH' : 'LEVEL'}
            </span>
          </div>
        </div>
      </div>

      {/* Raw 3-Axis Accelerometer & Gyroscope Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accelerometer 3-Axis */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Accelerometer (Linear Acceleration)</h3>
            <span className="text-xs font-mono text-slate-400">Unit: g (1g ≈ 9.81 m/s²)</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-400">X-Axis (Surge)</span>
              <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                {processed.ax >= 0 ? `+${processed.ax.toFixed(2)}` : processed.ax.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Lateral shock</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-400">Y-Axis (Sway)</span>
              <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                {processed.ay >= 0 ? `+${processed.ay.toFixed(2)}` : processed.ay.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Side impact</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-400">Z-Axis (Heave)</span>
              <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                {processed.az >= 0 ? `+${processed.az.toFixed(2)}` : processed.az.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Vertical / Gravity</div>
            </div>
          </div>
        </div>

        {/* Gyroscope 3-Axis */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Gyroscope (Angular Velocity)</h3>
            <span className="text-xs font-mono text-slate-400">Unit: °/sec (Degrees per second)</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-400">X-Axis (Roll Rate)</span>
              <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                {processed.gx >= 0 ? `+${processed.gx.toFixed(1)}` : processed.gx.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Tilt speed</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-400">Y-Axis (Pitch Rate)</span>
              <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                {processed.gy >= 0 ? `+${processed.gy.toFixed(1)}` : processed.gy.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Elevation speed</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-400">Z-Axis (Yaw Rate)</span>
              <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                {processed.gz >= 0 ? `+${processed.gz.toFixed(1)}` : processed.gz.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Spin speed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Waveform Graph */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Live Impact & G-Force Waveform</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time vector magnitude over time</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-0.5 bg-rose-500 inline-block" /> Total G-Force
            </span>
            <span className="text-slate-500">Threshold: 3.2g</span>
          </div>
        </div>

        <div className="relative w-full h-32 bg-slate-950 rounded-lg p-2 border border-slate-800/80 overflow-hidden">
          {/* Threshold reference dashed line */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-rose-500/40 z-10 pointer-events-none"
            style={{
              top: `${Math.max(10, Math.min(110, svgHeight - (3.2 / maxAccel) * (svgHeight - 20) - 10))}px`,
            }}
          >
            <span className="absolute right-2 -top-4 text-[9px] font-mono text-rose-400">
              3.2g Threshold
            </span>
          </div>

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <polyline
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              points={accelPoints}
            />
          </svg>
        </div>
      </div>

      {/* Vehicle Attitude Simulator (Pitch & Roll Visualizer) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 max-w-md">
          <h3 className="text-sm font-semibold text-white">Vehicle Physical Attitude Orientation</h3>
          <p className="text-xs text-slate-400">
            Calculated via trigonometric orientation algorithm from 3-axis accelerometer gravity vectors.
            Used to distinguish flat road impacts from vehicle rollovers.
          </p>
          <div className="pt-2 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Current Roll: <strong className="text-white font-mono">{processed.roll}°</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Current Pitch: <strong className="text-white font-mono">{processed.pitch}°</strong></span>
            </div>
          </div>
        </div>

        {/* 2D/3D Vehicle Tilt Gimbal */}
        <div className="w-44 h-44 rounded-full border-2 border-slate-700 bg-slate-950 flex items-center justify-center relative overflow-hidden shadow-inner">
          {/* Horizon Line */}
          <div
            className="w-full h-0.5 bg-emerald-500/60 absolute transition-transform duration-200"
            style={{
              transform: `rotate(${processed.roll}deg) translateY(${processed.pitch * 0.8}px)`,
            }}
          />

          {/* Vehicle Silhouette */}
          <div
            className="w-20 h-10 border-2 border-rose-500 bg-rose-500/20 rounded-md flex items-center justify-center text-xs font-bold text-white transition-transform duration-200 shadow-md"
            style={{
              transform: `rotate(${processed.roll}deg)`,
            }}
          >
            🚗
          </div>

          <span className="absolute top-2 text-[9px] font-mono text-slate-500">0° UP</span>
          <span className="absolute bottom-2 text-[9px] font-mono text-slate-500">180° INV</span>
        </div>
      </div>
    </div>
  );
};
