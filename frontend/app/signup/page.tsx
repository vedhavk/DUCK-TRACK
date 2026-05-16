"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, Stethoscope, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function SignupPage() {
  const [role, setRole] = useState("farmer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    roleSpecific: "", // Farm Name, License Number, or Organization
    password: "",
    confirmPassword: "",
  });

  const getRoleConfig = () => {
    switch (role) {
      case "farmer":
        return {
          icon: <Sprout className="w-8 h-8 text-white" />,
          bgColor: "bg-[#00a693] dark:bg-emerald-600",
          buttonColor: "bg-[#00a693] hover:opacity-90 dark:bg-emerald-600 dark:hover:bg-emerald-700",
          textColor: "text-[#00a693] dark:text-emerald-500",
          label: "Farm Name",
          placeholder: "Green Valley Farm",
        };
      case "veterinarian":
        return {
          icon: <Stethoscope className="w-8 h-8 text-white" />,
          bgColor: "bg-[#334155] dark:bg-indigo-600",
          buttonColor: "bg-[#334155] hover:opacity-90 dark:bg-indigo-600 dark:hover:bg-indigo-700",
          textColor: "text-[#334155] dark:text-indigo-400",
          label: "License Number",
          placeholder: "VET-12345",
        };

      default:
        return {
          icon: <Sprout className="w-8 h-8 text-white" />,
          bgColor: "bg-[#00a693] dark:bg-emerald-600",
          buttonColor: "bg-[#00a693] hover:opacity-90 dark:bg-emerald-600 dark:hover:bg-emerald-700",
          textColor: "text-[#00a693] dark:text-emerald-500",
          label: "Farm Name",
          placeholder: "Green Valley Farm",
        };
    }
  };

  const config = getRoleConfig();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Signup:", { role, ...formData });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <Card className="bg-white dark:bg-slate-900/80 backdrop-blur-xl shadow-xl border-slate-200 dark:border-slate-800">
          <CardHeader className="text-center pb-4">
            <div
              className={`mx-auto mb-4 w-16 h-16 ${config.bgColor} rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300`}
            >
              {config.icon}
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white font-serif">
              Create Account
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Join Duck Track Smart Monitoring System
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("farmer")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      role === "farmer"
                        ? "border-[#00a693] dark:border-emerald-500 bg-[#00a693]/10 dark:bg-emerald-500/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <Sprout
                      className={`w-5 h-5 mx-auto mb-1 ${role === "farmer" ? "text-[#00a693] dark:text-emerald-500" : "text-slate-400 dark:text-slate-500"}`}
                    />
                    <span
                      className={`text-xs font-medium ${role === "farmer" ? "text-[#00a693] dark:text-emerald-500" : "text-slate-600 dark:text-slate-400"}`}
                    >
                      Farmer
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("veterinarian")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      role === "veterinarian"
                        ? "border-[#334155] dark:border-indigo-500 bg-[#334155]/10 dark:bg-indigo-500/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <Stethoscope
                      className={`w-5 h-5 mx-auto mb-1 ${role === "veterinarian" ? "text-[#334155] dark:text-indigo-500" : "text-slate-400 dark:text-slate-500"}`}
                    />
                    <span
                      className={`text-xs font-medium ${role === "veterinarian" ? "text-[#334155] dark:text-indigo-500" : "text-slate-600 dark:text-slate-400"}`}
                    >
                      Veterinarian
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="roleSpecific"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  {config.label}
                </label>
                <Input
                  id="roleSpecific"
                  name="roleSpecific"
                  type="text"
                  placeholder={config.placeholder}
                  value={formData.roleSpecific}
                  onChange={handleChange}
                  required
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-start text-sm">
                <input
                  type="checkbox"
                  className="mr-2 mt-1 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  required
                />
                <label className="text-slate-600 dark:text-slate-400">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className={`${config.textColor} hover:underline`}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className={`${config.textColor} hover:underline`}
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className={`w-full ${config.buttonColor} text-white font-medium py-5 rounded-lg`}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/"
                className={`${config.textColor} hover:underline font-semibold`}
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
