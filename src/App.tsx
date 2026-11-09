import { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { DemoModeBar } from './components/DemoModeBar';
import { DashboardOverview } from './components/DashboardOverview';
import { SensorMonitoring } from './components/SensorMonitoring';
import { GpsMap } from './components/GpsMap';
import { ResponseWorkflow } from './components/ResponseWorkflow';
import { AccidentHistory } from './components/AccidentHistory';
import { AnalyticsView } from './components/AnalyticsView';
import { DepartmentConsole } from './components/DepartmentConsole';
import { AuthView } from './components/AuthView';
import { VirtualHardwareWorkbench } from './components/VirtualHardwareWorkbench';
import { SettingsView } from './components/SettingsView';
import { AccidentVerificationModal } from './components/AccidentVerificationModal';
import { EmergencyAlertPanel } from './components/EmergencyAlertPanel';
import {
  ProcessedData,
  LocationData,
  UserProfile,
  EmergencyContact,
  AccidentEvent,
  NearbyHospital,
  AuthUser,
  UserRole,
} from './types';
import {
  processSensorReading,
  DEFAULT_THRESHOLDS,
} from './utils/accidentDetection';
import { playEmergencySiren } from './utils/audioAlert';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Sensor & Hardware State
  const [sensorData, setSensorData] = useState<ProcessedData>(() =>
    processSensorReading({
      ax: 0.04,
      ay: -0.02,
      az: 1.01,
      gx: 0.6,
      gy: -0.8,
      gz: 0.2,
      timestamp: Date.now(),
    })
  );

  const [tempC, setTempC] = useState(28.5);
  const [source, setSource] = useState('DEMO_MODE');
  const [systemConnected, setSystemConnected] = useState(true);

  // Location State (Amrutvahini College of Engineering, Sangamner)
  const [location, setLocation] = useState<LocationData>({
    lat: 19.6138,
    lng: 74.2057,
    address: 'Amrutnagar, Ghulewadi, Sangamner, Maharashtra 422608',
    speedKmh: 42.5,
    satellites: 9,
    accuracyMeters: 2.8,
    isSimulated: true,
  });

  // User Profile & Contacts State
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'Omkar Shinde',
    email: 'omkarshinde.cse@gmail.com',
    phone: '+91 98765 43210',
    bloodGroup: 'B+',
    vehicleNumber: 'MH-17-CS-2026',
    vehicleModel: 'KTM Duke 390 / Tata Nexon EV',
    college: 'Amrutvahini College of Engineering, Sangamner',
    team: 'Team Alert (SADES 6.0)',
  });

  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: 'c1',
      name: 'Anjali Nimse (Team Leader)',
      relationship: 'Project Lead / Emergency Contact',
      phone: '+91 94220 11223',
      email: 'anjali.nimse@avcoe.edu.in',
      notifySms: true,
      notifyCall: true,
      notifyEmail: true,
    },
    {
      id: 'c2',
      name: 'Family Emergency Contact',
      relationship: 'Parent / Guardian',
      phone: '+91 98223 44556',
      email: 'parent.contact@gmail.com',
      notifySms: true,
      notifyCall: true,
      notifyEmail: false,
    },
    {
      id: 'c3',
      name: 'National Emergency Response (112)',
      relationship: 'Emergency Medical & Police',
      phone: '112',
      email: 'dispatch@emergency112.gov.in',
      notifySms: true,
      notifyCall: true,
      notifyEmail: true,
    },
  ]);

  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);

  // User Authentication & Roles (Driver vs SADES Department vs Paramedic)
  const [currentUser, setCurrentUser] = useState<AuthUser>({
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
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    if (user.role === 'SADES_DEPARTMENT') {
      setActiveTab('department');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === 'SADES_DEPARTMENT') {
      setCurrentUser({
        id: 'usr_dept_anjali',
        fullName: 'Anjali Nimse (Head Dispatcher)',
        email: 'dispatch.hq@sades.gov.in',
        role: 'SADES_DEPARTMENT',
        phone: '+91 94220 11223',
        badgeNumber: 'SADES-DISPATCH-01',
        department: 'SADES Central Command & Emergency Dispatch Division',
        college: 'Amrutvahini College of Engineering, Sangamner',
      });
      setActiveTab('department');
    } else if (newRole === 'EMERGENCY_RESPONDER') {
      setCurrentUser({
        id: 'usr_responder_sahil',
        fullName: 'Dr. Sahil Pardeshi (EMS 108 Lead)',
        email: 'rescue108@amrutvahini.org',
        role: 'EMERGENCY_RESPONDER',
        phone: '+91 98223 44556',
        badgeNumber: 'EMS-TRAUMA-108',
        department: 'Amrutvahini Rural Hospital & Trauma Centre',
        college: 'Amrutvahini College of Engineering, Sangamner',
      });
      setActiveTab('location');
    } else {
      setCurrentUser({
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
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setShowLoginModal(true);
  };

  // Verification & Incident State
  const [pendingVerificationEvent, setPendingVerificationEvent] = useState<AccidentEvent | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(10);
  const [confirmedEmergencyEvent, setConfirmedEmergencyEvent] = useState<AccidentEvent | null>(null);
  const [accidentHistory, setAccidentHistory] = useState<AccidentEvent[]>([]);
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);

  // Fetch initial history & nearby hospitals
  const loadInitialData = useCallback(async () => {
    try {
      const [histRes, hospRes, cfgRes] = await Promise.all([
        fetch('/api/accidents/history'),
        fetch('/api/hospitals/nearby'),
        fetch('/api/config'),
      ]);

      if (histRes.ok) {
        const histData = await histRes.json();
        setAccidentHistory(histData.events || []);
      }
      if (hospRes.ok) {
        const hospData = await hospRes.json();
        setHospitals(hospData);
      }
      if (cfgRes.ok) {
        const cfgData = await cfgRes.json();
        if (cfgData.profile) setProfile(cfgData.profile);
        if (cfgData.contacts) setContacts(cfgData.contacts);
        if (cfgData.thresholds) setThresholds(cfgData.thresholds);
      }
    } catch (err) {
      console.debug('Initial data load note:', err);
    }
  }, []);

  // Connect to Server-Sent Events (SSE) Stream
  useEffect(() => {
    loadInitialData();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.sensors) {
            setSensorData(processSensorReading(data.sensors.reading));
            setSource(data.sensors.source);
            setTempC(data.sensors.tempC || 28.5);
            setLocation(data.sensors.location);
            setSystemConnected(data.sensors.connected);
          }

          if (data.activeVerification && data.activeVerification.event) {
            const actEvt = data.activeVerification.event;
            // Only set pending verification when actively counting down
            if (actEvt.status === 'PENDING_VERIFICATION') {
              setPendingVerificationEvent(actEvt);
              setRemainingSeconds(data.activeVerification.remainingSeconds ?? 10);
            } else {
              setPendingVerificationEvent(null);
            }

            // Confirmed accident or Manual SOS
            if (actEvt.status === 'CONFIRMED' || actEvt.status === 'MANUAL_SOS') {
              setConfirmedEmergencyEvent(actEvt);
            }
          } else {
            setPendingVerificationEvent(null);
            setConfirmedEmergencyEvent(null);
          }
        } catch (parseErr) {
          console.debug('SSE parse error:', parseErr);
        }
      };

      eventSource.onerror = () => {
        setSystemConnected(false);
      };
    } catch (err) {
      console.debug('EventSource error:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [loadInitialData]);

  // Dismiss / Stand Down Emergency Handler (synchronizes with server)
  const handleDismissEmergency = async () => {
    setConfirmedEmergencyEvent(null);
    setPendingVerificationEvent(null);
    try {
      await fetch('/api/accidents/dismiss', { method: 'POST' });
      const histRes = await fetch('/api/accidents/history');
      if (histRes.ok) {
        const histData = await histRes.json();
        setAccidentHistory(histData.events || []);
      }
    } catch (err) {
      console.debug('Dismiss error:', err);
    }
  };

  // Demo Mode Preset Trigger
  const handleTriggerPreset = async (preset: string) => {
    setActivePreset(preset);
    setLoading(true);
    try {
      const res = await fetch('/api/simulator/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset }),
      });
      const data = await res.json();
      if (data.reading) {
        setSensorData(processSensorReading(data.reading));
      }

      if (preset === 'RESET') {
        setPendingVerificationEvent(null);
        setConfirmedEmergencyEvent(null);
        await fetch('/api/accidents/dismiss', { method: 'POST' });
      }

      // Refresh history
      const histRes = await fetch('/api/accidents/history');
      if (histRes.ok) {
        const histData = await histRes.json();
        setAccidentHistory(histData.events || []);
      }
    } catch (err) {
      console.error('Preset trigger error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manual SOS Trigger
  const handleTriggerSOS = async () => {
    try {
      // Play audible emergency alarm
      playEmergencySiren();

      const res = await fetch('/api/accidents/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.event) {
        setConfirmedEmergencyEvent(data.event);
        setPendingVerificationEvent(null);
      }

      const histRes = await fetch('/api/accidents/history');
      if (histRes.ok) {
        const histData = await histRes.json();
        setAccidentHistory(histData.events || []);
      }
    } catch (err) {
      console.error('Manual SOS error:', err);
    }
  };

  // Accident Verification Action ("I'M SAFE" vs "SEND EMERGENCY ALERT")
  const handleVerifyAction = async (action: 'SAFE' | 'CONFIRM') => {
    try {
      const res = await fetch('/api/accidents/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (action === 'SAFE') {
        setPendingVerificationEvent(null);
      } else if (action === 'CONFIRM' && data.event) {
        setConfirmedEmergencyEvent(data.event);
        setPendingVerificationEvent(null);
      }

      const histRes = await fetch('/api/accidents/history');
      if (histRes.ok) {
        const histData = await histRes.json();
        setAccidentHistory(histData.events || []);
      }
    } catch (err) {
      console.error('Verify action error:', err);
    }
  };

  // Ingest Sensor Data from Virtual Hardware Workbench sliders
  const handleWorkbenchSensorInject = async (reading: {
    ax: number;
    ay: number;
    az: number;
    gx: number;
    gy: number;
    gz: number;
  }) => {
    try {
      const res = await fetch('/api/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reading,
          source: 'WOKWI_SIMULATOR',
          device_id: 'SADES-VIRTUAL-ESP32',
        }),
      });
      const data = await res.json();
      if (data.evaluation?.processedData) {
        setSensorData(data.evaluation.processedData);
      }
    } catch (err) {
      console.error('Sensor injection error:', err);
    }
  };

  const handleSaveProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: newProfile }),
    });
  };

  const handleSaveContacts = async (newContacts: EmergencyContact[]) => {
    setContacts(newContacts);
    await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts: newContacts }),
    });
  };

  const handleSaveThresholds = async (newThresholds: typeof thresholds) => {
    setThresholds(newThresholds);
    await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thresholds: newThresholds }),
    });
  };

  const latestEvent = pendingVerificationEvent || confirmedEmergencyEvent || accidentHistory[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-rose-500 selection:text-white">
      {/* Top Bar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={{
          connected: systemConnected,
          hasPendingAlert: pendingVerificationEvent !== null,
          hasActiveEmergency: confirmedEmergencyEvent !== null,
          source,
        }}
        currentUser={currentUser}
        onOpenLogin={() => setShowLoginModal(true)}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        onTriggerSOS={handleTriggerSOS}
      />

      {/* Compulsory Demo Mode Controller Strip */}
      <DemoModeBar
        onTriggerPreset={handleTriggerPreset}
        activePreset={activePreset}
        loading={loading}
      />

      {/* Main Viewport Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Emergency Alert Banner if Confirmed */}
        {confirmedEmergencyEvent && (
          <EmergencyAlertPanel
            event={confirmedEmergencyEvent}
            profile={profile}
            contacts={contacts}
            onDismiss={handleDismissEmergency}
          />
        )}

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            processed={sensorData}
            location={location}
            systemConnected={systemConnected}
            source={source}
            contacts={contacts}
            lastEvent={latestEvent}
            onNavigateTab={setActiveTab}
            onTriggerSOS={handleTriggerSOS}
            onTriggerPreset={handleTriggerPreset}
          />
        )}

        {activeTab === 'sensors' && (
          <SensorMonitoring
            processed={sensorData}
            source={source}
            tempC={tempC}
          />
        )}

        {activeTab === 'location' && (
          <GpsMap
            location={location}
            hospitals={hospitals}
            hasActiveIncident={pendingVerificationEvent !== null || confirmedEmergencyEvent !== null}
          />
        )}

        {activeTab === 'workflow' && (
          <ResponseWorkflow
            currentEvent={pendingVerificationEvent || confirmedEmergencyEvent}
          />
        )}

        {activeTab === 'department' && (
          <DepartmentConsole
            currentUser={currentUser}
            events={accidentHistory}
            hospitals={hospitals}
            onTriggerSOS={handleTriggerSOS}
            onOpenMap={() => setActiveTab('location')}
            onDismissEmergency={handleDismissEmergency}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView events={accidentHistory} />
        )}

        {activeTab === 'history' && (
          <AccidentHistory events={accidentHistory} />
        )}

        {activeTab === 'hardware' && (
          <VirtualHardwareWorkbench
            processed={sensorData}
            location={location}
            hasActiveIncident={pendingVerificationEvent !== null || confirmedEmergencyEvent !== null}
            remainingSeconds={remainingSeconds}
            onSendSensorData={handleWorkbenchSensorInject}
            onTriggerSOS={handleTriggerSOS}
            onConfirmSafe={() => handleVerifyAction('SAFE')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            contacts={contacts}
            thresholds={thresholds}
            onSaveProfile={handleSaveProfile}
            onSaveContacts={handleSaveContacts}
            onSaveThresholds={handleSaveThresholds}
          />
        )}
      </main>

      {/* 10-Second Accident Verification Modal */}
      <AccidentVerificationModal
        event={pendingVerificationEvent}
        remainingSeconds={remainingSeconds}
        onConfirmSafe={() => handleVerifyAction('SAFE')}
        onSendAlertNow={() => handleVerifyAction('CONFIRM')}
      />

      {/* Multi-Portal Login & Registration Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-4 flex items-center justify-center">
          <AuthView
            onLogin={handleLogin}
            onCancel={() => setShowLoginModal(false)}
            initialRole={currentUser.role}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-slate-400">SADES</strong> – Smart Accident Detection & Emergency Response System
          </div>
          <div>
            Amrutvahini College of Engineering, Sangamner · Team Alert
          </div>
        </div>
      </footer>
    </div>
  );
}
