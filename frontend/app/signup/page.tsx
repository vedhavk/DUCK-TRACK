"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sprout, Stethoscope, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { farmerRegister, vetRegister } from "@/lib/api";

export default function SignupPage() {
  const [role, setRole] = useState("farmer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pin_code: "",
    district: "",
    state: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getRoleConfig = () => {
    switch (role) {
      case "farmer":
        return {
          icon: <Sprout className="w-8 h-8 text-white" />,
          bgColor: "bg-[#00a693] dark:bg-emerald-600",
          buttonColor:
            "bg-[#00a693] hover:opacity-90 dark:bg-emerald-600 dark:hover:bg-emerald-700",
          textColor: "text-[#00a693] dark:text-emerald-500",
        };
      case "veterinarian":
        return {
          icon: <Stethoscope className="w-8 h-8 text-white" />,
          bgColor: "bg-[#334155] dark:bg-indigo-600",
          buttonColor:
            "bg-[#334155] hover:opacity-90 dark:bg-indigo-600 dark:hover:bg-indigo-700",
          textColor: "text-[#334155] dark:text-indigo-400",
        };
      default:
        return {
          icon: <Sprout className="w-8 h-8 text-white" />,
          bgColor: "bg-[#00a693] dark:bg-emerald-600",
          buttonColor:
            "bg-[#00a693] hover:opacity-90 dark:bg-emerald-600 dark:hover:bg-emerald-700",
          textColor: "text-[#00a693] dark:text-emerald-500",
        };
    }
  };

  const config = getRoleConfig();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      pin_code: formData.pin_code,
      district: formData.district,
      state: formData.state,
      password: formData.password,
    };

    setLoading(true);
    try {
      if (role === "farmer") {
        await farmerRegister(payload);
        router.push("/login/farmer?registered=1");
      } else {
        await vetRegister(payload);
        router.push("/login/veterinarian?registered=1");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
              {/* Error banner */}
              {error && (
                <div className="px-4 py-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-700 dark:text-rose-400">
                  {error}
                </div>
              )}

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

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Email */}
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
                  disabled={loading}
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* District + State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    District
                  </label>
                  <Input
                    id="district"
                    name="district"
                    type="text"
                    placeholder="e.g. Ernakulam"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    State
                  </label>
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="e.g. Kerala"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* PIN Code */}
              <div>
                <label
                  htmlFor="pin_code"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  PIN Code
                </label>
                <Input
                  id="pin_code"
                  name="pin_code"
                  type="text"
                  placeholder="e.g. 682001"
                  value={formData.pin_code}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Password */}
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
                  disabled={loading}
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Confirm Password */}
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
                  disabled={loading}
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full ${config.buttonColor} text-white font-medium py-5 rounded-lg flex items-center justify-center gap-2`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Creating account…" : "Create Account"}
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
