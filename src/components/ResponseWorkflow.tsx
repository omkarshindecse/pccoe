import React from 'react';
import { Activity, ShieldCheck, MapPin, Send, Ambulance, Clock, CheckCircle2 } from 'lucide-react';
import { AccidentEvent } from '../types';

interface ResponseWorkflowProps {
  currentEvent: AccidentEvent | null;
  onReset?: () => void;
}

export const ResponseWorkflow: React.FC<ResponseWorkflowProps> = ({ currentEvent }) => {
  const isPending = currentEvent?.status === 'PENDING_VERIFICATION';
  const isConfirmed = currentEvent?.status === 'CONFIRMED' || currentEvent?.status === 'MANUAL_SOS';
  const isFalseAlarm = currentEvent?.status === 'FALSE_ALARM';

  const steps = [
    {
      id: 1,
      title: '1. Accident Detected',
      desc: 'Sensors detect abnormal G-force deceleration or vehicle rollover',
      icon: Activity,
      status: currentEvent ? 'COMPLETED' : 'IDLE',
      details: currentEvent
        ? `${currentEvent.sensorSnapshot.accelMagnitude}g Impact · Roll: ${currentEvent.sensorSnapshot.roll}°`
        : 'MPU6050 monitoring at 10Hz',
    },
    {
      id: 2,
      title: '2. Accident Verified',
      desc: '10s countdown window filters out minor potholes and bumps',
      icon: ShieldCheck,
      status: isFalseAlarm
        ? 'CANCELLED'
        : isConfirmed
        ? 'COMPLETED'
        : isPending
        ? 'ACTIVE'
        : 'IDLE',
      details: isFalseAlarm
        ? 'User pressed I\'M SAFE (False alarm dismissed)'
        : isConfirmed
        ? `Verified via ${currentEvent?.verification.verifiedBy === 'MANUAL_SOS' ? 'Manual SOS' : 'Auto Timeout / Confirmation'}`
        : isPending
        ? 'Awaiting operator input / 10s countdown'
        : 'Verification engine ready',
    },
    {
      id: 3,
      title: '3. Location Acquired',
      desc: 'NEO-6M GPS captures exact latitude and longitude coordinates',
      icon: MapPin,
      status: isConfirmed ? 'COMPLETED' : isPending ? 'ACTIVE' : 'IDLE',
      details: currentEvent
        ? `${currentEvent.location.lat.toFixed(4)}° N, ${currentEvent.location.lng.toFixed(4)}° E (Simulated)`
        : 'NEO-6M GPS locked (9 satellites)',
    },
    {
      id: 4,
      title: '4. Emergency Alert Sent',
      desc: 'Automated SMS, phone call, and email dispatched to emergency contacts',
      icon: Send,
      status: isConfirmed ? 'COMPLETED' : 'IDLE',
      details: isConfirmed
        ? `${currentEvent?.notificationsSent.smsCount} SMS sent · ${currentEvent?.notificationsSent.emailCount} Emails dispatched`
        : 'Standby for confirmation',
    },
    {
      id: 5,
      title: '5. Response Initiated',
      desc: 'Nearest trauma center & highway rescue dispatch pre-alerted',
      icon: Ambulance,
      status: isConfirmed ? 'COMPLETED' : 'IDLE',
      details: isConfirmed
        ? 'Amrutvahini Trauma Center & Highway Patrol 108 Pre-Alerted'
        : 'Rescue coordination ready',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Golden Hour Rescue Window Banner (from PPT Slide 4) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">The Golden Hour Rescue Window</div>
            <div className="text-slate-400">
              Immediate automated alert dispatch reduces emergency response latency from 30+ minutes down to 3 minutes.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>Workflow Status:</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
              isConfirmed
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : isPending
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}
          >
            {isConfirmed ? 'EMERGENCY IN PROGRESS' : isPending ? 'VERIFYING ACCIDENT' : 'MONITORING NOMINAL'}
          </span>
        </div>
      </div>

      {/* 5-Step Automated Mechanism Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = step.status === 'COMPLETED';
          const isActive = step.status === 'ACTIVE';
          const isCancelled = step.status === 'CANCELLED';

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all relative ${
                isActive
                  ? 'bg-amber-950/20 border-amber-500/60 shadow-lg'
                  : isDone
                  ? 'bg-slate-900 border-emerald-500/40'
                  : isCancelled
                  ? 'bg-slate-900/60 border-slate-800 opacity-60'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-400'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCancelled
                      ? 'bg-slate-800 text-slate-500'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>

              <div className="text-xs font-bold text-white mb-1">{step.title}</div>
              <div className="text-[11px] text-slate-400 leading-relaxed mb-3">{step.desc}</div>

              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-300">
                {step.details}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
