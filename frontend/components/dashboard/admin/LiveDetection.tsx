import { useState, useRef } from "react";
import { AlertCircle, Camera, Upload, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile, UploadResult } from "@/lib/api";

export default function LiveDetection() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Coordinates State prefills matching Farmer Dashboard
  const [latitude, setLatitude] = useState("9.458348");
  const [longitude, setLongitude] = useState("76.438790");
  const [pinCode, setPinCode] = useState("688504");

  const handleFileChange = (selectedFile: File) => {
    setError(null);
    setResult(null);
    setFile(selectedFile);
    
    // Create preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!file) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || !pinCode.trim()) {
      setError("Please enter valid Latitude, Longitude, and PIN Code values.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Send selected coordinates and PIN code to the backend pipeline
      const res = await uploadFile(file, lat, lng, pinCode);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Media analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const isVideo = file?.type.startsWith("video/") || file?.name.endsWith(".mp4") || file?.name.endsWith(".avi");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Upload & Parameters Column */}
        <section className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Media Feed</h3>
            
            {/* Drag & Drop Zone */}
            {!previewUrl ? (
              <div 
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={triggerFileSelect}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[300px]"
              >
                <Upload className="w-12 h-12 text-slate-400 mb-4 animate-bounce" />
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                  Drag & Drop duck media
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Supports image (PNG, JPG) or video (MP4, AVI)
                </p>
                <Button variant="outline" className="mt-4 gap-2 dark:border-slate-700 dark:text-slate-200">
                  Select File
                </Button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                  accept="image/*,video/*"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                {isVideo ? (
                  <video 
                    src={previewUrl} 
                    controls 
                    className="max-h-full object-contain"
                  />
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-full object-contain"
                  />
                )}
                
                <button 
                  onClick={resetForm}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 text-xs font-bold transition"
                  title="Remove media"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Manual Coordinate Parameters - Prefilled & Fully Mutable */}
            {previewUrl && !result && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 9.458348"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 76.438790"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 688504"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {previewUrl && !result && (
              <Button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Executing ML Pipeline Diagnosis...
                  </>
                ) : (
                  "Execute ML Pipeline Diagnosis"
                )}
              </Button>
            )}
            
            {result && (
              <Button 
                onClick={resetForm} 
                variant="outline"
                className="w-full dark:border-slate-700 dark:text-slate-200"
              >
                Analyze Another File
              </Button>
            )}
          </div>
        </section>

        {/* Results Panel */}
        <section className="w-full md:w-[380px] shrink-0 space-y-6">
          
          {/* Classification Results */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Diagnosis Output
            </h3>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl flex gap-3 text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!result && !loading && !error && (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
                <Camera className="w-12 h-12 mb-3 stroke-[1.5]" />
                <p className="text-base font-medium">Awaiting Duck Media</p>
                <p className="text-xs mt-1">Upload a photo or video to execute MobileNetV2 / EfficientNetB0 classification</p>
              </div>
            )}

            {loading && (
              <div className="py-16 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-3" />
                <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
                  Processing ML Pipeline...
                </p>
                <p className="text-xs mt-1">Extracting features and classifying health markers</p>
              </div>
            )}

            {result && (
              <div className="space-y-5">
                <div className={`p-4 rounded-xl flex items-start gap-3 border ${
                  result.prediction === "diseased" 
                    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                    : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                }`}>
                  {result.prediction === "diseased" ? (
                    <AlertTriangle className="w-6 h-6 shrink-0 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <div>
                    <h4 className="font-bold text-lg capitalize">{result.prediction}</h4>
                    <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
                      {result.prediction === "diseased" 
                        ? "Potential Avian Influenza symptoms identified. Alert triggers initiated."
                        : "The duck displays healthy physical indicators."}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Confidence Match</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {(result.confidence * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Pipeline Model</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {result.file_type === "image" ? "MobileNetV2" : "EfficientNetB0"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Report Status</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {result.prediction === "diseased" ? "⚠️ Outbreak Registered" : "✅ Clear"}
                    </span>
                  </div>
                  {result.alerts_sent && (
                    <div className="flex justify-between pb-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Alerts Sent</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {result.alerts_sent.farmers.length + result.alerts_sent.vets.length} Stakeholders
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Model Specification Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Model Parameters</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Image Classification</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">MobileNetV2</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Video Classification</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">EfficientNetB0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Outbreak Validation</dt>
                <dd className="font-semibold text-emerald-600 dark:text-emerald-400">Enabled</dd>
              </div>
            </dl>
          </div>

        </section>
      </div>
    </div>
  );
}
