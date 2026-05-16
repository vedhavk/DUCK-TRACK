import Image from "next/image";
import { AlertCircle, Camera, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { adminMetrics } from "@/lib/adminMockApi";

export default function LiveDetection() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Real-time duck detection and tracking
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminMetrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                {metric.value}
              </p>
              {metric.helper && (
                <p className="text-xs text-slate-400 dark:text-slate-500">{metric.helper}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Video Feed</h3>
            <Button variant="outline" className="gap-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <Upload className="h-4 w-4" />
              Upload Video
            </Button>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <div className="relative aspect-video bg-slate-900 dark:bg-black">
              <Image
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1280&h=720&fit=crop"
                alt="Detection preview"
                fill
                className="object-cover opacity-70 dark:opacity-50"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 dark:bg-black/50 text-white">
                <Camera className="mb-3 h-14 w-14" />
                <p className="text-3xl font-bold text-white">No video feed</p>
                <p className="mt-2 text-sm text-white/80">
                  Upload video or start live detection
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Button className="bg-linear-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 dark:from-blue-600 dark:to-emerald-600 dark:hover:from-blue-500 dark:hover:to-emerald-500 text-white">
              Start Detection
            </Button>
            <Button
              variant="secondary"
              className="bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:hover:bg-rose-900/50"
            >
              Stop Detection
            </Button>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Detection Results
            </h3>
            <div className="mt-10 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
              <AlertCircle className="h-12 w-12" />
              <p className="text-lg">No active detection</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Model Info</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Model</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">YOLOv8</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Version</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">v1.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Accuracy</dt>
                <dd className="font-semibold text-emerald-600 dark:text-emerald-400">94.5%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Trained On</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">Mar 10, 2026</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
