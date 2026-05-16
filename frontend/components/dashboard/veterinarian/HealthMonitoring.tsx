"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Eye,
  FilePlus2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type VetAlert,
  type VetHealthStat,
  getVetAlerts,
  getVetHealthStats,
} from "@/lib/veterinarianMockApi";

const statIcons = {
  healthy: CheckCircle2,
  monitoring: AlertTriangle,
  activity: Activity,
  checkup: Calendar,
};

export default function HealthMonitoring() {
  const [vetHealthStats, setVetHealthStats] = useState<VetHealthStat[]>([]);
  const [vetAlerts, setVetAlerts] = useState<VetAlert[]>([]);

  useEffect(() => {
    async function loadData() {
      const [stats, alerts] = await Promise.all([
        getVetHealthStats(),
        getVetAlerts(),
      ]);
      setVetHealthStats(stats);
      setVetAlerts(alerts);
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {vetHealthStats.map((stat) => {
          const Icon = statIcons[stat.id as keyof typeof statIcons] ?? Activity;

          return (
            <div
              key={stat.id}
              className={`rounded-2xl border bg-white dark:bg-slate-900/80 p-5 shadow-sm ${
                stat.accent.split(" ")[0]
              } dark:border-slate-800`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p
                    className={`mt-2 text-4xl font-bold ${
                      stat.accent.split(" ")[1]
                    } dark:text-white`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 ${
                    stat.accent.split(" ")[2]
                  } dark:bg-opacity-20`}
                >
                  <Icon
                    className={`h-7 w-7 ${
                      stat.accent.split(" ")[1]
                    } dark:text-opacity-80`}
                  />
                </div>
              </div>
              <p className="mt-4 inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                {stat.helper}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 rounded-full bg-white dark:bg-slate-900/50 p-1 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-center text-slate-900 dark:text-white font-semibold">
          Health Alerts
        </div>
        <div className="px-4 py-2 text-center hover:text-slate-900 dark:hover:text-white cursor-pointer">Individual Monitoring</div>
        <div className="px-4 py-2 text-center hover:text-slate-900 dark:hover:text-white cursor-pointer">Behavior Analysis</div>
        <div className="px-4 py-2 text-center hover:text-slate-900 dark:hover:text-white cursor-pointer">Image Review</div>
      </div>

      <section className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-slate-900 dark:text-white">
          <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          <h3 className="text-xl font-bold">Active Health Alerts</h3>
        </div>
        <div className="space-y-4">
          {vetAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex flex-col gap-4 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between ${
                alert.border
              } dark:bg-slate-900/50 ${alert.border.replace(
                "border-",
                "dark:border-"
              )}`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Duck #{alert.duckId}
                  </h4>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      alert.badge
                    } ${
                      alert.badge.includes("amber")
                        ? "dark:bg-amber-900/30 dark:text-amber-400"
                        : "dark:bg-rose-900/30 dark:text-rose-400"
                    }`}
                  >
                    {alert.priority}
                  </span>
                </div>
                <p className="mt-3 text-lg text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Issue:</span>{" "}
                  {alert.issue}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {alert.detectedAgo}
                </p>
              </div>
              <div className="flex gap-3 self-start lg:self-center">
                <Button variant="outline" className="gap-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  Create Report
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
