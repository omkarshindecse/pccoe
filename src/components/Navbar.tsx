import React from 'react';
import {
  Volume2,
  VolumeX,
  ShieldAlert,
  Car,
  Building2,
  Ambulance,
  ArrowLeftRight,
  Download,
} from 'lucide-react';
import { setAudioMuted, getAudioMuted } from '../utils/audioAlert';
import { AuthUser, UserRole } from '../types';

export type NavTab =
  | 'dashboard'
  | 'sensors'
  | 'location'
  | 'workflow'
  | 'analytics'
  | 'department'
  | 'history'
  | 'hardware'
  | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  systemStatus: {
    connected: boolean;
    hasPendingAlert: boolean;
    hasActiveEmergency?: boolean;
    source: string;
  };
  currentUser: AuthUser;
  onOpenLogin: () => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  onTriggerSOS: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  currentUser,
  onOpenLogin,
  onSwitchRole,
  onLogout,
  onTriggerSOS,
}) => {
  const [muted, setMuted] = React.useState(getAudioMuted());

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
  };

  // Nav Links tailored for active role
  const isDept = currentUser.role === 'SADES_DEPARTMENT';

  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: isDept ? 'Overview' : 'Dashboard' },
    ...(isDept ? [{ id: 'department' as NavTab, label: 'Dispatch Desk' }] : []),
    { id: 'analytics', label: '30D Analytics' },
    { id: 'sensors', label: 'Sensors' },
    { id: 'location', label: 'Location' },
    { id: 'workflow', label: 'Response Workflow' },
    { id: 'history', label: 'Event History' },
    { id: 'hardware', label: 'Virtual Hardware' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 font-bold text-base">
                  S
                </div>
                <div>
                  <span className="text-base font-bold tracking-tight text-white group-hover:text-rose-400 transition-colors whitespace-nowrap">
                    SADES
                  </span>
                  <span className="hidden sm:inline-block ml-1.5 text-xs font-mono text-slate-400">
                    v6.0
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Zone 2: Single-line navigation links */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`transition-colors whitespace-nowrap shrink-0 py-1 text-xs uppercase tracking-wider ${
                    isActive
                      ? 'text-rose-400 font-semibold border-b-2 border-rose-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Role Indicator */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Active User Role Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-xs">
              {currentUser.role === 'DRIVER' && (
                <span className="flex items-center gap-1.5 text-rose-300 font-medium">
                  <Car className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Driver:</span>
                  <span className="text-white font-semibold truncate max-w-[100px]">{currentUser.fullName}</span>
                </span>
              )}
              {currentUser.role === 'SADES_DEPARTMENT' && (
                <span className="flex items-center gap-1.5 text-sky-300 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">HQ Dept:</span>
                  <span className="text-white font-semibold truncate max-w-[100px]">{currentUser.fullName}</span>
                </span>
              )}
              {currentUser.role === 'EMERGENCY_RESPONDER' && (
                <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <Ambulance className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">108 EMS:</span>
                  <span className="text-white font-semibold truncate max-w-[100px]">{currentUser.fullName}</span>
                </span>
              )}

              {/* Quick Role Switcher Button */}
              <button
                onClick={() =>
                  onSwitchRole(currentUser.role === 'DRIVER' ? 'SADES_DEPARTMENT' : 'DRIVER')
                }
                title="Switch between Driver and SADES Department portal"
                className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1"
              >
                <ArrowLeftRight className="w-2.5 h-2.5" />
                <span>Switch</span>
              </button>
            </div>

            {/* Download Project ZIP for GitHub */}
            <a
              href="/sades-project.zip"
              download="SADES_Complete_GitHub_Project.zip"
              title="Download Complete Source Code for GitHub (.zip)"
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Download ZIP</span>
            </a>

            {/* Login / Auth Portal Button */}
            <button
              onClick={onOpenLogin}
              title="Open Role Login & Registration Portal"
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-xs font-medium hidden md:flex items-center gap-1"
            >
              <span>Login Portal</span>
            </button>

            {/* Buzzer Mute Toggle */}
            <button
              onClick={toggleMute}
              title={muted ? 'Unmute Piezo Buzzer Audio' : 'Mute Piezo Buzzer Audio'}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors focus:outline-none"
              aria-label={muted ? 'Unmute buzzer' : 'Mute buzzer'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Manual SOS Trigger */}
            <button
              onClick={onTriggerSOS}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer ${
                systemStatus.hasActiveEmergency
                  ? 'bg-rose-700 text-white animate-pulse ring-2 ring-rose-400'
                  : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{systemStatus.hasActiveEmergency ? 'SOS Active' : 'Manual SOS'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="xl:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
