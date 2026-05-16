"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  type DetectionImage,
  getDetectionImages,
} from "@/lib/veterinarianMockApi";

export default function ImageReview() {
  const [detectionImages, setDetectionImages] = useState<DetectionImage[]>([]);

  useEffect(() => {
    async function loadDetections() {
      const detections = await getDetectionImages();
      setDetectionImages(detections);
    }

    loadDetections();
  }, []);

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900/80 p-5 shadow-sm border border-slate-200 dark:border-slate-800">
      <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
        Recent Detections
      </h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {detectionImages.map((item) => {
          const isAlert = item.status === "Alert";

          return (
            <div key={item.id}>
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <div
                  className={`absolute right-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold text-white ${isAlert ? "bg-orange-500" : "bg-emerald-500"}`}
                >
                  {item.status}
                </div>
                <div
                  className={`absolute inset-3 z-10 rounded-xl border-2 ${isAlert ? "border-orange-400" : "border-emerald-400"}`}
                />
                <div className="relative aspect-4/4">
                  <Image
                    src={item.imageUrl}
                    alt={`Detection ${item.id}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.capturedAt}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
