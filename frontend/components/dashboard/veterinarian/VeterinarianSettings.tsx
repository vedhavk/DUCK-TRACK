import { Bell, Lock, MonitorDot, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VeterinarianSettings() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl bg-white dark:bg-slate-900/80 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-3">
            <UserRound className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <Input placeholder="Dr. Jane Smith" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <Input placeholder="vet@example.com" type="email" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              License Number
            </label>
            <Input placeholder="VET-12345" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
            Save Profile
          </Button>
        </div>
      </section>

      <section className="rounded-2xl bg-white dark:bg-slate-900/80 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 dark:bg-violet-900/30 p-3">
            <Lock className="h-5 w-5 text-violet-600 dark:text-violet-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security</h3>
        </div>
        <div className="space-y-4">
          <Input type="password" placeholder="Current password" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
          <Input type="password" placeholder="New password" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
          <Input type="password" placeholder="Confirm new password" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
          <Button className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white">
            Update Password
          </Button>
        </div>
      </section>

      <section className="rounded-2xl bg-white dark:bg-slate-900/80 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 dark:bg-amber-900/30 p-3">
            <Bell className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h3>
        </div>
        <div className="space-y-3 text-slate-700 dark:text-slate-300">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
            Critical health alerts
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
            Behavioral anomalies
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
            Daily report digest
          </label>
        </div>
      </section>

      <section className="rounded-2xl bg-white dark:bg-slate-900/80 p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900/30 p-3">
            <MonitorDot className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Review Preferences
          </h3>
        </div>
        <div className="space-y-4 text-slate-700 dark:text-slate-300">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Default review queue
            </label>
            <select className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2">
              <option>Health Alerts</option>
              <option>Image Review</option>
              <option>Behavior Analysis</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
            Auto-highlight abnormal posture detections
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
            Show clinical suggestions in alerts
          </label>
        </div>
      </section>
    </div>
  );
}
