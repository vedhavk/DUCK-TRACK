"use client";

import { Info } from "lucide-react";

export default function ImageReview() {
  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900/80 p-8 shadow-sm border border-slate-200 dark:border-slate-800">
      <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
        Image Review
      </h3>
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Image review gallery is not yet available from the backend. Uploaded images are
          processed by the model in real-time; a gallery endpoint will be added in a future
          release.
        </p>
      </div>
    </section>
  );
}
