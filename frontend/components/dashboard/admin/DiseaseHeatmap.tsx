"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getDiseaseMap, getDetectionLogs, DiseaseMapLocation, AdminDetectionLog } from "@/lib/api";
import { AlertCircle, Map as MapIcon, Loader2, Layers, Check, ShieldAlert, Sprout } from "lucide-react";

const SpreadMap = dynamic(() => import("../veterinarian/SpreadMap"), { ssr: false });

export default function DiseaseHeatmap() {
  const [vetLocations, setVetLocations] = useState<DiseaseMapLocation[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminDetectionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Heatmap Layer Selection
  const [showVetLayer, setShowVetLayer] = useState(true);
  const [showAdminLayer, setShowAdminLayer] = useState(true);

  // Diagnosis type filter
  const [filterDisease, setFilterDisease] = useState<string>("diseased");

  useEffect(() => {
    // Parallel loading of veterinary outbreak history and admin live scans
    Promise.all([
      getDiseaseMap().catch(() => [] as DiseaseMapLocation[]),
      getDetectionLogs().catch(() => [] as AdminDetectionLog[])
    ])
      .then(([vetData, adminData]) => {
        setVetLocations(vetData);
        setAdminLogs(adminData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load map layers."))
      .finally(() => setLoading(false));
  }, []);

  // Map and assemble the layers into a unified format for SpreadMap
  const combinedLocations: any[] = [];

  if (showVetLayer) {
    vetLocations.forEach(loc => {
      combinedLocations.push({
        ...loc,
        isLiveScan: false
      });
    });
  }

  if (showAdminLayer) {
    adminLogs.forEach(log => {
      combinedLocations.push({
        farm_name: `Admin Scan (${log.media_type})`,
        latitude: log.latitude,
        longitude: log.longitude,
        disease: log.prediction === "diseased" ? "Avian Influenza" : "Healthy",
        date_detected: new Date(log.created_at).toLocaleDateString(),
        isLiveScan: true
      });
    });
  }

  // Apply diagnosis filter
  const filteredLocations = combinedLocations.filter(loc => {
    const isDiseased = loc.disease.toLowerCase() !== "healthy";
    if (filterDisease === "all") return true;
    if (filterDisease === "diseased") return isDiseased;
    return !isDiseased;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Controls Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-emerald-500" />
            Disease Heatmap (Admin View)
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Epidemiological clusters overlaying veterinary verified outbreaks and real-time admin detection logs.
          </p>
        </div>

        {/* Action Controls Panel */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
          
          {/* Layer Toggles */}
          <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3 mr-1">
            <Layers className="w-4 h-4 text-slate-400 mr-1" />
            <button
              onClick={() => setShowVetLayer(!showVetLayer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                showVetLayer
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
              }`}
              title="Show Veterinary Map"
            >
              {showVetLayer && <Check className="w-3.5 h-3.5" />}
              Vet Heatmap
            </button>

            <button
              onClick={() => setShowAdminLayer(!showAdminLayer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                showAdminLayer
                  ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/25"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
              }`}
              title="Show Admin Live Scans Layer"
            >
              {showAdminLayer && <Check className="w-3.5 h-3.5" />}
              Admin Live Scans
            </button>
          </div>

          {/* Diagnosis Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 px-1 uppercase tracking-wider">Outbreak:</span>
            <select
              value={filterDisease}
              onChange={e => setFilterDisease(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none pr-2 cursor-pointer"
            >
              <option value="all">All Diagnoses</option>
              <option value="diseased">Bird Flu Hotspots</option>
              <option value="healthy">Healthy Records</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-500 opacity-65 border border-red-700"></div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Active Hotspot</p>
            <p className="text-[11px] text-slate-500">0 - 5 km risk radius</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-orange-500 opacity-45 border border-orange-700"></div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">High Risk Spread</p>
            <p className="text-[11px] text-slate-500">5 - 10 km risk radius</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-35 border border-yellow-700"></div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Moderate Spread</p>
            <p className="text-[11px] text-slate-500">10 - 20 km risk radius</p>
          </div>
        </div>
        
      </div>

      {/* Layer Markers Sub Legend Info */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span><strong>Vet Map Markers (Red Pin):</strong> Confirmed outbreaks registered by farmers & vets.</span>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-500" />
          <span><strong>Admin Live Scans (Violet Pin):</strong> Real-time diseased admin diagnostic scans.</span>
        </div>
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-500" />
          <span><strong>Safe Clearances (Green Pin):</strong> Real-time healthy admin diagnostic logs.</span>
        </div>
      </div>

      {/* Map Loader / Display */}
      {loading && (
        <div className="h-[550px] w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">Loading disease map layers...</p>
        </div>
      )}

      {error && (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-600 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm overflow-hidden relative z-0">
          {filteredLocations.length === 0 ? (
            <div className="h-[550px] flex items-center justify-center text-slate-500">
              <p className="font-semibold text-slate-400">No active markers matching the selected layers or filters.</p>
            </div>
          ) : (
            <div className="h-[550px] rounded-xl overflow-hidden">
              <SpreadMap locations={filteredLocations} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
