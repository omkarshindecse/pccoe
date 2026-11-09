import React from 'react';
import { AlertTriangle, MapPin, PhoneCall, Mail, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import { AccidentEvent, UserProfile, EmergencyContact } from '../types';

interface EmergencyAlertPanelProps {
  event: AccidentEvent;
  profile: UserProfile;
  contacts: EmergencyContact[];
  onDismiss: () => void;
}

export const EmergencyAlertPanel: React.FC<EmergencyAlertPanelProps> = ({
  event,
  profile,
  contacts,
  onDismiss,
}) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${event.location.lat},${event.location.lng}`;

  return (
    <div className="rounded-2xl border-2 border-rose-600 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-300">
      {/* High Urgency Header */}
      <div className="bg-gradient-to-r from-rose-800 via-rose-600 to-rose-800 px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/10 text-white">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-rose-200">
              SADES Emergency Response System
            </span>
            <h2 className="text-xl font-black tracking-tight uppercase">
              Emergency Alert Triggered!
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-400/40 text-xs font-mono font-bold text-rose-200">
            {event.id}
          </span>
          <button
            onClick={onDismiss}
            className="px-3 py-1 text-xs font-semibold rounded bg-white text-rose-950 hover:bg-rose-50 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Core Event Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Timestamp</span>
            <div className="text-white font-mono font-bold mt-1 text-sm">
              {event.timeStr}
            </div>
            <div className="text-[10px] text-slate-500">{event.dateStr}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Severity Level</span>
            <div className="text-rose-400 font-mono font-bold mt-1 text-sm">
              {event.severity}
            </div>
            <div className="text-[10px] text-slate-500">Confidence: {event.confidenceScore}%</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Impact G-Force</span>
            <div className="text-white font-mono font-bold mt-1 text-sm">
              {event.sensorSnapshot.accelMagnitude}g
            </div>
            <div className="text-[10px] text-slate-500">Roll: {event.sensorSnapshot.roll}°</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Verification Source</span>
            <div className="text-white font-mono font-bold mt-1 text-sm truncate">
              {event.verification.verifiedBy === 'MANUAL_SOS' ? 'Manual SOS' : 'Auto Timeout'}
            </div>
            <div className="text-[10px] text-emerald-400">10s Window Expired</div>
          </div>
        </div>

        {/* Location & Operator Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Operator Details */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Vehicle & Operator Profile
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Operator Name:</span>
                <span className="text-white font-medium">{profile.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Blood Group:</span>
                <span className="text-rose-400 font-mono font-bold">{profile.bloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Number:</span>
                <span className="text-white font-mono font-medium">{profile.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Model:</span>
                <span className="text-slate-300">{profile.vehicleModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">College & Affiliation:</span>
                <span className="text-slate-300">{profile.college}</span>
              </div>
            </div>
          </div>

          {/* Location & Coordinates */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Accident Site Coordinates
              </h3>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/40">
                Simulated GPS
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-mono text-sm font-bold text-white">
                {event.location.lat.toFixed(6)}° N, {event.location.lng.toFixed(6)}° E
              </div>
              <p className="text-slate-400 text-xs">
                {event.location.address}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Notification Log */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Emergency Dispatch & Contacts Notification Log
            </h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Simulation Dispatched
            </span>
          </div>

          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{contact.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({contact.relationship})</span>
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono mt-0.5">{contact.phone} · {contact.email}</div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono">
                  {contact.notifySms && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> SMS SENT
                    </span>
                  )}
                  {contact.notifyCall && (
                    <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/40 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3" /> CALL QUEUED
                    </span>
                  )}
                  {contact.notifyEmail && (
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/40 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> EMAIL SENT
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Prototype notification disclaimer */}
          <div className="text-[11px] text-slate-500 italic pt-1">
            * Note: In this college engineering prototype demonstration, notifications are generated via simulated SMS/Email channels. Physical GSM module (SIM800L) will send real SMS when connected.
          </div>
        </div>
      </div>
    </div>
  );
};
