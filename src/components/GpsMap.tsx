import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Satellite, Compass } from 'lucide-react';
import { LocationData, NearbyHospital } from '../types';

interface GpsMapProps {
  location: LocationData;
  hospitals: NearbyHospital[];
  hasActiveIncident: boolean;
}

export const GpsMap: React.FC<GpsMapProps> = ({
  location,
  hospitals,
  hasActiveIncident,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const hospitalMarkersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [location.lat, location.lng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Custom Vehicle Icon
    const vehicleIcon = L.divIcon({
      className: 'custom-vehicle-pin',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background-color: ${hasActiveIncident ? '#e11d48' : '#0284c7'};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          ${hasActiveIncident ? '⚠️' : '🚗'}
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng([location.lat, location.lng]);
      vehicleMarkerRef.current.setIcon(vehicleIcon);
    } else {
      vehicleMarkerRef.current = L.marker([location.lat, location.lng], { icon: vehicleIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b;">
            <strong>${hasActiveIncident ? 'INCIDENT VEHICLE' : 'ACTIVE VEHICLE'}</strong><br/>
            Lat: ${location.lat.toFixed(5)}<br/>
            Lng: ${location.lng.toFixed(5)}<br/>
            Speed: ${location.speedKmh} km/h<br/>
            <span style="color: #64748b; font-size: 10px;">Simulated Location</span>
          </div>
        `);
    }

    // Incident Radius Circle
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    if (hasActiveIncident) {
      circleRef.current = L.circle([location.lat, location.lng], {
        color: '#e11d48',
        fillColor: '#f43f5e',
        fillOpacity: 0.15,
        radius: 600,
      }).addTo(map);
    }

    // Hospital Markers
    hospitalMarkersRef.current.forEach((m) => m.remove());
    hospitalMarkersRef.current = [];

    const hospitalIcon = L.divIcon({
      className: 'custom-hospital-pin',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background-color: #059669;
          border: 2px solid white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          🏥
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    hospitals.forEach((hosp) => {
      const marker = L.marker([hosp.lat, hosp.lng], { icon: hospitalIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b;">
            <strong>${hosp.name}</strong><br/>
            Type: ${hosp.type}<br/>
            Distance: ${hosp.distanceKm} km<br/>
            ETA: ~${hosp.responseTimeMin} mins<br/>
            Tel: ${hosp.phone}
          </div>
        `);
      hospitalMarkersRef.current.push(marker);
    });

    map.panTo([location.lat, location.lng]);

    // Force map size refresh
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [location.lat, location.lng, hasActiveIncident, hospitals]);

  return (
    <div className="space-y-3">
      {/* Simulation Notice Disclaimer Header (Prompt requirement: Never present simulated as actual) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-semibold text-amber-300 uppercase tracking-wide text-[11px]">
            Simulated GPS Location
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">
            {location.address}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Satellite className="w-3.5 h-3.5 text-sky-400" /> {location.satellites} Sats
          </span>
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-emerald-400" /> ±{location.accuracyMeters}m Acc.
          </span>
          <span className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-indigo-400" /> {location.speedKmh} km/h
          </span>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative w-full h-[420px] rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Telemetry Badge Overlay */}
        <div className="absolute top-3 right-3 z-[1000] p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-lg text-xs space-y-1 font-mono">
          <div className="text-slate-400 text-[10px] uppercase font-sans font-semibold">
            NEO-6M GPS Coordinates
          </div>
          <div className="text-white font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>{location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Speed: <span className="text-white">{location.speedKmh} km/h</span> | Lock: <span className="text-emerald-400">3D FIX</span>
          </div>
        </div>
      </div>

      {/* Emergency Medical Units in Vicinity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {hospitals.map((hosp) => (
          <div
            key={hosp.id}
            className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between text-xs"
          >
            <div>
              <div className="font-semibold text-slate-200">{hosp.name}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">{hosp.type}</div>
              <div className="text-slate-500 font-mono text-[10px] mt-1">Tel: {hosp.phone}</div>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                {hosp.distanceKm} km
              </span>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                ~{hosp.responseTimeMin}m ETA
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
