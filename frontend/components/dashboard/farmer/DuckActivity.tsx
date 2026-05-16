"use client";

import { useEffect, useMemo, useState } from "react";
import { Sunrise, Droplets, Utensils, TrendingUp } from "lucide-react";

import {
  getActivityData,
  getActivityMetrics,
  type ActivityData,
  type ActivityMetric,
} from "@/lib/mockApi";

export default function DuckActivity() {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activityMetrics, setActivityMetrics] = useState<ActivityMetric[]>([]);

  const iconMap = useMemo(
    () => ({
      sunrise: Sunrise,
      droplets: Droplets,
      utensils: Utensils,
      "trending-up": TrendingUp,
    }),
    [],
  );

  const cardStyles = useMemo(
    () => ({
      green: {
        container: "bg-green-50 dark:bg-emerald-900/20 border-green-100 dark:border-emerald-800",
        icon: "bg-green-500 dark:bg-emerald-600",
        value: "text-green-600 dark:text-emerald-400",
      },
      blue: {
        container: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800",
        icon: "bg-blue-500 dark:bg-blue-600",
        value: "text-blue-600 dark:text-blue-400",
      },
      yellow: {
        container: "bg-yellow-50 dark:bg-amber-900/20 border-yellow-100 dark:border-amber-800",
        icon: "bg-yellow-500 dark:bg-amber-600",
        value: "text-yellow-600 dark:text-amber-400",
      },
      purple: {
        container: "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800",
        icon: "bg-purple-500 dark:bg-purple-600",
        value: "text-purple-600 dark:text-purple-400",
      },
    }),
    [],
  );

  useEffect(() => {
    async function loadData() {
      const [data, metrics] = await Promise.all([
        getActivityData(),
        getActivityMetrics(),
      ]);
      setActivityData(data);
      setActivityMetrics(metrics);
    }

    loadData();
  }, []);

  const maxValue = Math.max(...activityData.map((d) => d.active), 1);

  return (
    <div className="max-w-6xl">
      {/* Bar Chart */}
      <div className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
          Today&apos;s Activity
        </h3>
        <div className="relative h-80">
          <div className="absolute inset-0 flex items-end justify-around px-8 pb-12">
            {activityData.map((item, index) => {
              const height = (item.active / maxValue) * 100;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 mx-2"
                >
                  <div className="relative w-full group">
                    <div
                      className="bg-green-500 dark:bg-emerald-500 rounded-t-lg hover:bg-green-600 dark:hover:bg-emerald-400 transition-all cursor-pointer relative"
                      style={{ height: `${height * 2.5}px` }}
                    >
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {item.time}
                        </p>
                        <p className="text-xs text-green-600 dark:text-emerald-400">
                          Active Ducks: {item.active}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {item.time}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-0 left-8 right-8 border-t-2 border-slate-200 dark:border-slate-700"></div>
          <div className="absolute bottom-4 right-8 flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-green-500 dark:bg-emerald-500 rounded"></div>
            <span className="text-slate-600 dark:text-slate-400">Active Ducks</span>
          </div>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activityMetrics.map((metric) => {
          const Icon =
            iconMap[metric.icon as keyof typeof iconMap] ?? TrendingUp;
          const colorKey =
            metric.color === "green"
              ? "green"
              : metric.color === "blue"
                ? "blue"
                : metric.color === "yellow"
                  ? "yellow"
                  : "purple";
          const styles = cardStyles[colorKey];

          return (
            <div
              key={metric.id}
              className={`border rounded-xl p-6 text-center ${styles.container}`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${styles.icon}`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{metric.label}</p>
              <p className={`text-xl font-bold ${styles.value}`}>
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
