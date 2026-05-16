"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getDiseaseMap, DiseaseMapLocation } from "@/lib/api";
import { AlertCircle, Map as MapIcon, Loader2 } from "lucide-react";

const SpreadMap = dynamic(() => import("./SpreadMap"), { ssr: false });

export default function DiseaseSpreadMap() {
  const [locations, setLocations] = useState<DiseaseMapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDiseaseMap()
      .then(setLocations)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load map data."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-rose-500" />
            Disease Spread Heatmap
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Visualizes all confirmed duck disease hotspots and computes their risk radiuses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500 opacity-60 border border-red-700"></div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Hotspot</p>
              <p className="text-xs text-slate-500">0 - 5 km</p>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-orange-200 dark:border-orange-900/50 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-orange-500 opacity-40 border border-orange-700"></div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">High Risk</p>
              <p className="text-xs text-slate-500">5 - 10 km</p>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/50 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-30 border border-yellow-700"></div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Moderate Risk</p>
              <p className="text-xs text-slate-500">10 - 20 km</p>
            </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-dashed"></div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Safe Zone</p>
              <p className="text-xs text-slate-500">&gt; 20 km</p>
            </div>
        </div>
      </div>

      {loading && (
        <div className="h-[600px] w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-rose-500" />
            <p>Loading disease map data...</p>
        </div>
      )}

      {error && (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-600 flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            {locations.length === 0 ? (
                <div className="h-[600px] flex items-center justify-center text-slate-500">
                    <p>No disease locations recorded yet.</p>
                </div>
            ) : (
                <SpreadMap locations={locations} />
            )}
        </div>
      )}
    </div>
  );
}
