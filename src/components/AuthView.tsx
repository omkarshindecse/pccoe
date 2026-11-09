import React, { useState } from 'react';
import {
  Car,
  Building2,
  Ambulance,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldAlert,
  BadgeCheck,
  Check,
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';

interface AuthViewProps {
  onLogin: (user: AuthUser) => void;
  onCancel?: () => void;
  initialRole?: UserRole;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onCancel,
  initialRole = 'DRIVER',
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form fields
  const [email, setEmail] = useState('omkarshinde.cse@gmail.com');
  const [password, setPassword] = useState('sades@2026');
  const [fullName, setFullName] = useState('Omkar Shinde');
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [vehicleNumber, setVehicleNumber] = useState('MH-17-CS-2026');
  const [vehicleModel, setVehicleModel] = useState('KTM Duke 390 / Tata Nexon EV');
  const [badgeNumber, setBadgeNumber] = useState('SADES-HQ-2026');
  const [departmentName, setDepartmentName] = useState('National Highway Traffic & Emergency Ops');
  const [emergencyContact, setEmergencyContact] = useState('+91 94220 11223 (Anjali Nimse)');

  // Sync demo credentials when switching roles
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'DRIVER') {
      setEmail('omkarshinde.cse@gmail.com');
      setFullName('Omkar Shinde');
      setMobile('+91 98765 43210');
      setVehicleNumber('MH-17-CS-2026');
    } else if (role === 'SADES_DEPARTMENT') {
      setEmail('dispatch.hq@sades.gov.in');
      setFullName('Chief Officer Anjali Nimse');
      setMobile('+91 94220 11223');
      setBadgeNumber('SADES-DISPATCH-01');
      setDepartmentName('SADES Central Command & Trauma Dispatch');
    } else if (role === 'EMERGENCY_RESPONDER') {
      setEmail('rescue108@amrutvahini.org');
      setFullName('Dr. Sahil Pardeshi / Paramedic Team 108');
      setMobile('+91 98223 44556');
      setBadgeNumber('EMS-TRAUMA-108');
      setDepartmentName('Amrutvahini Trauma Center Ambulance 108');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const loggedUser: AuthUser = {
      id: `usr_${Date.now()}`,
      fullName,
      email,
      role: selectedRole,
      phone: mobile,
      badgeNumber: selectedRole !== 'DRIVER' ? badgeNumber : undefined,
      department: selectedRole !== 'DRIVER' ? departmentName : undefined,
      vehicleNumber: selectedRole === 'DRIVER' ? vehicleNumber : undefined,
      vehicleModel: selectedRole === 'DRIVER' ? vehicleModel : undefined,
      bloodGroup: selectedRole === 'DRIVER' ? 'B+' : undefined,
      college: 'Amrutvahini College of Engineering, Sangamner',
    };

    onLogin(loggedUser);
  };

  // Quick Preset Logins for instant frictionless evaluation
  const handleQuickLogin = (role: UserRole) => {
    if (role === 'DRIVER') {
      onLogin({
        id: 'usr_driver_omkar',
        fullName: 'Omkar Shinde',
        email: 'omkarshinde.cse@gmail.com',
        role: 'DRIVER',
        phone: '+91 98765 43210',
        vehicleNumber: 'MH-17-CS-2026',
        vehicleModel: 'KTM Duke 390 / Tata Nexon EV',
        bloodGroup: 'B+',
        college: 'Amrutvahini College of Engineering, Sangamner',
      });
    } else if (role === 'SADES_DEPARTMENT') {
      onLogin({
        id: 'usr_dept_anjali',
        fullName: 'Anjali Nimse (Head Dispatcher)',
        email: 'dispatch.hq@sades.gov.in',
        role: 'SADES_DEPARTMENT',
        phone: '+91 94220 11223',
        badgeNumber: 'SADES-DISPATCH-01',
        department: 'SADES Central Command & Emergency Dispatch Division',
        college: 'Amrutvahini College of Engineering, Sangamner',
      });
    } else {
      onLogin({
        id: 'usr_responder_sahil',
        fullName: 'Dr. Sahil Pardeshi (EMS 108 Lead)',
        email: 'rescue108@amrutvahini.org',
        role: 'EMERGENCY_RESPONDER',
        phone: '+91 98223 44556',
        badgeNumber: 'EMS-TRAUMA-108',
        department: 'Amrutvahini Rural Hospital & Trauma Centre',
        college: 'Amrutvahini College of Engineering, Sangamner',
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header Branding */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 font-black text-lg">
              S
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
                SADES 6.0 Security & Access Portal
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {isRegisterMode ? 'Register New Account' : 'Multi-Portal System Authentication'}
              </h1>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white text-xs font-semibold p-1"
            >
              ✕ Close
            </button>
          )}
        </div>

        {/* Role Selector Tabs (Driver vs SADES Dept vs Emergency Responder) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2.5">
            Select Your Role & Operational Portal:
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelectRole('DRIVER')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'DRIVER'
                  ? 'bg-rose-950/40 border-rose-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Car className={`w-4 h-4 ${selectedRole === 'DRIVER' ? 'text-rose-400' : 'text-slate-500'}`} />
                {selectedRole === 'DRIVER' && <Check className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <div className="font-bold text-xs">Driver Portal</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">Vehicle Operator</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('SADES_DEPARTMENT')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'SADES_DEPARTMENT'
                  ? 'bg-sky-950/40 border-sky-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Building2 className={`w-4 h-4 ${selectedRole === 'SADES_DEPARTMENT' ? 'text-sky-400' : 'text-slate-500'}`} />
                {selectedRole === 'SADES_DEPARTMENT' && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </div>
              <div className="font-bold text-xs">SADES Dept</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">Dispatch & HQ</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('EMERGENCY_RESPONDER')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'EMERGENCY_RESPONDER'
                  ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Ambulance className={`w-4 h-4 ${selectedRole === 'EMERGENCY_RESPONDER' ? 'text-emerald-400' : 'text-slate-500'}`} />
                {selectedRole === 'EMERGENCY_RESPONDER' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="font-bold text-xs">108 Responder</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">Trauma Center</div>
            </button>
          </div>
        </div>

        {/* 1-Click Demo Evaluation Presets */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <BadgeCheck className="w-3.5 h-3.5 text-rose-400" />
            Quick Demo Login:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('DRIVER')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700 transition-colors"
            >
              Driver (Omkar)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('SADES_DEPARTMENT')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-[11px] border border-sky-800/40 transition-colors"
            >
              SADES HQ (Anjali)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('EMERGENCY_RESPONDER')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[11px] border border-emerald-800/40 transition-colors"
            >
              Paramedic 108
            </button>
          </div>
        </div>

        {/* Login / Registration Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
          {isRegisterMode && (
            <div>
              <label className="block text-slate-400 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  placeholder="e.g. Omkar Shinde"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1">
              {selectedRole === 'DRIVER' ? 'Driver Email / Username' : 'Department Official Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500 font-mono"
                placeholder="name@avcoe.edu.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500 font-mono"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Role-Specific Fields */}
          {selectedRole === 'DRIVER' ? (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 mb-1">Vehicle Reg Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-rose-500"
                  placeholder="MH-17-CS-2026"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Vehicle Model</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  placeholder="KTM Duke 390"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-400 mb-1">Officer Badge ID</label>
                <input
                  type="text"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-sky-500"
                  placeholder="SADES-HQ-01"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Emergency Division</label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 truncate"
                  placeholder="Central Dispatch Division"
                />
              </div>
            </div>
          )}

          {isRegisterMode && selectedRole === 'DRIVER' && (
            <div>
              <label className="block text-slate-400 mb-1">Primary Emergency Contact</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  placeholder="+91 94220 11223 (Team Lead)"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer ${
                selectedRole === 'DRIVER'
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : selectedRole === 'SADES_DEPARTMENT'
                  ? 'bg-sky-600 hover:bg-sky-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <span>
                {isRegisterMode
                  ? `Create ${selectedRole.replace('_', ' ')} Account`
                  : `Sign In to ${selectedRole.replace('_', ' ')} Portal`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle Login / Register */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>
              {isRegisterMode ? 'Already registered?' : 'Need to onboard a new driver or officer?'}
            </span>
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-rose-400 hover:text-rose-300 font-semibold"
            >
              {isRegisterMode ? 'Switch to Login' : 'Create New Account'}
            </button>
          </div>
        </form>

        {/* Security / Verification Badge */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            End-to-End Cryptographic Session
          </span>
          <span>AVCOE Team Alert 6.0</span>
        </div>
      </div>
    </div>
  );
};
