"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Camera,
  Database,
  LogOut,
  Settings,
  Shield,
  Users,
  BrainCircuit,
  FileText,
  Map,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DatasetManagement,
  LiveDetection,
  ModelTraining,
  PerformanceResults,
  SystemSettings,
  UserManagement,
  DetectionHistory,
  DiseaseHeatmap,
} from "@/components/dashboard/admin";
import ThemeToggle from "@/components/ThemeToggle";

const menuItems = [
  { id: "live", label: "Live Detection", icon: Camera },
  { id: "history", label: "Scan History", icon: FileText },
  { id: "users", label: "User Management", icon: Users },
  { id: "heatmap", label: "Disease Heatmap", icon: Map },
] as const;

const pageMeta = {
  live: {
    title: "Live Detection Monitor",
    subtitle: "Real-time duck disease diagnostics using ML pipeline inference",
  },
  history: {
    title: "Global Scan History",
    subtitle: "Comprehensive diagnosis history across all platform users",
  },
  users: {
    title: "User Account Directory",
    subtitle: "Add, edit, remove, and review registered farmer and veterinarian accounts",
  },
  heatmap: {
    title: "Disease Spread Heatmap",
    subtitle: "Geographical distribution mapping of confirmed disease cases",
  },
} as const;

export default function AdminDashboardPage() {
  const [activeMenu, setActiveMenu] = useState<typeof menuItems[number]["id"]>("live");
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("dt_role");
    if (role !== "admin") {
      router.push("/login/admin");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-3" />
        <p className="text-slate-400 font-semibold animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  const currentPage = pageMeta[activeMenu];

  const handleLogout = () => {
    localStorage.removeItem("dt_token");
    localStorage.removeItem("dt_role");
    localStorage.removeItem("dt_user");
    router.push("/login/admin");
  };

  return (
    <div className="flex min-h-screen bg-[linear-gradient(90deg,#f3f6fc_0%,#edf4f8_100%)] dark:bg-[linear-gradient(90deg,#020617_0%,#0f172a_100%)] transition-colors duration-300">
      <aside className="flex w-72 flex-col border-r border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-white backdrop-blur-xl shrink-0">
        <div className="border-b border-slate-200 dark:border-slate-800/50 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-600 dark:bg-emerald-600/80 p-2 shadow-lg shadow-emerald-500/10">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Duck Track</h1>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">Admin Control Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            System Operations
          </p>
          <div className="mt-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-all ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700/50"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-200 dark:bg-slate-800 p-2.5">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-950 dark:text-white truncate">Administrator</p>
                <p className="text-[10px] font-semibold text-slate-400">Full Access Account</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto max-h-screen">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-8 py-5 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {currentPage.title}
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">{currentPage.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="gap-2 text-slate-500 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8">
          {activeMenu === "live" && <LiveDetection />}
          {activeMenu === "history" && <DetectionHistory />}
          {activeMenu === "users" && <UserManagement />}
          {activeMenu === "heatmap" && <DiseaseHeatmap />}
        </div>
      </main>
    </div>
  );
}
