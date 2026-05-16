"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Camera,
  Database,
  LogOut,
  Settings,
  Shield,
  Users,
  BrainCircuit,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DatasetManagement,
  LiveDetection,
  ModelTraining,
  PerformanceResults,
  SystemSettings,
  UserManagement,
} from "@/components/dashboard/admin";
import ThemeToggle from "@/components/ThemeToggle";

const menuItems = [
  { id: "live", label: "Live Detection", icon: Camera },
  { id: "dataset", label: "Dataset Management", icon: Database },
  { id: "training", label: "Model Training", icon: BrainCircuit },
  { id: "performance", label: "Performance Results", icon: BarChart3 },
  { id: "users", label: "User Management", icon: Users },
  { id: "settings", label: "System Settings", icon: Settings },
] as const;

const pageMeta = {
  live: {
    title: "Live Detection",
    subtitle: "Real-time duck detection and tracking",
  },
  dataset: {
    title: "Dataset Management",
    subtitle: "Manage training and validation datasets",
  },
  training: {
    title: "Model Training",
    subtitle: "Train and monitor model iterations",
  },
  performance: {
    title: "Performance Results",
    subtitle: "Review model performance benchmarks",
  },
  users: {
    title: "User Management",
    subtitle: "Control access for platform users",
  },
  settings: {
    title: "System Settings",
    subtitle: "Configure global detection settings",
  },
} as const;

export default function AdminDashboardPage() {
  const [activeMenu, setActiveMenu] =
    useState<(typeof menuItems)[number]["id"]>("live");

  const currentPage = pageMeta[activeMenu];

  return (
    <div className="flex min-h-screen bg-[linear-gradient(90deg,#f3f6fc_0%,#edf4f8_100%)] dark:bg-[linear-gradient(90deg,#020617_0%,#0f172a_100%)] transition-colors duration-300">
      <aside className="flex w-72 flex-col border-r border-slate-800 dark:border-slate-800/50 bg-slate-950 dark:bg-slate-900/50 text-white backdrop-blur-xl">
        <div className="border-b border-slate-800 dark:border-slate-800/50 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-800 dark:bg-slate-800/80 p-2">
              <svg
                className="h-6 w-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.5 5c-1.33 0-2.42.83-2.83 2H4c-.55 0-1 .45-1 1s.45 1 1 1h1.67c.41 1.17 1.5 2 2.83 2 1.33 0 2.42-.83 2.83-2H20c.55 0 1-.45 1-1s-.45-1-1-1h-8.67c-.41-1.17-1.5-2-2.83-2zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 3c-1.33 0-2.42.83-2.83 2H4c-.55 0-1 .45-1 1s.45 1 1 1h8.67c.41 1.17 1.5 2 2.83 2 1.33 0 2.42-.83 2.83-2H20c.55 0 1-.45 1-1s-.45-1-1-1h-1.67c-.41-1.17-1.5-2-2.83-2zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Duck Track</h1>
              <p className="text-sm text-slate-400">Admin Control Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Admin Controls
          </p>
          <div className="mt-3 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                    isActive
                      ? "bg-slate-800 dark:bg-slate-800/80 text-white ring-1 ring-slate-700 dark:ring-slate-700/50"
                      : "text-slate-300 hover:bg-slate-900 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-lg font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-800 p-2.5">
                <Shield className="h-5 w-5 text-slate-200" />
              </div>
              <div>
                <p className="text-sm font-semibold">Admin Account</p>
                <p className="text-xs text-slate-400">Full system access</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-8 py-5">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              {currentPage.title}
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{currentPage.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/">
              <Button
                variant="ghost"
                className="gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {activeMenu === "live" && <LiveDetection />}
          {activeMenu === "dataset" && <DatasetManagement />}
          {activeMenu === "training" && <ModelTraining />}
          {activeMenu === "performance" && <PerformanceResults />}
          {activeMenu === "users" && <UserManagement />}
          {activeMenu === "settings" && <SystemSettings />}
        </div>
      </main>
    </div>
  );
}
