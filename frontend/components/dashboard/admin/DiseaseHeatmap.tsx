"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getDiseaseMap, DiseaseMapLocation } from "@/lib/api";
import { AlertCircle, Map as MapIcon, Loader2, Calendar } from "lucide-react";

const SpreadMap = dynamic(() => import("../veterinarian/SpreadMap"), { ssr: false });

export default function DiseaseHeatmap() {
  const [locations, setLocations] = useState<DiseaseMapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterDisease, setFilterDisease] = useState<string>("all");

  useEffect(() => {
    getDiseaseMap()
      .then(setLocations)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load map data."))
      .finally(() => setLoading(false));
  }, []);

  const filteredLocations = locations.filter(loc => {
    if (filterDisease === "all") return true;
    return loc.disease.toLowerCase() === filterDisease.toLowerCase();
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-rose-500" />
            Epidemiological Spread Heatmap
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Visualizes all confirmed duck disease outbreak clusters and safe zoning.
          </p>
        </div>

        {/* Filter Selection */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
          <span className="text-xs font-semibold px-2 text-slate-400">Outbreak:</span>
          <select
            value={filterDisease}
            onChange={e => setFilterDisease(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none p-1 px-2"
          >
            <option value="all">All Diagnoses</option>
            <option value="diseased">Bird Flu Hotspots</option>
            <option value="healthy">Healthy Records</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-500 opacity-65 border border-red-700"></div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Active Hotspot</p>
            <p className="text-xs text-slate-500">0 - 5 km radius</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-orange-200 dark:border-orange-900/50 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-orange-500 opacity-45 border border-orange-700"></div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">High Risk</p>
            <p className="text-xs text-slate-500">5 - 10 km radius</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/50 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-35 border border-yellow-700"></div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Moderate Risk</p>
            <p className="text-xs text-slate-500">10 - 20 km radius</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-dashed"></div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Safe Zone</p>
            <p className="text-xs text-slate-500">&gt; 20 km away</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="h-[550px] w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-rose-500" />
          <p className="font-semibold">Loading epidemiological spread data...</p>
        </div>
      )}

      {error && (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-600 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm overflow-hidden">
          {filteredLocations.length === 0 ? (
            <div className="h-[550px] flex items-center justify-center text-slate-500">
              <p>No outbreak hotspots matching filters.</p>
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
