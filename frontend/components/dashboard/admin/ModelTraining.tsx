import { Cpu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { trainingRuns } from "@/lib/adminMockApi";

export default function ModelTraining() {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Model Training</h3>
        <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-700 text-white">
          Start New Training
        </Button>
      </div>
      <div className="space-y-4">
        {trainingRuns.map((run) => (
          <div key={run.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                <p className="font-semibold text-slate-900 dark:text-white">{run.model}</p>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {run.status}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-2 rounded-full bg-fuchsia-500 dark:bg-fuchsia-400"
                style={{ width: `${run.progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Progress: {run.progress}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
