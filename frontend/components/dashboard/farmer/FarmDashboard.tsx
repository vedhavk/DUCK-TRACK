"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Camera, CheckCircle2, AlertTriangle, Loader2, MapPin, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CameraCapture from "@/components/CameraCapture";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [pinCode, setPinCode] = useState(profile?.pin_code ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Live camera state
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [capturedNotes, setCapturedNotes] = useState("");

  // New location workflow state
  const [locationProvided, setLocationProvided] = useState(false);
  const [locationMethod, setLocationMethod] = useState<"gps" | "manual" | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Custom interactive permission modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [preciseMode, setPreciseMode] = useState(true);
  const [showManualInModal, setShowManualInModal] = useState(false);
  const [triggerUploadAfterLocation, setTriggerUploadAfterLocation] = useState(false);

  useEffect(() => {
    farmerMe()
      .then((data) => {
        setProfile(data);
        if (!pinCode) setPinCode(data.pin_code);
      })
      .catch(() => {/* profile already loaded from localStorage */});
  }, []);

  async function handleGetGPSLocation() {
    setGpsLoading(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setGpsLoading(false);
      setShowManualInModal(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const latStr = String(lat.toFixed(6));
        const lngStr = String(lng.toFixed(6));
        setLatitude(latStr);
        setLongitude(lngStr);

        try {
          // Try reverse geocoding to display details clearly
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { "User-Agent": "DuckTrack-App/1.0" } }
          );
          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const road = address.road || "";
            const village = address.village || address.suburb || address.neighbourhood || address.town || "";
            const county = address.county || "";
            const district = address.state_district || address.district || "";
            const state = address.state || "";
            const postcode = address.postcode || "";

            const readableParts = [road, village, district || county, state].filter(Boolean);
            const readableAddress = readableParts.join(", ") + (postcode ? ` - ${postcode}` : "");
            
            setDetectedAddress(readableAddress || data.display_name || `GPS: ${latStr}, ${lngStr}`);
            if (postcode) setPinCode(postcode);
          } else {
            setDetectedAddress(`GPS: ${latStr}, ${lngStr}`);
          }
        } catch {
          setDetectedAddress(`GPS: ${latStr}, ${lngStr}`);
        }

        setLocationMethod("gps");
        setLocationProvided(true);
        setGpsLoading(false);
        setShowLocationModal(false);
      },
      (err) => {
        let msg = "Could not access GPS.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "GPS access permission denied. Please enter your location manually.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "GPS location information is unavailable. Please enter manually.";
        } else if (err.code === err.TIMEOUT) {
          msg = "GPS location request timed out. Please try again or enter manually.";
        }
        setLocationError(msg);
        setGpsLoading(false);
        setShowManualInModal(true);
      },
      { enableHighAccuracy: preciseMode, timeout: 10000 }
    );
  }

  async function handleVerifyManualLocation() {
    if (!manualAddress.trim()) {
      setLocationError("Please enter a valid village, district, or pin code.");
      return;
    }
    setManualLoading(true);
    setLocationError(null);

    try {
      // Fetch geocoding search to get lat, lon and display name
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualAddress)}&format=json&limit=1`,
        { headers: { "User-Agent": "DuckTrack-App/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          setLatitude(String(lat.toFixed(6)));
          setLongitude(String(lng.toFixed(6)));
          setDetectedAddress(result.display_name);
          
          // Try to extract a pincode if the address contains a 6-digit pin
          const pinMatch = result.display_name.match(/\b\d{6}\b/);
          if (pinMatch) {
            setPinCode(pinMatch[0]);
          } else if (profile?.pin_code) {
            setPinCode(profile.pin_code);
          }
          
          setLocationMethod("manual");
          setLocationProvided(true);
          setShowLocationModal(false);
        } else {
          // Fallback if address cannot be geocoded
          const profilePin = profile?.pin_code || "";
          setPinCode(profilePin);
          setLatitude("10.000000");
          setLongitude("76.000000");
          setDetectedAddress(manualAddress);
          setLocationMethod("manual");
          setLocationProvided(true);
          setShowLocationModal(false);
        }
      } else {
        throw new Error("Geocoding failed");
      }
    } catch {
      // Fallback on error
      setLatitude("10.000000");
      setLongitude("76.000000");
      setPinCode(profile?.pin_code || "");
      setDetectedAddress(manualAddress);
      setLocationMethod("manual");
      setLocationProvided(true);
      setShowLocationModal(false);
    } finally {
      setManualLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f);
    setUploadResult(null);
    setUploadError(null);
    setCapturedNotes("");
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  function handleCameraCapture(file: File, notes?: string) {
    setSelectedFile(file);
    setUploadResult(null);
    setUploadError(null);
    setCapturedNotes(notes ?? "");
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowLiveCamera(false);
  }

  // Trigger upload once location becomes provided and we were waiting for it
  useEffect(() => {
    if (locationProvided && triggerUploadAfterLocation) {
      setTriggerUploadAfterLocation(false);
      // Wait a tiny moment for coordinates state updates to apply completely
      setTimeout(() => {
        handleUploadDirectly();
      }, 100);
    }
  }, [locationProvided, triggerUploadAfterLocation]);

  async function handleUploadDirectly() {
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
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleUpload(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    if (!locationProvided) {
      setTriggerUploadAfterLocation(true);
      setShowLocationModal(true);
      return;
    }

    await handleUploadDirectly();
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
          {/* STEP 1: Select Duck Photo or Video (Visible immediately!) */}
          <div className="space-y-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              📸 Step 1: Select Duck Photo or Video
            </span>
            
            {/* File selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group h-24 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-teal-400 dark:hover:border-teal-500 transition-all text-slate-600 dark:text-slate-300 cursor-pointer animate-fadeIn"
              >
                <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-teal-500" />
                </div>
                <span className="font-semibold text-sm">Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLiveCamera(true)}
                className="group h-24 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-teal-400 dark:hover:border-teal-500 transition-all text-slate-600 dark:text-slate-300 cursor-pointer animate-fadeIn"
              >
                <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 text-teal-500" />
                </div>
                <span className="font-semibold text-sm">Use Live Camera</span>
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

            {selectedFile && previewUrl && (
              <div className="space-y-3 animate-fadeIn">
                <div className="px-4 py-2.5 bg-teal-50/75 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 rounded-xl text-sm text-teal-700 dark:text-teal-300 truncate font-semibold">
                  📎 Selected File: {selectedFile.name}
                </div>
                {capturedNotes && (
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 italic">
                    ✍️ Note: {capturedNotes}
                  </div>
                )}
                <div className="relative rounded-2xl overflow-hidden aspect-video max-h-[300px] bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                  {selectedFile.type.startsWith("video/") || selectedFile.name.endsWith(".mp4") || selectedFile.name.endsWith(".avi") ? (
                    <video 
                      src={previewUrl} 
                      controls 
                      className="max-h-[300px] object-contain w-full"
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Selected media preview" 
                      className="max-h-[300px] object-contain"
                    />
                  )}
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setCapturedNotes("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      if (cameraInputRef.current) cameraInputRef.current.value = "";
                    }}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 text-xs font-bold transition shadow-md cursor-pointer"
                    title="Remove media"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Location Verification & Review Fields */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                 Step 2: Location Verification
              </span>
              
              {!locationProvided ? (
                <button
                  type="button"
                  onClick={() => {
                    setLocationError(null);
                    setShowLocationModal(true);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Get Location
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setLocationProvided(false);
                    setLocationMethod(null);
                    setDetectedAddress(null);
                    setShowManualInModal(false);
                    setLocationError(null);
                  }}
                  className="text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Reset Location
                </button>
              )}
            </div>

            {/* Verification Status Alert */}
            {!locationProvided ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400 transition-all">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500 animate-bounce" />
                <div>
                  <span className="font-semibold block mb-0.5">Location Not Verified</span>
                  Click "Start Detection" to automatically verify coordinates or provide them manually.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/50 flex items-start gap-2.5 text-xs text-teal-700 dark:text-teal-400 transition-all">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal-500" />
                <div>
                  <span className="font-semibold block mb-0.5"> Verified Location ({locationMethod === 'gps' ? 'GPS Auto' : 'Manual'})</span>
                  {detectedAddress || "Coordinates resolved successfully."}
                </div>
              </div>
            )}

            {/* Editable location coordinates grid for review */}
            <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-3">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                ⚙️ Confirm / Edit Coordinates
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 10.1234"
                    value={latitude}
                    onChange={(e) => {
                      setLatitude(e.target.value);
                      if (!locationProvided) setLocationProvided(true);
                    }}
                    required
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 76.1234"
                    value={longitude}
                    onChange={(e) => {
                      setLongitude(e.target.value);
                      if (!locationProvided) setLocationProvided(true);
                    }}
                    required
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 682001"
                    value={pinCode}
                    onChange={(e) => {
                      setPinCode(e.target.value);
                      if (!locationProvided) setLocationProvided(true);
                    }}
                    required
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="px-4 py-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-700 dark:text-rose-400 animate-fadeIn">
              {uploadError}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={uploading || !selectedFile}
            className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold py-5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {uploading ? "Analysing…" : "Start Detection"}
          </Button>
        </form>

        {/* Custom Location Dialog Popup Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 max-w-sm w-full flex flex-col items-center text-center space-y-6 animate-scaleIn">
              
              {/* Top Blue Map Pin Icon Circle */}
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <MapPin className="w-6 h-6 animate-pulse" />
              </div>

              {/* Title Header */}
              <div className="space-y-2">
                <h4 className="text-slate-800 dark:text-white font-bold text-lg leading-tight px-2">
                  Allow Maps to access this device's precise location?
                </h4>
              </div>

              {gpsLoading ? (
                <div className="flex flex-col items-center py-6 space-y-3">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Detecting precise coordinates...
                  </span>
                </div>
              ) : showManualInModal ? (
                /* Manual Entry Fallback inside Modal */
                <div className="w-full space-y-4 py-2 text-left animate-fadeIn">
                  {locationError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-450 text-xs rounded-xl flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{locationError}</span>
                    </div>
                  )}
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                    Enter Village, District, or PIN Code:
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Vazhakulam, Ernakulam or 682021"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      disabled={manualLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleVerifyManualLocation();
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowManualInModal(false)}
                        disabled={manualLoading}
                        className="flex-1 rounded-xl text-slate-600 dark:text-slate-400 text-xs font-semibold py-2.5"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleVerifyManualLocation}
                        disabled={manualLoading || !manualAddress.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs py-2.5"
                      >
                        {manualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Proceed"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Native Permission Panel with Map Illustrations */
                <div className="w-full space-y-6">
                  {/* Visual Options - Map Toggles */}
                  <div className="flex justify-center gap-6 py-2">
                    
                    {/* Precise Map Circle */}
                    <div 
                      className="flex flex-col items-center gap-2 cursor-pointer group" 
                      onClick={() => setPreciseMode(true)}
                    >
                      <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center overflow-hidden relative transition-all ${preciseMode ? 'border-blue-600 ring-4 ring-blue-500/10 bg-blue-50/50 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                        {/* Grid Lines */}
                        <svg className="absolute inset-0 w-full h-full opacity-35 text-slate-350 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth="0.5">
                          <path d="M0 14h112M0 28h112M0 42h112M0 56h112M0 70h112M0 84h112M0 98h112M14 0v112M28 0v112M42 0v112M56 0v112M70 0v112M84 0v112M98 0v112" />
                        </svg>
                        <div className="w-16 h-16 rounded-full bg-blue-100/50 dark:bg-blue-900/30 flex items-center justify-center shadow-inner">
                          <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400 fill-blue-600/30" />
                        </div>
                      </div>
                      <span className={`text-xs font-bold transition-all ${preciseMode ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>Precise</span>
                    </div>

                    {/* Approximate Map Circle */}
                    <div 
                      className="flex flex-col items-center gap-2 cursor-pointer group" 
                      onClick={() => setPreciseMode(false)}
                    >
                      <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center overflow-hidden relative transition-all ${!preciseMode ? 'border-blue-600 ring-4 ring-blue-500/10 bg-blue-50/50 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                        {/* Roads Layout */}
                        <svg className="absolute inset-0 w-full h-full text-amber-500 dark:text-amber-600 opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M10 0 C 30 40, 50 60, 70 112 M 0 30 Q 50 50, 112 30 M 30 112 Q 80 50, 112 90" />
                          <circle cx="30" cy="50" r="3" className="fill-blue-500 text-blue-500" strokeWidth="0" />
                          <circle cx="80" cy="80" r="3" className="fill-blue-500 text-blue-500" strokeWidth="0" />
                        </svg>
                      </div>
                      <span className={`text-xs font-bold transition-all ${!preciseMode ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>Approximate</span>
                    </div>

                  </div>

                  {/* Standard Android / iOS Dialog Action Buttons Stack */}
                  <div className="flex flex-col gap-2.5 w-full">
                    <button
                      type="button"
                      onClick={handleGetGPSLocation}
                      className="w-full py-3.5 px-4 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-bold rounded-full text-sm transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      While using the app
                    </button>
                    <button
                      type="button"
                      onClick={handleGetGPSLocation}
                      className="w-full py-3.5 px-4 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-bold rounded-full text-sm transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      Only this time
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualInModal(true);
                        setLocationError(null);
                      }}
                      className="w-full py-3.5 px-4 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/80 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-bold rounded-full text-sm transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      Don't allow
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

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
              {capturedNotes && (
                <div className="col-span-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1">Attached Note: </span>
                  <span className="block px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300 italic text-xs">
                    {capturedNotes}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showLiveCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowLiveCamera(false)}
          allowNotes={true}
          buttonLabel="Use Photo for Analysis"
        />
      )}
    </div>
  );
}
