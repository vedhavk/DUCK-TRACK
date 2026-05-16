"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { DiseaseMapLocation } from "@/lib/api";

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

export default function SpreadMap({ locations }: { locations: DiseaseMapLocation[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[600px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>;
  }

  const defaultCenter: [number, number] = locations.length > 0 
    ? [locations[0].latitude, locations[0].longitude] 
    : [20.5937, 78.9629];

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={locations.length > 0 ? 9 : 4}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((loc, idx) => (
          <div key={idx}>
            {/* 0-5 km: Red Zone */}
            <Circle 
              center={[loc.latitude, loc.longitude]}
              pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3, weight: 1 }}
              radius={5000}
            />
            {/* 5-10 km: Orange Zone */}
            <Circle 
              center={[loc.latitude, loc.longitude]}
              pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.2, weight: 1 }}
              radius={10000}
            />
            {/* 10-20 km: Yellow Zone */}
            <Circle 
              center={[loc.latitude, loc.longitude]}
              pathOptions={{ color: 'yellow', fillColor: 'yellow', fillOpacity: 0.1, weight: 1 }}
              radius={20000}
            />
            
            <Marker position={[loc.latitude, loc.longitude]} icon={icon}>
              <Popup>
                <div className="text-sm min-w-[150px]">
                  <strong className="text-rose-600 block mb-1">⚠️ {loc.disease}</strong>
                  <p className="mb-0.5"><strong>Farm:</strong> {loc.farm_name}</p>
                  <p className="mb-0.5"><strong>Date:</strong> {loc.date_detected}</p>
                  <p className="text-xs text-slate-500 mt-2 border-t pt-1">
                    Red: &lt;5km (Hotspot)<br/>
                    Orange: 5-10km (High Risk)<br/>
                    Yellow: 10-20km (Moderate)
                  </p>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
