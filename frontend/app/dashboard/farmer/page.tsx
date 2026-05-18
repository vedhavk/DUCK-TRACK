"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Activity,
  Settings,
  LogOut,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FarmDashboard from "@/components/dashboard/farmer/FarmDashboard";
import Reports from "@/components/dashboard/farmer/Reports";
import DuckActivity from "@/components/dashboard/farmer/DuckActivity";
import SettingsPage from "@/components/dashboard/farmer/Settings";
import ThemeToggle from "@/components/ThemeToggle";
import { clearToken, getUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function FarmerDashboardPage() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { id: "dashboard", label: "My Farm Dashboard", icon: LayoutDashboard },
    { id: "reports", label: "My Reports", icon: FileText },
    { id: "activity", label: "Duck Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Logo and Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
              <Image
                src="/farmer-duck3.png"
                alt="Farmer Duck"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-teal-600">Duck Track</h1>
              <p className="text-xs text-slate-500">Farmer Dashboard</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">
            Farmer Menu
          </p>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-linear-to-r from-green-500 to-blue-500 text-white shadow-md dark:shadow-none"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Account Info */}
        <div className="p-4">
          <div className="bg-teal-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-teal-100 dark:border-emerald-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 dark:bg-emerald-600 rounded-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {mounted ? (user?.name ?? "Farmer") : "Farmer"}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {mounted ? (user?.email ?? "") : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {menuItems.find((item) => item.id === activeMenu)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          {activeMenu === "dashboard" && <FarmDashboard />}
          {activeMenu === "reports" && <Reports />}
          {activeMenu === "activity" && <DuckActivity />}
          {activeMenu === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}
