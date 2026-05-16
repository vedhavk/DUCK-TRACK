"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  Stethoscope,
  Shield,
  Upload,
  ArrowRight,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  function handleTakePhotoClick() {
    cameraInputRef.current?.click();
  }

  function handleChooseFromGalleryClick() {
    galleryInputRef.current?.click();
  }

  function handleQuickUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files.map((file) => file.name));
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto">
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <ThemeToggle />
        </div>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#00a693] dark:bg-emerald-600 p-3 rounded-2xl shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.5 5c-1.33 0-2.42.83-2.83 2H4c-.55 0-1 .45-1 1s.45 1 1 1h1.67c.41 1.17 1.5 2 2.83 2 1.33 0 2.42-.83 2.83-2H20c.55 0 1-.45 1-1s-.45-1-1-1h-8.67c-.41-1.17-1.5-2-2.83-2zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 3c-1.33 0-2.42.83-2.83 2H4c-.55 0-1 .45-1 1s.45 1 1 1h8.67c.41 1.17 1.5 2 2.83 2 1.33 0 2.42-.83 2.83-2H20c.55 0 1-.45 1-1s-.45-1-1-1h-1.67c-.41-1.17-1.5-2-2.83-2zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#00a693] dark:text-emerald-500 mb-2 font-serif">Duck Track</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
            Smart Duck Monitoring System
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Upload duck images first or select your role to continue
          </p>
        </div>

        {/* Quick Analysis Section */}
        <div className="mb-16 w-full max-w-5xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
            <div className="flex flex-col md:flex-row">
              {/* Image Banner Side */}
              <div className="md:w-2/5 relative min-h-[220px] md:min-h-auto">
                <div 
                  className="absolute inset-0 bg-[url('/ducks_swimming.jpg')] bg-cover bg-center" 
                  aria-label="Ducks swimming in a lake"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent md:bg-linear-to-r md:from-slate-900/20 md:to-transparent" />
                
                {/* Mobile Title overlay */}
                <div className="absolute bottom-6 left-6 text-white md:hidden">
                  <h2 className="text-2xl font-bold font-serif shadow-sm">Quick Analysis</h2>
                  <p className="text-sm opacity-90 mt-1">Upload media for instant detection</p>
                </div>
              </div>

              {/* Upload Interface Side */}
              <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                {/* Desktop Title */}
                <div className="hidden md:block mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-serif">
                    Instant Analysis Tool
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Upload a photo or video to instantly start duck disease detection.
                  </p>
                </div>

                {/* Upload Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <button 
                    onClick={handleChooseFromGalleryClick}
                    className="group h-24 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-[#00a693] dark:hover:border-emerald-500 transition-all text-slate-600 dark:text-slate-300"
                  >
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-[#00a693] dark:text-emerald-500" />
                    </div>
                    <span className="font-semibold text-sm">Upload File</span>
                  </button>
                  
                  <button 
                    onClick={handleTakePhotoClick}
                    className="group h-24 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-[#00a693] dark:hover:border-emerald-500 transition-all text-slate-600 dark:text-slate-300"
                  >
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5 text-[#00a693] dark:text-emerald-500" />
                    </div>
                    <span className="font-semibold text-sm">Use Camera</span>
                  </button>
                </div>

                {/* Selected File Feedback */}
                {selectedFiles.length > 0 && (
                  <div className="mb-6 px-4 py-3 bg-[#00a693]/5 dark:bg-emerald-500/10 rounded-xl border border-[#00a693]/20 dark:border-emerald-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                      <ImageIcon className="w-4 h-4 text-[#00a693] dark:text-emerald-500" />
                    </div>
                    <div className="flex-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {selectedFiles.join(", ")}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-auto">
                  <Button 
                    className="flex-1 h-12 rounded-xl bg-[#00a693] hover:bg-[#008f7f] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold transition-all shadow-md hover:shadow-lg"
                  >
                    Start Detection
                  </Button>
                  {selectedFiles.length > 0 && (
                     <Button 
                       variant="outline"
                       className="px-6 h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all font-semibold"
                       onClick={() => setSelectedFiles([])}
                     >
                       Clear
                     </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Farmer Card */}
          <Card className="bg-white dark:bg-slate-800/50 hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-[#00a693] dark:bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 font-serif">Farmer</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 min-h-12">
                Monitor your ducks with simple visual dashboard
              </p>
              <Link href="/login/farmer">
                <Button className="w-full bg-[#00a693] dark:bg-emerald-600 hover:opacity-90 text-white font-medium py-5 rounded-lg group">
                  Sign In as Farmer
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Veterinarian Card */}
          <Card className="bg-white dark:bg-slate-800/50 hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-[#334155] dark:bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 font-serif">
                Veterinarian
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 min-h-12">
                Advanced health monitoring and disease detection
              </p>
              <Link href="/login/veterinarian">
                <Button className="w-full bg-[#334155] dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-medium py-5 rounded-lg group">
                  Sign In as Veterinarian
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* System Admin Card */}
          <Card className="bg-white dark:bg-slate-800/50 hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-[#334155] dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 font-serif">
                System Admin
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 min-h-12">
                Manage system, train models, and control settings
              </p>
              <Link href="/login/admin">
                <Button className="w-full bg-[#334155] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-medium py-5 rounded-lg group">
                  Sign In as System Admin
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#00a693] dark:text-emerald-500 hover:opacity-80 font-semibold hover:underline"
            >
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
