import React from 'react';
import {
  ShieldAlert,
  Cpu,
  MapPin,
  Compass,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Phone,
  Layers,
} from 'lucide-react';
import { ProcessedData, LocationData, EmergencyContact, AccidentEvent } from '../types';

interface DashboardOverviewProps {
  processed: ProcessedData;
  location: LocationData;
  systemConnected: boolean;
  source: string;
  contacts: EmergencyContact[];
  lastEvent: AccidentEvent | null;
  onNavigateTab: (tab: any) => void;
  onTriggerSOS: () => void;
  onTriggerPreset: (preset: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  processed,
  location,
  systemConnected,
  source,
  contacts,
  lastEvent,
  onNavigateTab,
  onTriggerSOS,
  onTriggerPreset,
}) => {
  const isAccident = lastEvent?.status === 'CONFIRMED' || lastEvent?.status === 'MANUAL_SOS';
  const isPending = lastEvent?.status === 'PENDING_VERIFICATION';

  return (
    <div className="space-y-6">
      {/* Primary Hero Status Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                SADES 6.0 Engine Active
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400 font-mono">
                Source: {source}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Smart Accident Detection & Emergency Response System
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Automated vehicle telemetry monitoring, multi-sensor collision verification, instant GPS positioning, and immediate emergency dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onTriggerPreset('POSSIBLE_ACCIDENT')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Simulate Crash Event</span>
            </button>

            <button
              onClick={onTriggerSOS}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Manual SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Zone Hardware & Sensor Status Bar (Prompt requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System & Device Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-mono text-slate-400">System Status</span>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>System Active</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Uptime: 99.98%</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        {/* ESP32 Microcontroller Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-mono text-slate-400">ESP32 Controller</span>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${systemConnected ? 'bg-sky-400' : 'bg-rose-500'}`} />
              <span>{systemConnected ? 'Device Connected' : 'Offline'}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">I2C & WiFi Active</div>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-950/60 border border-sky-800/40 text-sky-400">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* MPU6050 Motion Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-mono text-slate-400">MPU6050 6-Axis</span>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Sensors Nominal</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Mag: {processed.accelMagnitude}g · {Math.round(processed.roll)}°
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* GPS NEO-6M Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-mono text-slate-400">GPS Positioning</span>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>GPS Available</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {location.satellites} Sats Locked · ±{location.accuracyMeters}m
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Preview + Quick Status / Last Event */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Telemetry Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white">Live Vehicle Kinematics</h2>
                <p className="text-xs text-slate-400">Real-time accelerometer and gyroscope vector processing</p>
              </div>
              <button
                onClick={() => onNavigateTab('sensors')}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <span>Full Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-400">Total Deceleration</span>
                <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {processed.accelMagnitude}g
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Normal: 1.0g</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-400">Roll (Tilt Angle)</span>
                <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {processed.roll}°
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Limit: ±60°</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-400">Speed (NEO-6M)</span>
                <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {location.speedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Simulated GPS</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-400">Accident State</span>
                <div className="text-base font-bold font-mono mt-2 tabular-nums">
                  {isAccident ? (
                    <span className="text-rose-400 font-bold">CONFIRMED</span>
                  ) : isPending ? (
                    <span className="text-amber-400 font-bold">VERIFYING</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">NO ACCIDENT</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Algorithm v2.4</div>
              </div>
            </div>

            {/* Simulated Location Bar */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-slate-300 truncate max-w-md">
                  {location.address}
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('location')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium shrink-0 flex items-center gap-1"
              >
                <span>View Live Map</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Demo Mode Scenario Strip */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                College Project Test Scenarios
              </h2>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                Demo Suite
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => onTriggerPreset('NORMAL_MOVEMENT')}
                className="p-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <div className="font-semibold text-white">1. Normal Driving</div>
                <div className="text-[10px] text-slate-500 mt-0.5">0.05g · 48 km/h</div>
              </button>

              <button
                onClick={() => onTriggerPreset('SUDDEN_IMPACT')}
                className="p-3 rounded-lg bg-slate-950 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-800/40 text-left transition-colors"
              >
                <div className="font-semibold text-amber-300">2. Sudden Decel</div>
                <div className="text-[10px] text-slate-500 mt-0.5">4.2g Head-On Impact</div>
              </button>

              <button
                onClick={() => onTriggerPreset('HIGH_ROTATION')}
                className="p-3 rounded-lg bg-slate-950 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-800/40 text-left transition-colors"
              >
                <div className="font-semibold text-purple-300">3. High Spin</div>
                <div className="text-[10px] text-slate-500 mt-0.5">310°/s Vehicle Yaw</div>
              </button>

              <button
                onClick={() => onTriggerPreset('POSSIBLE_ACCIDENT')}
                className="p-3 rounded-lg bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800/60 text-left transition-colors"
              >
                <div className="font-semibold text-rose-300">4. Crash + Rollover</div>
                <div className="text-[10px] text-rose-400 mt-0.5">Full Emergency Flow</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Last Event & Primary Emergency Contacts */}
        <div className="space-y-6">
          {/* Last Detected Event */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Last Incident Log
              </h2>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>

            {lastEvent ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-rose-400 font-bold">{lastEvent.id}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{lastEvent.timeStr}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                  {lastEvent.triggerReason}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div className="p-2 rounded bg-slate-950 text-slate-400">
                    Status: <strong className="text-white">{lastEvent.status}</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-950 text-slate-400">
                    Severity: <strong className="text-rose-400">{lastEvent.severity}</strong>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('history')}
                  className="w-full mt-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  View Event Log Archive
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs">
                <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500/40 mb-2" />
                <div>No accident detected yet.</div>
                <div className="text-[10px] text-slate-600 mt-1">Vehicle is operating normally.</div>
              </div>
            )}
          </div>

          {/* Primary Emergency Contacts */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                Emergency Contacts
              </h2>
              <button
                onClick={() => onNavigateTab('settings')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {contacts.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.relationship}</div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-300">
                    {c.phone}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
