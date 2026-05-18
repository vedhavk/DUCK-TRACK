"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Camera, 
  RotateCw, 
  X, 
  ZoomIn, 
  ZoomOut, 
  AlertCircle, 
  Sparkles, 
  FileEdit, 
  Upload,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (file: File, notes?: string) => void;
  onClose: () => void;
  allowNotes?: boolean;
  buttonLabel?: string;
}

export default function CameraCapture({
  onCapture,
  onClose,
  allowNotes = true,
  buttonLabel = "Use Captured Image"
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stream and device state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "loading">("loading");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [minZoom, setMinZoom] = useState<number>(1);
  const [maxZoom, setMaxZoom] = useState<number>(1);
  const [supportsZoom, setSupportsZoom] = useState<boolean>(false);

  // Capture state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [showNotesForm, setShowNotesForm] = useState<boolean>(false);

  // Fetch available camera devices
  useEffect(() => {
    async function getDevices() {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devs.filter((device) => device.kind === "videoinput");
        setDevices(videoDevs);
        if (videoDevs.length > 0 && !selectedDeviceId) {
          // Default to the first environment (back) camera or fallback to first device
          const backCam = videoDevs.find(d => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("environment"));
          setSelectedDeviceId(backCam ? backCam.deviceId : videoDevs[0].deviceId);
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    }

    if (permissionState === "granted") {
      getDevices();
    }
  }, [permissionState, selectedDeviceId]);

  // Start the video stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      setCameraError(null);
      setPermissionState("loading");

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId 
            ? { deviceId: { exact: selectedDeviceId } } 
            : { facingMode: facingMode },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);
        setPermissionState("granted");

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Check for zoom capability in track constraints
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities() as any;
          if (capabilities && "zoom" in capabilities) {
            setSupportsZoom(true);
            setMinZoom(capabilities.zoom.min || 1);
            setMaxZoom(capabilities.zoom.max || 4);
            setZoomLevel(capabilities.zoom.min || 1);
          } else {
            setSupportsZoom(false);
          }
        }
      } catch (err: any) {
        console.error("Camera access failed:", err);
        setPermissionState("denied");
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("Camera permission denied. Please grant permission in browser settings.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraError("No camera device found on this system.");
        } else {
          setCameraError("Could not access camera feed. Using file upload fallback instead.");
        }
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedDeviceId, facingMode]);

  // Handle zoom changes
  useEffect(() => {
    if (stream && supportsZoom) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          videoTrack.applyConstraints({
            advanced: [{ zoom: zoomLevel } as any]
          });
        } catch (err) {
          console.error("Failed to apply zoom level:", err);
        }
      }
    }
  }, [zoomLevel, stream, supportsZoom]);

  // Capture Snapshot
  function captureSnapshot() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Match canvas dimensions to the video resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame onto the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas image to data URL
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);

        // Create File object from dataUrl
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `ducktrack_capture_${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            setImageFile(file);
          }
        }, "image/jpeg", 0.95);
      }
    }
  }

  // Toggle Camera Front/Back
  function toggleCameraDirection() {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    // Clear device id to rely on facingMode
    setSelectedDeviceId("");
  }

  // Cycle through all available video devices
  function cycleDevices() {
    if (devices.length <= 1) return;
    const currentIndex = devices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDeviceId(devices[nextIndex].deviceId);
  }

  // Reset Captured Snapshot
  function retakeImage() {
    setCapturedImage(null);
    setImageFile(null);
    setShowNotesForm(false);
  }

  // Finalize Upload / Usage
  function handleUseImage() {
    if (imageFile) {
      onCapture(imageFile, notes);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 dark:bg-teal-950 rounded-lg text-teal-600 dark:text-teal-400">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {capturedImage ? "Preview Capture" : "Live Camera Feed"}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder or Preview Screen */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden aspect-video">
          {!capturedImage ? (
            <>
              {/* Live Video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[50vh]"
              />

              {/* Status Message Overlay */}
              {permissionState === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white gap-3 z-10">
                  <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold">Starting camera feed...</p>
                </div>
              )}

              {permissionState === "denied" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950 text-white text-center gap-3 z-10">
                  <AlertCircle className="w-12 h-12 text-rose-500" />
                  <p className="text-base font-bold text-rose-400">Camera Unavailable</p>
                  <p className="text-sm text-slate-400 max-w-sm">
                    {cameraError || "Please check your system or browser settings to enable camera permissions."}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="mt-2 text-white border-slate-700 hover:bg-slate-800"
                  >
                    Use File Upload Instead
                  </Button>
                </div>
              )}

              {/* Zoom Controls Overlay (if supported) */}
              {permissionState === "granted" && supportsZoom && (
                <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-3 z-10">
                  <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 shadow-lg text-white">
                    <ZoomOut className="w-4 h-4 opacity-80" />
                    <input
                      type="range"
                      min={minZoom}
                      max={maxZoom}
                      step="0.1"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                      className="w-24 accent-teal-500"
                    />
                    <ZoomIn className="w-4 h-4 opacity-80" />
                    <span className="text-xs font-mono font-bold">{zoomLevel.toFixed(1)}x</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Image Preview */
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950 max-h-[50vh]">
              <img
                src={capturedImage}
                alt="Captured animal/farm condition"
                className="w-full h-full object-contain max-h-[50vh]"
              />
            </div>
          )}

          {/* Hidden Canvas for Processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Notes Annotation Form */}
        {capturedImage && allowNotes && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileEdit className="w-3.5 h-3.5 text-teal-500" />
                Add Diagnosis Notes or Comments
              </span>
              {notes && (
                <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                  Saved with capture
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. Lethargic behavioral symptoms, suspicious swelling on the neck, abnormal breathing noticed..."
              className="w-full h-20 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400 resize-none transition"
            />
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-4 bg-slate-50 dark:bg-slate-900/50">
          {!capturedImage ? (
            /* Live Camera Feed Controls */
            <>
              <div className="flex gap-2">
                {devices.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cycleDevices}
                    title="Cycle through cameras"
                    className="rounded-xl dark:border-slate-800 dark:text-slate-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Switch Cam ({devices.length})
                  </Button>
                )}
                {devices.length <= 1 && permissionState === "granted" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={toggleCameraDirection}
                    title="Toggle front/back camera"
                    className="rounded-xl dark:border-slate-800 dark:text-slate-300"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Flip Camera
                  </Button>
                )}
              </div>
              <Button
                type="button"
                onClick={captureSnapshot}
                disabled={permissionState !== "granted"}
                className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md px-6 ml-auto"
              >
                <Camera className="w-5 h-5" />
                Capture Photo
              </Button>
            </>
          ) : (
            /* Preview Screen Controls */
            <>
              <Button
                type="button"
                variant="outline"
                onClick={retakeImage}
                className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 font-bold"
              >
                Retake
              </Button>
              <Button
                type="button"
                onClick={handleUseImage}
                className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md px-6"
              >
                <Upload className="w-4 h-4" />
                {buttonLabel}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
