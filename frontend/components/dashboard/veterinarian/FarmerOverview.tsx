"use client";

import { useEffect, useState } from "react";
import { Users, Search, MapPin, Hash, BarChart } from "lucide-react";
import { getFarmersOverview } from "@/lib/api";

type FarmerData = {
  farmer_id: number;
  name: string;
  email: string;
  district: string;
  state: string;
  pin_code: string;
  latest_duck_count: number;
  latest_count_year: number | null;
};

export default function FarmerOverview() {
  const [farmers, setFarmers] = useState<FarmerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getFarmersOverview()
      .then(setFarmers)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load farmers.")
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.pin_code.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Farmer & Duck Overview
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            View registered farmers and their latest duck populations.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search farmers, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-slate-500">Loading farmer data...</div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && filteredFarmers.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
          No farmers found.
        </div>
      )}

      {!loading && !error && filteredFarmers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map((farmer) => (
            <div
              key={farmer.farmer_id}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                    {farmer.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {farmer.email}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded-lg">
                  ID: {farmer.farmer_id}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="truncate">
                    {farmer.district}, {farmer.state}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Hash className="w-4 h-4 text-slate-400" />
                  <span>{farmer.pin_code}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Latest Duck Count:
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {farmer.latest_duck_count.toLocaleString()}
                  </p>
                  {farmer.latest_count_year && (
                    <p className="text-xs text-slate-400">
                      ({farmer.latest_count_year})
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
