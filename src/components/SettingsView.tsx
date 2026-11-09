import React, { useState } from 'react';
import {
  User,
  Phone,
  Sliders,
  Shield,
  Plus,
  Trash2,
  Save,
  Check,
  Download,
  Terminal,
  Copy,
  Laptop,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { UserProfile, EmergencyContact } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  contacts: EmergencyContact[];
  thresholds: {
    impactGThreshold: number;
    gyroRateThreshold: number;
    rollThreshold: number;
    pitchThreshold: number;
  };
  onSaveProfile: (profile: UserProfile) => void;
  onSaveContacts: (contacts: EmergencyContact[]) => void;
  onSaveThresholds: (thresholds: {
    impactGThreshold: number;
    gyroRateThreshold: number;
    rollThreshold: number;
    pitchThreshold: number;
  }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  contacts,
  thresholds,
  onSaveProfile,
  onSaveContacts,
  onSaveThresholds,
}) => {
  const [userForm, setUserForm] = useState<UserProfile>(profile);
  const [contactsList, setContactsList] = useState<EmergencyContact[]>(contacts);
  const [thresholdForm, setThresholdForm] = useState(thresholds);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCommand(label);
    setTimeout(() => setCopiedCommand(null), 2500);
  };

  const handleSaveAll = () => {
    onSaveProfile(userForm);
    onSaveContacts(contactsList);
    onSaveThresholds(thresholdForm);
    setSavedBanner('Settings saved successfully!');
    setTimeout(() => setSavedBanner(null), 3000);
  };

  const addContact = () => {
    const newContact: EmergencyContact = {
      id: `c_${Date.now()}`,
      name: 'New Contact',
      relationship: 'Family / Friend',
      phone: '+91 98000 00000',
      email: 'contact@example.com',
      notifySms: true,
      notifyCall: false,
      notifyEmail: true,
    };
    setContactsList([...contactsList, newContact]);
  };

  const removeContact = (id: string) => {
    setContactsList(contactsList.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {savedBanner && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{savedBanner}</span>
        </div>
      )}

      {/* User Profile */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <User className="w-4 h-4" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Vehicle Operator & Student Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={userForm.fullName}
              onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Mobile Contact</label>
            <input
              type="text"
              value={userForm.phone}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Blood Group</label>
            <input
              type="text"
              value={userForm.bloodGroup}
              onChange={(e) => setUserForm({ ...userForm, bloodGroup: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Vehicle Registration Number</label>
            <input
              type="text"
              value={userForm.vehicleNumber}
              onChange={(e) => setUserForm({ ...userForm, vehicleNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Vehicle Make & Model</label>
            <input
              type="text"
              value={userForm.vehicleModel}
              onChange={(e) => setUserForm({ ...userForm, vehicleModel: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Detection Sensitivity Tuning */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <Sliders className="w-4 h-4" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Accident Detection Thresholds & Calibration
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <label className="block text-slate-400 mb-1">Impact G-Force Threshold</label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                step="0.1"
                min="1.5"
                max="8.0"
                value={thresholdForm.impactGThreshold}
                onChange={(e) =>
                  setThresholdForm({ ...thresholdForm, impactGThreshold: parseFloat(e.target.value) || 3.2 })
                }
                className="w-24 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-bold"
              />
              <span className="text-slate-400 font-sans">g (default: 3.2g)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-2">
              Threshold above which sudden deceleration is flagged as collision.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <label className="block text-slate-400 mb-1">Gyro Rate Threshold</label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                step="10"
                min="100"
                max="600"
                value={thresholdForm.gyroRateThreshold}
                onChange={(e) =>
                  setThresholdForm({ ...thresholdForm, gyroRateThreshold: parseFloat(e.target.value) || 250 })
                }
                className="w-24 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-bold"
              />
              <span className="text-slate-400 font-sans">°/s (default: 250°/s)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-2">
              Rate of rotation indicative of vehicular flip or high-speed spin.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <label className="block text-slate-400 mb-1">Rollover Tilt Limit</label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                step="5"
                min="30"
                max="90"
                value={thresholdForm.rollThreshold}
                onChange={(e) =>
                  setThresholdForm({
                    ...thresholdForm,
                    rollThreshold: parseFloat(e.target.value) || 60,
                    pitchThreshold: parseFloat(e.target.value) || 60,
                  })
                }
                className="w-24 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-bold"
              />
              <span className="text-slate-400 font-sans">deg (default: 60°)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-2">
              Max allowable vehicle tilt angle before inversion is detected.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Management */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400">
            <Phone className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Emergency Contacts & Dispatch Recipients
            </h3>
          </div>

          <button
            onClick={addContact}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Contact</span>
          </button>
        </div>

        <div className="space-y-3">
          {contactsList.map((contact, idx) => (
            <div
              key={contact.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
            >
              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => {
                    const updated = [...contactsList];
                    updated[idx].name = e.target.value;
                    setContactsList(updated);
                  }}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white font-medium"
                  placeholder="Contact Name"
                />
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={contact.phone}
                  onChange={(e) => {
                    const updated = [...contactsList];
                    updated[idx].phone = e.target.value;
                    setContactsList(updated);
                  }}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white font-mono"
                  placeholder="Phone Number"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={contact.notifySms}
                    onChange={(e) => {
                      const updated = [...contactsList];
                      updated[idx].notifySms = e.target.checked;
                      setContactsList(updated);
                    }}
                    className="accent-rose-500"
                  />
                  <span>SMS</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={contact.notifyCall}
                    onChange={(e) => {
                      const updated = [...contactsList];
                      updated[idx].notifyCall = e.target.checked;
                      setContactsList(updated);
                    }}
                    className="accent-rose-500"
                  />
                  <span>Call</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={contact.notifyEmail}
                    onChange={(e) => {
                      const updated = [...contactsList];
                      updated[idx].notifyEmail = e.target.checked;
                      setContactsList(updated);
                    }}
                    className="accent-rose-500"
                  />
                  <span>Email</span>
                </label>
              </div>

              <div className="sm:col-span-2 text-right">
                <button
                  onClick={() => removeContact(contact.id)}
                  className="p-1.5 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button Row */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveAll}
          className="px-6 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save System Configurations</span>
        </button>
      </div>

      {/* GitHub Project Export & Offline Run Guide */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-rose-400">
            <FileCode className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Complete Project Package & GitHub Upload Guide
            </h3>
          </div>

          <a
            href="/sades-project.zip"
            download="SADES_Complete_GitHub_Project.zip"
            className="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download All Files (.ZIP)</span>
          </a>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed">
          The download package includes the entire source code (Node.js/Express backend, Vite React frontend, Leaflet mapping, Recharts 30-day analytics, MPU6050 algorithm, ESP32 Arduino C++ firmware, and Wokwi simulation files). Everything is ready to push directly to GitHub and run on any other computer.
        </p>

        {/* 2-Column Instructions: Run Locally vs Push to GitHub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: How to run on another computer */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <Laptop className="w-4 h-4" />
              <span>1. Run on Another System</span>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-slate-300 text-[11px] leading-relaxed">
              <li>
                <strong className="text-white">Extract</strong> <code className="text-rose-300 bg-slate-900 px-1 py-0.5 rounded">SADES_Complete_GitHub_Project.zip</code> to a folder.
              </li>
              <li>
                Ensure you have <strong className="text-white">Node.js 18+</strong> installed.
              </li>
              <li>
                Open a terminal in the extracted folder and run:
                <div className="mt-1.5 p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                  <span>npm install</span>
                  <button
                    onClick={() => copyToClipboard('npm install', 'npm-install')}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Copy command"
                  >
                    {copiedCommand === 'npm-install' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </li>
              <li>
                Start the full-stack system:
                <div className="mt-1.5 p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                  <span>npm run dev</span>
                  <button
                    onClick={() => copyToClipboard('npm run dev', 'npm-dev')}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Copy command"
                  >
                    {copiedCommand === 'npm-dev' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </li>
              <li>
                Open <strong className="text-white">http://localhost:3000</strong> in your browser.
              </li>
            </ol>
          </div>

          {/* Card 2: How to push to GitHub */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>2. Upload to GitHub Repository</span>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(
                    `git init\ngit add .\ngit commit -m "Initial commit: SADES IoT Accident Detection System v6.0"\ngit branch -M main\ngit remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git\ngit push -u origin main`,
                    'git-all'
                  )
                }
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition-colors"
              >
                {copiedCommand === 'git-all' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-slate-400 text-[11px]">
              Run these commands in terminal inside the extracted project folder:
            </p>

            <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1 overflow-x-auto leading-tight">
              <div><span className="text-rose-400">git</span> init</div>
              <div><span className="text-rose-400">git</span> add .</div>
              <div><span className="text-rose-400">git</span> commit -m <span className="text-emerald-300">"SADES IoT Project"</span></div>
              <div><span className="text-rose-400">git</span> branch -M main</div>
              <div><span className="text-rose-400">git</span> remote add origin <span className="text-sky-300">https://github.com/USER/REPO.git</span></div>
              <div><span className="text-rose-400">git</span> push -u origin main</div>
            </pre>
          </div>
        </div>
      </div>

      {/* College Project & Team Alert Credentials (from PPT Slide 1) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield className="w-4 h-4 text-rose-500" />
          <h3 className="font-bold text-white uppercase tracking-wider">
            Academic Project Accreditation & Team Alert Credentials
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-white font-bold text-sm">Amrutvahini College of Engineering, Sangamner</div>
            <div className="text-slate-400">Department of Computer Engineering</div>
            <div className="text-slate-400">Domain: Disaster Resilience, Public Health & Community Well-being</div>
            <div className="text-slate-400">Theme: Automotive Technology, Robotics and Automation</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-white font-bold">Team Alert Members:</div>
            <div className="text-slate-300">1. Anjali Nimse (Leader)</div>
            <div className="text-slate-300">2. Ojasvi Padol</div>
            <div className="text-slate-300 font-semibold text-rose-400">3. Omkar Shinde (Presenter & Developer)</div>
            <div className="text-slate-300">4. Sahil Pardeshi</div>
          </div>
        </div>
      </div>
    </div>
  );
};
