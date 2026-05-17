"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";

import { adminLogin, setToken, setRole, setUser } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await adminLogin(email, password);
      localStorage.setItem("admin_token", data.access_token);
      setToken(data.access_token);
      setRole("admin");
      setUser({
        id: data.user.id,
        name: "Administrator",
        email: data.user.username,
        pin_code: "000000",
        district: "System",
        state: "System"
      });
      router.push("/dashboard/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
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
            <div className="mx-auto mb-6 w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                <Image src="/admin.jpeg" alt="Farmer" width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white font-serif">
              System Admin Login
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Access system management and configuration
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="px-4 py-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-700 dark:text-rose-400">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#334155] dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-medium py-5 rounded-lg flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>


          </CardContent>
        </Card>
      </div>
    </div>
  );
}
