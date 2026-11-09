import React, { useState } from 'react';
import {
  Building2,
  Radio,
  Ambulance,
  PhoneCall,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Send,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { AccidentEvent, NearbyHospital, AuthUser } from '../types';
import { AnalyticsView } from './AnalyticsView';

interface DepartmentConsoleProps {
  currentUser: AuthUser;
  events: AccidentEvent[];
  hospitals: NearbyHospital[];
  onTriggerSOS: () => void;
  onOpenMap: () => void;
  onDismissEmergency?: () => void;
}

export const DepartmentConsole: React.FC<DepartmentConsoleProps> = ({
  currentUser,
  events,
  hospitals,
  onTriggerSOS,
  onOpenMap,
  onDismissEmergency,
}) => {
  const [activeSection, setActiveSection] = useState<'DISPATCH' | 'ANALYTICS' | 'FLEET'>('DISPATCH');
  const [dispatchedAmbulances, setDispatchedAmbulances] = useState<string[]>([]);
  const [highwayBroadcast, setHighwayBroadcast] = useState(false);

  const activeIncidents = events.filter(
    (e) => e.status === 'CONFIRMED' || e.status === 'PENDING_VERIFICATION' || e.status === 'MANUAL_SOS'
  );

  const handleDispatchHospital = (hospId: string) => {
    if (!dispatchedAmbulances.includes(hospId)) {
      setDispatchedAmbulances([...dispatchedAmbulances, hospId]);
    }
  };

  const toggleHighwayBroadcast = () => {
    setHighwayBroadcast(!highwayBroadcast);
  };

  return (
    <div className="space-y-6">
      {/* Department Command Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950/40 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">
              SADES Central Emergency Operations Command
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-400 font-mono">
              Officer: {currentUser.fullName} ({currentUser.badgeNumber || 'HQ-01'})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Emergency Dispatch & Traffic Management Console
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Coordinating real-time IoT accident telemetry with municipal medical responders, highway patrol, and emergency trauma facilities across Maharashtra NH-50 corridor.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={onTriggerSOS}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-2 shadow-md cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Trigger Emergency SOS</span>
          </button>

          <button
            onClick={toggleHighwayBroadcast}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
              highwayBroadcast
                ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
            }`}
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>{highwayBroadcast ? 'Broadcast Active (NH-50)' : 'Broadcast Highway Warning'}</span>
          </button>

          <button
            onClick={onOpenMap}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-2 shadow-md"
          >
            <MapPin className="w-4 h-4" />
            <span>Open Tactical GIS Map</span>
          </button>
        </div>
      </div>

      {/* Subnavigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSection('DISPATCH')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSection === 'DISPATCH'
              ? 'bg-sky-600/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Incident Dispatch Desk ({activeIncidents.length} Active)</span>
        </button>

        <button
          onClick={() => setActiveSection('ANALYTICS')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSection === 'ANALYTICS'
              ? 'bg-sky-600/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>30-Day Diurnal Analytics (Recharts)</span>
        </button>

        <button
          onClick={() => setActiveSection('FLEET')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSection === 'FLEET'
              ? 'bg-sky-600/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>ESP32 IoT Node Fleet Health</span>
        </button>
      </div>

      {/* Section 1: Incident Dispatch Desk */}
      {activeSection === 'DISPATCH' && (
        <div className="space-y-6">
          {/* Active Incidents Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Active Incident Triage Queue
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {activeIncidents.length} events requiring dispatch attention
              </span>
            </div>

            {activeIncidents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-500">
                <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <div className="font-semibold text-slate-300">All Highway Corridors Nominal</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  No pending collisions or unresolved SOS beacons on the Sangamner division.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {activeIncidents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 rounded-xl bg-slate-900 border-2 border-rose-500/60 shadow-lg space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          {evt.id}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {evt.triggerReason}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-rose-400 font-bold">{evt.severity}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">{evt.timeStr}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-mono">GPS Coordinates</span>
                        <div className="font-mono text-white font-semibold">
                          {evt.location.lat.toFixed(5)}° N, {evt.location.lng.toFixed(5)}° E
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{evt.location.address}</div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-mono">Sensor Telemetry</span>
                        <div className="font-mono text-white">
                          Impact: <strong className="text-rose-400">{evt.sensorSnapshot.accelMagnitude}g</strong>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Roll: {evt.sensorSnapshot.roll}° · Speed: {evt.location.speedKmh} km/h
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-mono">Status & Triage</span>
                        <div className="font-mono text-emerald-400 font-bold">
                          {evt.status.replace('_', ' ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Notified: {evt.notificationsSent.recipients.length} Contacts
                        </div>
                      </div>
                    </div>

                    {/* Department Responder Dispatch Action Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Golden-Hour Clock: Active</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onDismissEmergency && (
                          <button
                            onClick={onDismissEmergency}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Acknowledge incident and stand down active emergency"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Stand Down</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDispatchHospital(hospitals[0]?.id || 'hosp-1')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Ambulance className="w-3.5 h-3.5" />
                          <span>Dispatch Amrutvahini Trauma 108</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Hospital Dispatch Units */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Emergency Medical Services & Trauma Network (Sangamner Corridor)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct dispatch integration with nearest medical and highway rescue facilities
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                Network Online
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {hospitals.map((hosp) => {
                const isDispatched = dispatchedAmbulances.includes(hosp.id);

                return (
                  <div
                    key={hosp.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{hosp.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300">
                          {hosp.distanceKm} km
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">{hosp.type}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-sky-400" />
                        <span>{hosp.phone}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        ETA: ~{hosp.responseTimeMin} mins
                      </span>

                      <button
                        onClick={() => handleDispatchHospital(hosp.id)}
                        disabled={isDispatched}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                          isDispatched
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {isDispatched ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Send className="w-3 h-3" />}
                        <span>{isDispatched ? 'Dispatched' : 'Alert Unit'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Integrated Recharts Analytics */}
      {activeSection === 'ANALYTICS' && (
        <AnalyticsView events={events} />
      )}

      {/* Section 3: ESP32 IoT Node Fleet Health */}
      {activeSection === 'FLEET' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Connected ESP32 Edge Device Telemetry Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-slate-400">Node ID:</span>
              <div className="text-white font-bold text-sm">SADES-ESP32-01</div>
              <div className="text-[10px] text-emerald-400">STATUS: BROADCASTING</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-slate-400">Firmware Version:</span>
              <div className="text-white font-bold text-sm">v6.0-FreeRTOS</div>
              <div className="text-[10px] text-slate-400">Adafruit GFX / MPU6050</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-slate-400">Sampling Rate:</span>
              <div className="text-white font-bold text-sm">10 Hz (100ms)</div>
              <div className="text-[10px] text-sky-400">SSE STREAMING ACTIVE</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
