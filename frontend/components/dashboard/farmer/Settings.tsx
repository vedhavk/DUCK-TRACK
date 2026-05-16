"use client";

import { useEffect, useState } from "react";
import { User, Mail, MapPin, Hash, Info, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { farmerMe, clearToken, type FarmerOut } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Settings() {
  const [profile, setProfile] = useState<FarmerOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    farmerMe()
      .then(setProfile)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load profile.")
      )
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile Info */}
      <div className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            My Profile
          </h3>
        </div>

        {loading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading profile…</p>
        )}
        {error && <p className="text-sm text-rose-500">{error}</p>}
        {profile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: User, label: "Full Name", value: profile.name },
              { icon: Mail, label: "Email", value: profile.email },
              { icon: MapPin, label: "District", value: profile.district },
              { icon: MapPin, label: "State", value: profile.state },
              { icon: Hash, label: "PIN Code", value: profile.pin_code },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info notice */}
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Profile editing and password changes are not currently supported. Contact your system administrator for account updates.
        </p>
      </div>

      {/* Logout */}
      <div className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
            <LogOut className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Session
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          You are currently logged in as a <strong>Farmer</strong>. Click below to sign out securely.
        </p>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="text-rose-600 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/30"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
