"use client";

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Report, downloadReport, getReports } from "@/lib/mockApi";

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getReports();
        setReports(data);
      } catch {
        setErrorMessage("Reports are not available yet.");
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();
  }, []);

  const handleDownloadReport = async (reportId: number) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    const blob = await downloadReport(reportId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      report.fileName ??
      `${report.title.replace(/\s+/g, "_")}_${report.date}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-5xl">
      <div className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          Available Reports
        </h3>
        {isLoading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading reports...</p>
        )}
        {!isLoading && errorMessage && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{errorMessage}</p>
        )}
        {!isLoading && !errorMessage && reports.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No reports found.</p>
        )}
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-lg hover:border-green-300 dark:hover:border-emerald-600 hover:bg-green-50/30 dark:hover:bg-emerald-900/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600 dark:text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">
                    {report.title}
                  </h4>
                  {(report.summary || report.date) && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {report.summary ?? report.date}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => handleDownloadReport(report.id)}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
