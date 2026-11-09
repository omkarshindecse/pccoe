import React, { useState } from 'react';
import { Download, Filter, Eye, AlertOctagon, CheckCircle2, ShieldAlert, MapPin, Gauge } from 'lucide-react';
import { AccidentEvent } from '../types';

interface AccidentHistoryProps {
  events: AccidentEvent[];
  onClearHistory?: () => void;
}

export const AccidentHistory: React.FC<AccidentHistoryProps> = ({ events }) => {
  const [filter, setFilter] = useState<'ALL' | 'CONFIRMED' | 'FALSE_ALARM' | 'MANUAL_SOS'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<AccidentEvent | null>(null);

  const filteredEvents = events.filter((evt) => {
    if (filter === 'ALL') return true;
    return evt.status === filter;
  });

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SADES_Accident_History_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Accident Event History & Audit Log</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically timestamped incident records for emergency triage and legal compliance
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented Filter Control (Interactive Buttons) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filter === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({events.length})
            </button>
            <button
              onClick={() => setFilter('CONFIRMED')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filter === 'CONFIRMED' ? 'bg-rose-950 text-rose-300 border border-rose-800/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilter('FALSE_ALARM')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filter === 'FALSE_ALARM' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              False Alarms
            </button>
            <button
              onClick={() => setFilter('MANUAL_SOS')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filter === 'MANUAL_SOS' ? 'bg-purple-950 text-purple-300 border border-purple-800/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Manual SOS
            </button>
          </div>

          <button
            onClick={exportToJson}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Filter className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <div>No events found matching the active filter.</div>
            <p className="text-[11px] text-slate-600 mt-1">
              Trigger a test scenario in Demo Mode to record a new incident log.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-3.5">Event ID</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Impact G / Roll</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                {filteredEvents.map((evt) => {
                  const isConfirmed = evt.status === 'CONFIRMED';
                  const isFalseAlarm = evt.status === 'FALSE_ALARM';
                  const isSos = evt.status === 'MANUAL_SOS';

                  return (
                    <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-white">
                        {evt.id}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        <div>{evt.timeStr}</div>
                        <div className="text-[10px] text-slate-500">{evt.dateStr}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                            isConfirmed
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                              : isFalseAlarm
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : isSos
                              ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          }`}
                        >
                          {isConfirmed && <AlertOctagon className="w-3 h-3" />}
                          {isFalseAlarm && <CheckCircle2 className="w-3 h-3" />}
                          {isSos && <ShieldAlert className="w-3 h-3" />}
                          <span>{evt.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`font-bold ${
                            evt.severity === 'CRITICAL' || evt.severity === 'HIGH'
                              ? 'text-rose-400'
                              : evt.severity === 'MODERATE'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {evt.severity}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-white font-semibold">{evt.sensorSnapshot.accelMagnitude}g</span>
                        <span className="text-slate-500 ml-1.5 text-[11px]">/ {evt.sensorSnapshot.roll}°</span>
                      </td>
                      <td className="p-3.5 font-sans">
                        <div className="text-slate-200 text-xs truncate max-w-[160px]" title={evt.location.address}>
                          {evt.location.address}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {evt.location.lat.toFixed(4)}, {evt.location.lng.toFixed(4)}
                        </div>
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400">
                        {evt.source}
                      </td>
                      <td className="p-3.5 text-right font-sans">
                        <button
                          onClick={() => setSelectedEvent(evt)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Event Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Incident Snapshot Detail:</span>
                <span className="font-mono text-xs text-rose-400 font-semibold">{selectedEvent.id}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400">Trigger Reason:</span>
                <div className="text-white font-medium">{selectedEvent.triggerReason}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400">Resolution Mode:</span>
                <div className="text-emerald-400 font-mono font-medium">
                  {selectedEvent.verification.verifiedBy || 'Pending'}
                </div>
              </div>
            </div>

            {/* Sensor snapshot breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-rose-400" />
                Raw Sensor Snapshot at Event Trigger
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
                <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400">Accel X/Y/Z:</span>
                  <div className="text-white mt-0.5">
                    {selectedEvent.sensorSnapshot.ax}, {selectedEvent.sensorSnapshot.ay}, {selectedEvent.sensorSnapshot.az} g
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400">Gyro X/Y/Z:</span>
                  <div className="text-white mt-0.5">
                    {selectedEvent.sensorSnapshot.gx}, {selectedEvent.sensorSnapshot.gy}, {selectedEvent.sensorSnapshot.gz} °/s
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400">Magnitude:</span>
                  <div className="text-rose-400 font-bold mt-0.5">
                    {selectedEvent.sensorSnapshot.accelMagnitude} g
                  </div>
                </div>
              </div>
            </div>

            {/* GPS Info */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                GPS Coordinates
              </div>
              <div className="font-mono text-white pt-1">
                {selectedEvent.location.lat.toFixed(6)}° N, {selectedEvent.location.lng.toFixed(6)}° E
              </div>
              <div className="text-slate-400 text-[11px]">{selectedEvent.location.address}</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
