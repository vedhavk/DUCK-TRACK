"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AlertHistoryRecord } from "@/lib/api";

// Fix Leaflet's default icon path issues in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

export default function DiseaseMap({ records }: { records: AlertHistoryRecord[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[400px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>;
  }

  const diseasedRecords = records.filter(r => r.prediction === "diseased");
  
  // Default center (can be India center or average of points)
  const defaultCenter: [number, number] = diseasedRecords.length > 0 
    ? [diseasedRecords[0].latitude, diseasedRecords[0].longitude] 
    : [20.5937, 78.9629];

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={diseasedRecords.length > 0 ? 10 : 4}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {diseasedRecords.map((rec) => (
          <CircleMarker
            key={rec.id}
            center={[rec.latitude, rec.longitude]}
            pathOptions={{ color: '#e11d48', fillColor: '#e11d48', fillOpacity: 0.6 }}
            radius={8}
          >
            <Popup>
              <div className="text-sm">
                <strong>Disease Detected</strong><br/>
                Date: {new Date(rec.created_at).toLocaleDateString()}<br/>
                PIN: {rec.pin_code}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
