import React from 'react';
import { Play, AlertTriangle, RotateCw, Activity, RotateCcw } from 'lucide-react';

interface DemoModeBarProps {
  onTriggerPreset: (preset: string) => void;
  activePreset: string | null;
  loading: boolean;
}

export const DemoModeBar: React.FC<DemoModeBarProps> = ({
  onTriggerPreset,
  activePreset,
  loading,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Demo Mode Controls
          </span>
          <span className="text-slate-500 text-xs hidden sm:inline">·</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Interactive scenarios for college demonstration
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onTriggerPreset('NORMAL_MOVEMENT')}
            disabled={loading}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activePreset === 'NORMAL_MOVEMENT'
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
            }`}
          >
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>1. Normal Movement</span>
          </button>

          <button
            onClick={() => onTriggerPreset('SUDDEN_IMPACT')}
            disabled={loading}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activePreset === 'SUDDEN_IMPACT'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-amber-950/40 hover:text-amber-300 border border-slate-700/60'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>2. Sudden Impact (4.2g)</span>
          </button>

          <button
            onClick={() => onTriggerPreset('HIGH_ROTATION')}
            disabled={loading}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activePreset === 'HIGH_ROTATION'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-purple-950/40 hover:text-purple-300 border border-slate-700/60'
            }`}
          >
            <RotateCw className="w-3 h-3 text-purple-400" />
            <span>3. High Rotation (310°/s)</span>
          </button>

          <button
            onClick={() => onTriggerPreset('POSSIBLE_ACCIDENT')}
            disabled={loading}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm ${
              activePreset === 'POSSIBLE_ACCIDENT'
                ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                : 'bg-rose-600/90 text-white hover:bg-rose-500'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>4. Possible Accident</span>
          </button>

          <button
            onClick={() => onTriggerPreset('RESET')}
            disabled={loading}
            className="px-2.5 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center gap-1"
            title="Reset Simulation to Initial State"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
