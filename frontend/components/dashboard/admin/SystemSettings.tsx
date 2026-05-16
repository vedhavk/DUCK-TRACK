import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SystemSettings() {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">System Settings</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Detection Threshold
          </label>
          <Input defaultValue="0.65" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Alert Email
          </label>
          <Input defaultValue="alerts@ducktrack.local" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
          Enable auto retraining weekly
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
          />
          Send critical alerts instantly
        </label>
      </div>
      <div className="mt-5">
        <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white">
          Save Settings
        </Button>
      </div>
    </section>
  );
}
