"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Camera, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  farmerMe,
  uploadFile,
  getUser,
  type FarmerOut,
  type UploadResult,
} from "@/lib/api";

export default function FarmDashboard() {
  const [profile, setProfile] = useState<FarmerOut | null>(
    getUser() as FarmerOut | null
  );

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
    farmerMe()
      .then((data) => {
        setProfile(data);
        setPinCode(data.pin_code);
      })
      .catch(() => {/* profile already loaded from localStorage */});
  }, []);

  // Try to prefill GPS
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
      const result = await uploadFile(selectedFile, lat, lng, pinCode || profile?.pin_code || "");
      setUploadResult(result);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Upload & Detection Card */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-teal-500" />
          Duck Disease Detection
        </h3>

        <form onSubmit={handleUpload} className="space-y-5">
          {/* File selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group h-24 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-teal-400 dark:hover:border-teal-500 transition-all text-slate-600 dark:text-slate-300"
            >
              <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-teal-500" />
              </div>
              <span className="font-semibold text-sm">Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="group h-24 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-teal-400 dark:hover:border-teal-500 transition-all text-slate-600 dark:text-slate-300"
            >
              <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5 text-teal-500" />
              </div>
              <span className="font-semibold text-sm">Use Camera</span>
            </button>
          </div>

          {/* Hidden inputs */}
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
            <div className="px-4 py-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl text-sm text-teal-700 dark:text-teal-300 truncate">
              📎 {selectedFile.name}
            </div>
          )}

          {/* Location fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 10.1234"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 76.1234"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                placeholder="e.g. 682001"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {uploadError && (
            <div className="px-4 py-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-700 dark:text-rose-400">
              {uploadError}
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading || !selectedFile}
            className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold py-5 rounded-xl flex items-center justify-center gap-2"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? "Analysing…" : "Start Detection"}
          </Button>
        </form>

        {/* Result card */}
        {uploadResult && (
          <div
            className={`mt-6 rounded-2xl border p-5 ${
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
              <div>
                <span className="text-slate-500 dark:text-slate-400">Location: </span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {uploadResult.latitude}, {uploadResult.longitude}
                </span>
              </div>
              {uploadResult.alerts_sent && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Alerts sent: </span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {uploadResult.alerts_sent.farmers.length + uploadResult.alerts_sent.vets.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
