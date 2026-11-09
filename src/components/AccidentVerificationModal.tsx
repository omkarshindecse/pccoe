import React, { useEffect } from 'react';
import { AlertOctagon, CheckCircle2, Send, MapPin, Gauge } from 'lucide-react';
import { AccidentEvent } from '../types';
import { playCountdownBeep, playSafeChime, playEmergencySiren } from '../utils/audioAlert';

interface AccidentVerificationModalProps {
  event: AccidentEvent | null;
  remainingSeconds: number;
  onConfirmSafe: () => void;
  onSendAlertNow: () => void;
}

export const AccidentVerificationModal: React.FC<AccidentVerificationModalProps> = ({
  event,
  remainingSeconds,
  onConfirmSafe,
  onSendAlertNow,
}) => {
  if (!event || event.status !== 'PENDING_VERIFICATION') {
    return null;
  }

  // Play audio pulse each second remaining
  useEffect(() => {
    if (remainingSeconds > 0) {
      playCountdownBeep(2200 + (10 - remainingSeconds) * 80, 0.12);
    } else if (remainingSeconds === 0) {
      playEmergencySiren();
    }
  }, [remainingSeconds]);

  const handleSafeClick = () => {
    playSafeChime();
    onConfirmSafe();
  };

  const handleAlertClick = () => {
    playEmergencySiren();
    onSendAlertNow();
  };

  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / 10) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border-2 border-rose-500/80 shadow-2xl overflow-hidden">
        {/* Urgent Header Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 px-6 py-4 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertOctagon className="w-7 h-7 animate-bounce text-white" />
            <h2 className="text-xl font-bold tracking-tight uppercase">
              Possible Accident Detected!
            </h2>
          </div>
          <p className="text-xs text-rose-100 font-medium">
            Abnormal impact or vehicle tilt identified by MPU6050 sensor array
          </p>
        </div>

        {/* Countdown Timer Display */}
        <div className="p-6 text-center border-b border-slate-800">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Automated Emergency Dispatch In
          </span>
          <div className="flex items-baseline justify-center gap-2 my-2">
            <span className="text-6xl font-extrabold font-mono text-rose-400 tabular-nums">
              {remainingSeconds}
            </span>
            <span className="text-lg font-medium text-slate-400">seconds</span>
          </div>

          {/* Animated Countdown Progress Bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden my-3">
            <div
              className="bg-rose-500 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-slate-400">
            If no action is taken, emergency contacts and medical rescue services will be notified automatically.
          </p>
        </div>

        {/* Telemetry Snapshot Breakdown */}
        <div className="px-6 py-4 bg-slate-950/60 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-rose-400" /> Trigger Reason
            </span>
            <span className="font-semibold text-rose-300 text-right">
              {event.triggerReason}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Impact G:</span>
              <span className="text-white font-semibold">{event.sensorSnapshot.accelMagnitude}g</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Roll Angle:</span>
              <span className="text-white font-semibold">{event.sensorSnapshot.roll}°</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-1">
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Location:
            </span>
            <span className="text-slate-300 font-mono text-[11px] truncate max-w-[260px]">
              {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)} (Simulated)
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900">
          <button
            onClick={handleSafeClick}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-900/30 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I'M SAFE (CANCEL)</span>
          </button>

          <button
            onClick={handleAlertClick}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-rose-900/30 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <Send className="w-5 h-5" />
            <span>SEND EMERGENCY ALERT</span>
          </button>
        </div>

        <div className="px-6 py-2 bg-slate-950 border-t border-slate-800/80 text-[11px] text-center text-slate-500">
          Pressing "I'm Safe" records a false alarm log for machine learning calibration
        </div>
      </div>
    </div>
  );
};
