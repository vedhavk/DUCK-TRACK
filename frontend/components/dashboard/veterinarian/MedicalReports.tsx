"use client";

import { useEffect, useState } from "react";
import { FileText, AlertTriangle, CheckCircle2, Clock, MapPin } from "lucide-react";
import { vetHistory, type AlertHistoryRecord } from "@/lib/api";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function MedicalReports() {
  const [records, setRecords] = useState<AlertHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    vetHistory()
      .then(setRecords)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load history.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900/80 p-5 shadow-sm border border-slate-200 dark:border-slate-800">
      <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-500" />
        My Detection History
      </h3>

      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading history…
        </p>
      )}
      {!loading && error && <p className="text-sm text-rose-500">{error}</p>}
      {!loading && !error && records.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No detection records yet. Use the Health Panel to run detections.
        </p>
      )}

      <div className="space-y-4">
        {records.map((rec) => {
          const isDiseased = rec.prediction === "diseased";
          return (
            <div
              key={rec.id}
              className="flex flex-col gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-xl p-3 flex-shrink-0 ${
                    isDiseased
                      ? "bg-rose-100 dark:bg-rose-900/30"
                      : "bg-emerald-100 dark:bg-emerald-900/30"
                  }`}
                >
                  {isDiseased ? (
                    <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                      {rec.prediction}
                    </h4>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isDiseased
                          ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400"
                          : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {rec.file_type}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        rec.alert_sent === "sent"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      Alert: {rec.alert_sent}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {rec.latitude}, {rec.longitude} · PIN: {rec.pin_code}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(rec.created_at)}
                  </p>
                  {rec.heatmap_url && (
                    <a
                      href={rec.heatmap_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View on Google Maps →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
