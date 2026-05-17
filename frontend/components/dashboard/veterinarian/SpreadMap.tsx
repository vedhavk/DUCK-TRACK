"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { DiseaseMapLocation } from "@/lib/api";

// Standard Vet/Admin Marker Icons in Curated Harmonious Colors
const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const violetIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
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
        
        {locations.map((loc: any, idx) => {
          const isDiseased = loc.disease && loc.disease.toLowerCase() !== "healthy";
          const isLive = loc.isLiveScan;
          
          let selectedIcon = redIcon;
          if (isLive) {
            selectedIcon = isDiseased ? violetIcon : greenIcon;
          } else {
            selectedIcon = redIcon;
          }

          return (
            <div key={idx}>
              {/* Only show risk circles if the prediction indicates diseased outbreak */}
              {isDiseased ? (
                <>
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
                </>
              ) : (
                /* Healthy Scans Safe Zone indicator circle */
                <Circle 
                  center={[loc.latitude, loc.longitude]}
                  pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 1 }}
                  radius={2500}
                />
              )}
              
              <Marker position={[loc.latitude, loc.longitude]} icon={selectedIcon}>
                <Popup>
                  <div className="text-sm min-w-[170px]">
                    <strong className={`${isDiseased ? 'text-rose-600' : 'text-emerald-600'} block mb-1.5 capitalize`}>
                      {isDiseased ? `⚠️ ${loc.disease}` : `✅ ${loc.disease}`}
                    </strong>
                    <p className="mb-1 text-xs"><strong>Source:</strong> {loc.farm_name}</p>
                    <p className="mb-1 text-xs"><strong>Coordinates:</strong> {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</p>
                    <p className="mb-1 text-xs"><strong>Date Detected:</strong> {loc.date_detected}</p>
                    
                    {isDiseased ? (
                      <p className="text-[10px] text-slate-500 mt-2.5 border-t border-slate-100 pt-1.5 leading-relaxed">
                        🔴 &lt;5km radius (Outbreak Hotspot)<br/>
                        🟠 5-10km radius (High Risk Spread)<br/>
                        🟡 10-20km radius (Moderate Spread)
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2.5 border-t border-slate-100 pt-1.5 leading-relaxed font-semibold">
                        🟢 Safe zone clearance validated.
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
