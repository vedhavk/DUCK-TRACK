"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  LogOut,
  Settings,
  Stethoscope,
  Users,
  Map as MapIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  HealthMonitoring,
  MedicalReports,
  VeterinarianSettings,
  FarmerOverview,
  DiseaseSpreadMap,
} from "@/components/dashboard/veterinarian";
import ThemeToggle from "@/components/ThemeToggle";
import { clearToken, getUser } from "@/lib/api";
import { useRouter } from "next/navigation";

const menuItems = [
  { id: "health", label: "Health Monitoring", icon: Stethoscope },
  { id: "farmers", label: "Farmer Overview", icon: Users },
  { id: "reports", label: "Medical Reports", icon: FileText },
  { id: "map", label: "Disease Spread Map", icon: MapIcon },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const pageMeta = {
  health: {
    title: "Veterinarian Health Panel",
    subtitle: "Monitor duck health, run detections, and view outbreak history",
  },
  farmers: {
    title: "Farmer & Duck Overview",
    subtitle: "View registered farmers and their current duck populations",
  },
  reports: {
    title: "Medical Reports",
    subtitle: "View your personal detection history and disease hotspots",
  },
  map: {
    title: "Disease Spread Map",
    subtitle: "Interactive heatmap of disease outbreaks and risk zones",
  },
  settings: {
    title: "Settings",
    subtitle: "Manage account and session",
  },
} as const;

export default function VeterinarianDashboardPage() {
  const [activeMenu, setActiveMenu] =
    useState<(typeof menuItems)[number]["id"]>("health");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  const currentPage = pageMeta[activeMenu];

  return (
    <div className="flex min-h-screen bg-[linear-gradient(90deg,#f4f3fb_0%,#eef6f2_100%)] dark:bg-[linear-gradient(90deg,#0a0a1a_0%,#051510_100%)] transition-colors duration-300">
      <aside className="flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="border-b border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-linear-to-br from-blue-500 to-violet-500 p-2.5 shadow-sm dark:shadow-none">
              <svg
                className="h-6 w-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.5 5c-1.33 0-2.42.83-2.83 2H4c-.55 0-1 .45-1 1s.45 1 1 1h1.67c.41 1.17 1.5 2 2.83 2 1.33 0 2.42-.83 2.83-2H20c.55 0 1-.45 1-1s-.45-1-1-1h-8.67c-.41-1.17-1.5-2-2.83-2zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 3c-1.33 0-2.42.83-2.83 2H4c-.55 0-1 .45-1 1s.45 1 1 1h8.67c.41 1.17 1.5 2 2.83 2 1.33 0 2.42-.83 2.83-2H20c.55 0 1-.45 1-1s-.45-1-1-1h-1.67c-.41-1.17-1.5-2-2.83-2zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                Duck Track
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Veterinarian Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Veterinarian Menu
          </p>
          <div className="mt-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                    isActive
                      ? "bg-linear-to-r from-blue-600 to-fuchsia-600 text-white shadow-md dark:shadow-none"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
                  />
                  <span className="text-base font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4">
          <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-violet-50 dark:bg-violet-950/20 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-600 p-3">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">
                  {mounted ? (user?.name ?? "Veterinarian") : "Veterinarian"}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {mounted ? (user?.email ?? "") : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-8 py-5">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              {currentPage.title}
            </h2>
            <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
              {currentPage.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {activeMenu === "health" && <HealthMonitoring />}
          {activeMenu === "farmers" && <FarmerOverview />}
          {activeMenu === "reports" && <MedicalReports />}
          {activeMenu === "map" && <DiseaseSpreadMap />}
          {activeMenu === "settings" && <VeterinarianSettings />}
        </div>
      </main>
    </div>
  );
}

