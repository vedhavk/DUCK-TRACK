"use client";

import { useEffect, useState } from "react";
import { User, Mail, MapPin, Hash, Info, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vetMe, clearToken, type VetOut } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function VeterinarianSettings() {
  const [profile, setProfile] = useState<VetOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    vetMe()
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
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Profile Info */}
      <section className="rounded-2xl bg-white dark:bg-slate-900/80 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-3">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            My Profile
          </h3>
        </div>

        {loading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading profile…
          </p>
        )}
        {error && <p className="text-sm text-rose-500">{error}</p>}
        {profile && (
          <div className="space-y-3">
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Info + Logout */}
      <div className="space-y-6">
        <section className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Profile editing and password changes are not currently supported via the
              dashboard. Contact your system administrator for account updates.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white dark:bg-slate-900/80 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-rose-100 dark:bg-rose-900/30 p-3">
              <LogOut className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Session
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            You are logged in as a <strong>Veterinarian</strong>. Click below to sign out securely.
          </p>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-rose-600 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/30"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </section>
      </div>
    </div>
  );
}
