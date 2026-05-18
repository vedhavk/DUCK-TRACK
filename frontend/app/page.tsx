"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto">
        <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-4">
          <Link href="/login/admin" className="group relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-800 transition-all"
            >
              <Shield className="w-5 h-5" />
            </Button>
            <div className="absolute right-0 top-full mt-2 w-max px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
              Welcome Admins
            </div>
          </Link>
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#00a693] dark:bg-emerald-600 p-3 rounded-2xl shadow-lg">
              <Image
                src="/chatbot-icon.png"
                alt="Duck Track Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#00a693] dark:text-emerald-500 mb-2 font-serif">
            Duck Track
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
            Smart Duck Monitoring System
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Select your role to continue
          </p>
        </div>

        {/* Avian Influenza Awareness Section */}
        <div className="mb-16 w-full max-w-5xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
            <div className="flex flex-col md:flex-row">
              {/* Image Banner Side */}
              <div className="md:w-2/5 relative min-h-[260px] md:min-h-auto">
                <div
                  className="absolute inset-0 bg-[url('/ducks_swimming.jpg')] bg-cover bg-center"
                  aria-label="Ducks swimming in a lake"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/40 to-transparent md:bg-linear-to-r md:from-slate-900/50 md:to-transparent" />

                {/* Mobile Title overlay */}
                <div className="absolute bottom-6 left-6 text-white md:hidden">
                  <h2 className="text-2xl font-bold font-serif shadow-sm">
                    Avian Influenza
                  </h2>
                  <p className="text-sm opacity-90 mt-1 flex items-center gap-1">
                    <Info className="w-4 h-4" /> Important Awareness
                  </p>
                </div>
              </div>

              {/* Information Side */}
              <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                {/* Desktop Title */}
                <div className="hidden md:flex flex-col mb-6">
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white font-serif leading-tight">
                    Avian Influenza Alert & Early Reporting
                  </h2>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                  Avian Influenza (Bird Flu) is a highly contagious viral
                  disease that can rapidly spread among ducks and poultry. Early
                  detection and quick reporting are critical to prevent
                  outbreaks, protect farms, and safeguard nearby poultry
                  populations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                      Important Points
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <span>Spreads quickly between birds.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <span>
                          Symptoms: sudden death, Respiratory distress,
                          Behavioral changes, swelling, breathing difficulty,
                          reduced egg production.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <span>Early reporting helps vets respond faster.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                      Why It Matters
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Protect nearby farms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Prevent disease spreading</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Enable fast veterinary response</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Help authorities track outbreaks</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-auto">
                  <Link href="/login/farmer">
                    <Button className="w-full h-12 rounded-xl bg-green-600 hover:bg-rose-700 dark:bg-green-600 dark:hover:bg-green-400 text-white font-bold transition-all shadow-md hover:shadow-lg text-lg flex items-center justify-center gap-2">
                      Report a Suspected Disease
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
          {/* Farmer Card */}
          <Card className="bg-white dark:bg-slate-800/50 hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="mx-auto mb-6 w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/farmer-duck3.png"
                  alt="Farmer"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 font-serif">
                Farmer
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 min-h-12">
                Monitor your ducks with simple visual dashboard
              </p>
              <Link href="/login/farmer">
                <Button className="w-full bg-[#00a693] dark:bg-emerald-600 hover:opacity-90 text-white font-medium py-5 rounded-lg group">
                  Sign In as Farmer
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Veterinarian Card */}
          <Card className="bg-white dark:bg-slate-800/50 hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="mx-auto mb-6 w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/vet-duck5.jpeg"
                  alt="Veterinarian"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 font-serif">
                Veterinarian
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 min-h-12">
                Advanced health monitoring and disease detection
              </p>
              <Link href="/login/veterinarian">
                <Button className="w-full bg-[#334155] dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-medium py-5 rounded-lg group">
                  Sign In as Veterinarian
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#00a693] dark:text-emerald-500 hover:opacity-80 font-semibold hover:underline"
            >
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
