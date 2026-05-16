"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock, MapPin } from "lucide-react";
import { farmerHistory, type AlertHistoryRecord } from "@/lib/api";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function DuckActivity() {
  const [records, setRecords] = useState<AlertHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    farmerHistory()
      .then((data) => setRecords(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load activity.")
      )
      .finally(() => setIsLoading(false));
  }, []);

  const total = records.length;
  const diseased = records.filter((r) => r.prediction === "diseased").length;
  const healthy = total - diseased;
  const alertsSent = records.filter((r) => r.alert_sent === "sent").length;

  return (
    <div className="max-w-6xl space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Scans",
            value: total,
            color: "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
            valueColor: "text-slate-800 dark:text-white",
            icon: <Activity className="w-5 h-5 text-slate-500" />,
          },
          {
            label: "Healthy",
            value: healthy,
            color:
              "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
            valueColor: "text-emerald-600 dark:text-emerald-400",
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          },
          {
            label: "Diseased",
            value: diseased,
            color:
              "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800",
            valueColor: "text-rose-600 dark:text-rose-400",
            icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
          },
          {
            label: "Alerts Sent",
            value: alertsSent,
            color:
              "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
            valueColor: "text-blue-600 dark:text-blue-400",
            icon: <Activity className="w-5 h-5 text-blue-500" />,
          },
        ].map(({ label, value, color, valueColor, icon }) => (
          <div
            key={label}
            className={`rounded-xl border p-5 text-center ${color}`}
          >
            <div className="flex items-center justify-center mb-2">{icon}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${valueColor}`}>
              {isLoading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Activity log */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          Detection Activity Log
        </h3>

        {isLoading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        )}
        {!isLoading && error && (
          <p className="text-sm text-rose-500">{error}</p>
        )}
        {!isLoading && !error && records.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No activity yet. Upload duck images from the dashboard to see results here.
          </p>
        )}

        <div className="space-y-3">
          {records.map((rec) => {
            const isDiseased = rec.prediction === "diseased";
            return (
              <div
                key={rec.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDiseased
                      ? "bg-rose-100 dark:bg-rose-900/30"
                      : "bg-emerald-100 dark:bg-emerald-900/30"
                  }`}
                >
                  {isDiseased ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 dark:text-white capitalize">
                      {rec.prediction}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      · {rec.file_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {rec.latitude}, {rec.longitude} · PIN: {rec.pin_code}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(rec.created_at)}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                    rec.alert_sent === "sent"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {rec.alert_sent}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
