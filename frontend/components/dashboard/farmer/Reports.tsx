"use client";

import { useEffect, useState } from "react";
import { FileText, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { farmerHistory, type AlertHistoryRecord } from "@/lib/api";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Reports() {
  const [records, setRecords] = useState<AlertHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    farmerHistory()
      .then((data) => setRecords(data))
      .catch((err) =>
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to load history."
        )
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-500" />
          My Detection History
        </h3>

        {isLoading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading history…
          </p>
        )}
        {!isLoading && errorMessage && (
          <p className="text-sm text-rose-500">{errorMessage}</p>
        )}
        {!isLoading && !errorMessage && records.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No detection records found yet. Upload a duck image to get started.
          </p>
        )}

        <div className="space-y-4">
          {records.map((rec) => {
            const isDiseased = rec.prediction === "diseased";
            return (
              <div
                key={rec.id}
                className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 rounded-xl border transition-all ${
                  isDiseased
                    ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
                    : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDiseased
                        ? "bg-rose-100 dark:bg-rose-900/30"
                        : "bg-emerald-100 dark:bg-emerald-900/30"
                    }`}
                  >
                    {isDiseased ? (
                      <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-800 dark:text-white capitalize">
                        {rec.prediction}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isDiseased
                            ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400"
                            : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {rec.file_type}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          rec.alert_sent === "sent"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : rec.alert_sent === "failed"
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        Alert: {rec.alert_sent}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      📍 {rec.latitude}, {rec.longitude} · PIN: {rec.pin_code}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(rec.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
