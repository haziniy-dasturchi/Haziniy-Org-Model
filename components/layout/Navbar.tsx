"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUserProfile, signOutUser } from "@/lib/auth";
import { Network, LogOut, ShieldCheck, LayoutDashboard, Lock } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  role: string;
  phone?: string;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      setLoading(true);
      try {
        const prof = await getCurrentUserProfile();
        if (prof && prof.role === "admin") {
          setProfile(prof);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    await signOutUser();
    setProfile(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-900/80 bg-brand-dark text-white shadow-md shadow-brand-dark/25">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 p-1.5 shadow-sm border border-white/20 transition-transform group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/haziniy-icon-white.png"
              alt="Haziniy Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-black tracking-wide text-white">
                HAZINIY
              </span>
              <span className="rounded bg-brand-accent/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-accent border border-brand-accent/40">
                ORG Model
              </span>
            </div>
            <span className="hidden sm:block text-[11px] text-emerald-100/80 font-medium">
              O&apos;quv markazi tashkiliy tuzilmasi
            </span>
          </div>
        </Link>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-emerald-950/60 border border-emerald-900" />
          ) : profile && profile.role === "admin" ? (
            /* Admin Logged-In State */
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-950/80 border border-brand-accent/40 px-3 py-1 text-xs text-emerald-100 font-medium shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-accent" />
                <span className="truncate max-w-[160px] font-semibold">
                  {profile.full_name || "Muhammad Said Hasan"}
                </span>
              </div>

              {pathname !== "/admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-accent px-3.5 py-1.5 text-xs font-bold text-brand-dark transition hover:bg-brand-accent-hover active:scale-95 shadow-sm"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-brand-dark" />
                  <span className="hidden sm:inline">Boshqaruv paneli</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                title="Tizimdan chiqish"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-900 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-100 transition hover:bg-rose-500/20 hover:text-rose-200 hover:border-rose-500/40 cursor-pointer active:scale-95"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Chiqish</span>
              </button>
            </div>
          ) : (
            /* Guest / Public State */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-accent/40 bg-brand-accent/15 px-3.5 py-1.5 text-xs font-bold text-brand-accent transition hover:bg-brand-accent hover:text-brand-dark active:scale-95 shadow-sm"
              >
                <Lock className="h-3 w-3" />
                <span>Admin</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
