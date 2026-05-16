"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  downloadVetReport,
  getMedicalReports,
  type MedicalReport,
} from "@/lib/veterinarianMockApi";

const statusStyles = {
  Critical: "bg-rose-600 dark:bg-rose-900/40 text-white dark:text-rose-400",
  Complete: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  Review: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
};

export default function MedicalReports() {
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);

  useEffect(() => {
    async function loadReports() {
      const reports = await getMedicalReports();
      setMedicalReports(reports);
    }

    loadReports();
  }, []);

  async function handleDownload(reportId: number) {
    const report = medicalReports.find((item) => item.id === reportId);
    if (!report) return;

    const blob = await downloadVetReport(reportId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, "_")}_${report.date}.txt`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900/80 p-5 shadow-sm border border-slate-200 dark:border-slate-800">
      <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
        Recent Medical Reports
      </h3>
      <div className="space-y-4">
        {medicalReports.map((report) => (
          <div
            key={report.id}
            className="flex flex-col gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-3">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {report.title}
                  </h4>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[report.status]}`}
                  >
                    {report.status}
                  </span>
                </div>
                <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">{report.date}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="gap-2 self-start lg:self-center dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => handleDownload(report.id)}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
