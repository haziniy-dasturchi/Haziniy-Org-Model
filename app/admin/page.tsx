import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { ToastProvider } from "@/components/admin/ToastContext";
import {
  getDepartments,
  getPositions,
  getEmployees,
  getBranches,
  getMission,
} from "@/lib/dataStore";

export const dynamic = "force-dynamic";

function checkAdmin() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("haziniy_admin_session");
  if (!sessionCookie?.value) return false;
  try {
    const session = JSON.parse(sessionCookie.value);
    return session.role === "admin";
  } catch {
    return false;
  }
}

export default async function AdminPage() {
  if (!checkAdmin()) {
    redirect("/login?redirect=/admin");
  }

  const departments = getDepartments();
  const positions = getPositions();
  const employees = getEmployees();
  const branches = getBranches();
  const mission = getMission();

  return (
    <ToastProvider>
      <AdminDashboardClient
        initialDepartments={departments}
        initialPositions={positions}
        initialEmployees={employees}
        initialBranches={branches}
        initialMission={mission}
      />
    </ToastProvider>
  );
}

