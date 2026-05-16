"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Upload,
  Camera,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  vetMe,
  getOutbreakHistory,
  uploadFile,
  getUser,
  type VetOut,
  type OutbreakRecord,
  type UploadResult,
} from "@/lib/api";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function HealthMonitoring() {
  const [profile, setProfile] = useState<VetOut | null>(
    getUser() as VetOut | null
  );
  const [profileError, setProfileError] = useState<string | null>(null);
  const [outbreaks, setOutbreaks] = useState<OutbreakRecord[]>([]);
  const [obLoading, setObLoading] = useState(true);
  const [obError, setObError] = useState<string | null>(null);

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [pinCode, setPinCode] = useState(profile?.pin_code ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    vetMe()
      .then((data) => {
        setProfile(data);
        setPinCode(data.pin_code);
      })
      .catch((err) =>
        setProfileError(
          err instanceof Error ? err.message : "Failed to load profile"
        )
      );

    getOutbreakHistory()
      .then(setOutbreaks)
      .catch((err) =>
        setObError(
          err instanceof Error ? err.message : "Failed to load outbreak history"
        )
      )
      .finally(() => setObLoading(false));
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(String(pos.coords.latitude.toFixed(6)));
        setLongitude(String(pos.coords.longitude.toFixed(6)));
      });
    }
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f);
    setUploadResult(null);
    setUploadError(null);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      setUploadError("Please enter valid latitude and longitude.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);
    try {
      const result = await uploadFile(
        selectedFile,
        lat,
        lng,
        pinCode || profile?.pin_code || ""
      );
      setUploadResult(result);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      // Refresh outbreaks
      getOutbreakHistory().then(setOutbreaks).catch(() => {});
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const total = outbreaks.length;
  const diseased = outbreaks.length; // all outbreaks are diseased by definition
  const healthy = 0;

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          My Profile
        </h3>
        {profileError && <p className="text-sm text-rose-500">{profileError}</p>}
        {profile && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Name", value: profile.name },
              { label: "Email", value: profile.email },
              { label: "District", value: profile.district },
              { label: "State", value: profile.state },
              { label: "PIN Code", value: profile.pin_code },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  {label}
                </p>
                <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Total Outbreaks",
            value: obLoading ? "—" : String(total),
            accent: "border-slate-200 dark:border-slate-800",
            valColor: "text-slate-800 dark:text-white",
            icon: <Activity className="h-6 w-6 text-slate-500" />,
          },
          {
            label: "Disease Events",
            value: obLoading ? "—" : String(diseased),
            accent: "border-rose-200 dark:border-rose-800",
            valColor: "text-rose-600 dark:text-rose-400",
            icon: <AlertTriangle className="h-6 w-6 text-rose-500" />,
          },
          {
            label: "Healthy Reports",
            value: obLoading ? "—" : String(healthy),
            accent: "border-emerald-200 dark:border-emerald-800",
            valColor: "text-emerald-600 dark:text-emerald-400",
            icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
          },
        ].map(({ label, value, accent, valColor, icon }) => (
          <div
            key={label}
            className={`rounded-2xl border bg-white dark:bg-slate-900/80 p-5 shadow-sm ${accent}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className={`mt-2 text-4xl font-bold ${valColor}`}>{value}</p>
              </div>
              <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800">
                {icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload detection */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-500" />
          Duck Disease Detection
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group h-20 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all text-slate-600 dark:text-slate-300"
            >
              <Upload className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-sm">Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="group h-20 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all text-slate-600 dark:text-slate-300"
            >
              <Camera className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-sm">Use Camera</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {selectedFile && (
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300 truncate">
              📎 {selectedFile.name}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Latitude", key: "lat", val: latitude, setter: setLatitude, ph: "e.g. 10.1234" },
              { label: "Longitude", key: "lng", val: longitude, setter: setLongitude, ph: "e.g. 76.1234" },
              { label: "PIN Code", key: "pin", val: pinCode, setter: setPinCode, ph: "e.g. 682001" },
            ].map(({ label, key, val, setter, ph }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {label}
                </label>
                <input
                  type={key === "pin" ? "text" : "number"}
                  step="any"
                  placeholder={ph}
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {uploadError && (
            <div className="px-4 py-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-700 dark:text-rose-400">
              {uploadError}
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading || !selectedFile}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 rounded-xl flex items-center justify-center gap-2"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? "Analysing…" : "Run Detection"}
          </Button>
        </form>

        {uploadResult && (
          <div
            className={`mt-5 rounded-2xl border p-5 ${
              uploadResult.prediction === "diseased"
                ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700"
                : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {uploadResult.prediction === "diseased" ? (
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              )}
              <h4
                className={`text-lg font-bold ${
                  uploadResult.prediction === "diseased"
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {uploadResult.prediction === "diseased"
                  ? "⚠️ Disease Detected"
                  : "✅ Healthy"}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Confidence: </span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {(uploadResult.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">File type: </span>
                <span className="font-semibold text-slate-800 dark:text-white capitalize">
                  {uploadResult.file_type}
                </span>
              </div>
              {uploadResult.alerts_sent && (
                <div className="col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">Alerts sent to: </span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {uploadResult.alerts_sent.farmers.length} farmers,{" "}
                    {uploadResult.alerts_sent.vets.length} vets
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Outbreak History */}
      <section className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-slate-900 dark:text-white">
          <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          <h3 className="text-xl font-bold">Disease Outbreak History</h3>
        </div>

        {obLoading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading outbreak history…
          </p>
        )}
        {!obLoading && obError && (
          <p className="text-sm text-rose-500">{obError}</p>
        )}
        {!obLoading && !obError && outbreaks.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No outbreak history yet.
          </p>
        )}

        <div className="space-y-4">
          {outbreaks.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col gap-4 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                    {rec.reported_by} report
                  </h4>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400">
                    {rec.alert_sent}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Reporter:</span>{" "}
                  {rec.reporter_name}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {rec.latitude}, {rec.longitude} · PIN: {rec.pin_code}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(rec.created_at)}
                </p>
              </div>
              <div className="flex gap-3 self-start lg:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${rec.latitude},${rec.longitude}`,
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Map
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
