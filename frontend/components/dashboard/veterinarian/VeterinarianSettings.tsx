"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  MapPin,
  Hash,
  LogOut,
  Pencil,
  Check,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  vetMe,
  vetUpdateMe,
  clearToken,
  setUser,
  type VetOut,
} from "@/lib/api";
import { useRouter } from "next/navigation";

type EditField = "name" | "pin_code" | "district" | "state" | null;

export default function VeterinarianSettings() {
  const [profile, setProfile] = useState<VetOut | null>(null);
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Edit state
  const [editField, setEditField] = useState<EditField>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const router = useRouter();

  useEffect(() => {
    vetMe()
      .then((data) => { setProfile(data); setUser(data); })
      .catch((err) =>
        setFetchError(err instanceof Error ? err.message : "Failed to load profile.")
      )
      .finally(() => setLoading(false));
  }, []);

  function startEdit(field: EditField, currentValue: string) {
    setEditField(field);
    setEditValue(currentValue);
    setSaveError(null);
    setSaveSuccess(false);
  }

  function cancelEdit() {
    setEditField(null);
    setEditValue("");
    setSaveError(null);
  }

  async function handleSave() {
    if (!editField || !profile) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      setSaveError("Value cannot be empty.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await vetUpdateMe({ [editField]: trimmed });
      setProfile(updated);
      setUser(updated);
      setSaveSuccess(true);
      setEditField(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  const editableFields: {
    key: EditField & string;
    label: string;
    icon: React.ElementType;
    placeholder: string;
  }[] = [
    { key: "name",     label: "Full Name", icon: User,   placeholder: "Your full name" },
    { key: "district", label: "District",  icon: MapPin, placeholder: "e.g. Ernakulam" },
    { key: "state",    label: "State",     icon: MapPin, placeholder: "e.g. Kerala" },
    { key: "pin_code", label: "PIN Code",  icon: Hash,   placeholder: "e.g. 682001" },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">My Profile</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click the pencil icon to edit any field</p>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading profile…
          </p>
        )}
        {fetchError && <p className="text-sm text-rose-500">{fetchError}</p>}

        {saveSuccess && (
          <div className="mb-4 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Profile updated successfully!
          </div>
        )}
        {saveError && (
          <div className="mb-4 px-4 py-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-400">
            {saveError}
          </div>
        )}

        {profile && (
          <div className="space-y-3">
            {/* Email — read-only */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">Email (read-only)</p>
                <p className="font-semibold text-slate-800 dark:text-white truncate">{profile.email}</p>
              </div>
              <div title="Email cannot be changed" className="flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </div>
            </div>

            {/* Editable fields */}
            {editableFields.map(({ key, label, icon: Icon, placeholder }) => {
              const value = profile[key as keyof VetOut] as string;
              const isEditing = editField === key;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    isEditing
                      ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                    {isEditing ? (
                      <Input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={placeholder}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="mt-1 h-8 text-sm bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="font-semibold text-slate-800 dark:text-white truncate">{value}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(key as EditField, value)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Session / Logout */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
            <LogOut className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Session</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          You are currently logged in as a <strong>Veterinarian</strong>. Click below to sign out securely.
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
