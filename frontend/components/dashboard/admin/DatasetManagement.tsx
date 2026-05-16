import { Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import { datasets } from "@/lib/adminMockApi";

export default function DatasetManagement() {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dataset Management</h3>
        <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
          Upload Dataset
        </Button>
      </div>
      <div className="space-y-3">
        {datasets.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.images} images • Updated {item.updatedAt}
                </p>
              </div>
            </div>
            <Button variant="outline" className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Manage</Button>
          </div>
        ))}
      </div>
    </section>
  );
}
