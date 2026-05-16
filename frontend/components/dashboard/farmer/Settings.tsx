import { Bell, User, Lock, Camera, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Settings() {
  return (
    <div className="max-w-4xl">
      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-600 dark:text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Profile Settings
            </h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <Input placeholder="John Doe" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <Input type="email" placeholder="farmer@example.com" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <Input type="tel" placeholder="+1 (555) 000-0000" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Farm Name
                </label>
                <Input placeholder="Green Valley Farm" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
              </div>
            </div>
            <Button className="bg-green-500 hover:bg-green-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white">
              Save Profile
            </Button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Security Settings
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Current Password
              </label>
              <Input type="password" placeholder="••••••••" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  New Password
                </label>
                <Input type="password" placeholder="••••••••" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm Password
                </label>
                <Input type="password" placeholder="••••••••" className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
              </div>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
              Update Password
            </Button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600 dark:text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Notification Preferences
            </h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                defaultChecked
              />
              <span className="text-slate-700 dark:text-slate-300">
                Email notifications for health alerts
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                defaultChecked
              />
              <span className="text-slate-700 dark:text-slate-300">Daily activity summaries</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
              <span className="text-slate-700 dark:text-slate-300">Weekly health reports</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                defaultChecked
              />
              <span className="text-slate-700 dark:text-slate-300">System maintenance alerts</span>
            </label>
          </div>
        </div>

        {/* Camera Settings */}
        <div className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-600 dark:text-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Camera Settings
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Camera Resolution
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                <option>1080p (Recommended)</option>
                <option>720p</option>
                <option>480p</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Frame Rate
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                <option>30 FPS</option>
                <option>24 FPS</option>
                <option>15 FPS</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                defaultChecked
              />
              <span className="text-slate-700 dark:text-slate-300">
                Enable motion detection alerts
              </span>
            </label>
          </div>
        </div>

        {/* Data Settings */}
        <div className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Data Management
            </h3>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage your stored data and reports
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Export All Data</Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 dark:border-slate-700 dark:text-red-400 dark:hover:bg-slate-800 dark:hover:text-red-300"
              >
                Delete Old Reports
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
