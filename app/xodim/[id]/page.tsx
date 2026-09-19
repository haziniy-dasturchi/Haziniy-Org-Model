import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { EmployeeProfileView } from "@/components/employee/EmployeeProfileView";
import { getEmployeeById, getPositions, ensureStoreSyncedFromSupabase } from "@/lib/dataStore";
import { UserX, ArrowLeft } from "lucide-react";

interface PageProps {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

function checkIsAdmin(): boolean {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("haziniy_admin_session");
  if (!sessionCookie || !sessionCookie.value) return false;
  try {
    const session = JSON.parse(sessionCookie.value);
    return session.role === "admin";
  } catch {
    return false;
  }
}

export default async function EmployeePage({ params }: PageProps) {
  await ensureStoreSyncedFromSupabase();
  const isAdmin = checkIsAdmin();
  const employeeData = getEmployeeById(params.id);
  const allPositions = getPositions();

  // If employee not found, render custom beautiful 404 screen
  if (!employeeData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-brand-bg">
        <div className="max-w-md w-full text-center bg-white rounded-3xl border border-emerald-900/10 p-8 sm:p-10 shadow-lg space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-brand-accent">
            <UserX className="h-8 w-8 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
              404 — Xodim topilmadi
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-brand-dark">
              Bunday xodim mavjud emas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Siz qidirayotgan xodim profili o&apos;chirilgan yoki identifikator (ID) noto&apos;g&apos;ri kiritilgan bo&apos;lishi mumkin.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl bg-brand-dark hover:bg-[#002824] text-white text-xs font-bold shadow-md transition active:scale-95 border border-brand-accent/30"
            >
              <ArrowLeft className="w-4 h-4 text-brand-accent" />
              Bosh sahifaga qaytish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-bg via-[#f0f6f4] to-brand-bg pb-20">
      <EmployeeProfileView
        employee={employeeData as any}
        positions={allPositions}
        isAdmin={isAdmin}
      />
    </main>
  );
}
