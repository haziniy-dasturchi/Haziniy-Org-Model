"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithPhone } from "@/lib/auth";
import { Lock, Phone, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";
  const errorParam = searchParams.get("error");

  const [phone, setPhone] = useState("+998889692313");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === "unauthorized" ? "Sizda admin huquqi mavjud emas." : null
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, "");
    if (!digits) {
      setPhone("+998");
      return;
    }
    setPhone(rawValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 9) {
      setErrorMessage("Iltimos, to'liq telefon raqamini kiriting.");
      return;
    }

    if (!password) {
      setErrorMessage("Iltimos, parolingizni kiriting.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signInWithPhone(phone, password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Telefon raqam yoki parol noto'g'ri kiritildi.");
        } else {
          setErrorMessage(error.message || "Tizimga kirishda xatolik yuz berdi.");
        }
        setLoading(false);
        return;
      }

      if (data) {
        router.push(redirectPath);
        router.refresh();
      }
    } catch {
      setErrorMessage("Kutilmagan xatolik yuz berdi. Qayta urinib ko'ring.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-dark mb-6 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Bosh sahifaga qaytish</span>
      </Link>

      {/* Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-dark p-2 text-white shadow-lg shadow-brand-dark/20 border border-emerald-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/haziniy-icon-white.png"
              alt="Haziniy Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="font-serif text-2xl font-black tracking-tight text-brand-dark">
            HAZINIY <span className="font-sans text-brand-accent font-extrabold text-xl">ORG Model</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1 font-medium">
            Administrator boshqaruv paneli
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Telefon raqam
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 88 969 23 13"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-brand-dark placeholder-slate-400 transition focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Parol
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-11 py-2.5 text-sm text-brand-dark placeholder-slate-400 transition focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-dark py-3 px-4 text-sm font-semibold text-white shadow-md shadow-brand-dark/20 transition hover:bg-emerald-950 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              <span>Kirish</span>
            )}
          </button>
        </form>

        {/* Helper info */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Oddiy foydalanuvchilar uchun login talab qilinmaydi &bull; Ochiq ko&apos;rish rejimi
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-brand-bg via-slate-50 to-slate-100">
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse bg-white/80 rounded-3xl border border-slate-200" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
