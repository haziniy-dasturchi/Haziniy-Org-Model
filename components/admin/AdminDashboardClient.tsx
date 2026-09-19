"use client";

import React, { useState, useCallback } from "react";
import { AdminSidebar, AdminTab } from "./AdminSidebar";
import { DepartmentsTab } from "./DepartmentsTab";
import { PositionsTab } from "./PositionsTab";
import { EmployeesTab } from "./EmployeesTab";
import { BranchesTab } from "./BranchesTab";
import { MissionTab } from "./MissionTab";
import { ShieldCheck } from "lucide-react";
import { Department, Position, Employee, Branch } from "@/types";

interface AdminDashboardClientProps {
  initialDepartments: Department[];
  initialPositions: (Position & { department?: Department; branch?: Branch | null })[];
  initialEmployees: (Employee & { position?: Position & { department?: Department } })[];
  initialBranches?: Branch[];
  initialMission: string;
}

export function AdminDashboardClient({
  initialDepartments,
  initialPositions,
  initialEmployees,
  initialBranches = [],
  initialMission,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("departments");

  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [positions, setPositions] = useState<(Position & { department?: Department; branch?: Branch | null })[]>(initialPositions);
  const [employees, setEmployees] = useState<(Employee & { position?: Position & { department?: Department } })[]>(initialEmployees);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [mission, setMission] = useState<string>(initialMission);

  // 1. Immediate optimistic state updates
  const handlePositionSaved = useCallback((savedPos: Position) => {
    setPositions((prev) => {
      const dept = departments.find((d) => d.id === savedPos.department_id);
      const branch = branches.find((b) => b.id === savedPos.branch_id) || null;
      const enriched = { ...savedPos, department: dept, branch };
      const exists = prev.some((p) => p.id === savedPos.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPos.id ? enriched : p));
      }
      return [...prev, enriched];
    });
  }, [departments, branches]);

  const handlePositionDeleted = useCallback((id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleDepartmentSaved = useCallback((savedDept: Department) => {
    setDepartments((prev) => {
      const exists = prev.some((d) => d.id === savedDept.id);
      if (exists) {
        return prev.map((d) => (d.id === savedDept.id ? savedDept : d));
      }
      return [...prev, savedDept];
    });
  }, []);

  const handleDepartmentDeleted = useCallback((id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleEmployeeSaved = useCallback((savedEmp: Employee) => {
    setEmployees((prev) => {
      const pos = positions.find((p) => p.id === savedEmp.position_id);
      const enriched = { ...savedEmp, position: pos };
      const exists = prev.some((e) => e.id === savedEmp.id);
      if (exists) {
        return prev.map((e) => (e.id === savedEmp.id ? enriched : e));
      }
      return [...prev, enriched];
    });
  }, [positions]);

  const handleEmployeeDeleted = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleBranchSaved = useCallback((savedBranch: Branch) => {
    setBranches((prev) => {
      const exists = prev.some((b) => b.id === savedBranch.id);
      if (exists) {
        return prev.map((b) => (b.id === savedBranch.id ? savedBranch : b));
      }
      return [...prev, savedBranch];
    });
  }, []);

  const handleBranchDeleted = useCallback((id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleMissionSaved = useCallback((newMission: string) => {
    setMission(newMission);
  }, []);

  // 2. Anti-cache fetch all
  const refreshAll = useCallback(async () => {
    try {
      const t = Date.now();
      const headers = { "Cache-Control": "no-cache", "Pragma": "no-cache" };
      const [deptRes, posRes, empRes, branchRes, misRes] = await Promise.all([
        fetch(`/api/departments?_t=${t}`, { cache: "no-store", headers }).then((r) => r.json()),
        fetch(`/api/positions?_t=${t}`, { cache: "no-store", headers }).then((r) => r.json()),
        fetch(`/api/employees?_t=${t}`, { cache: "no-store", headers }).then((r) => r.json()),
        fetch(`/api/branches?_t=${t}`, { cache: "no-store", headers }).then((r) => r.json()),
        fetch(`/api/settings/mission?_t=${t}`, { cache: "no-store", headers }).then((r) => r.json()),
      ]);

      if (deptRes && Array.isArray(deptRes.departments)) setDepartments(deptRes.departments);
      if (posRes && Array.isArray(posRes.positions)) setPositions(posRes.positions);
      if (empRes && Array.isArray(empRes.employees)) setEmployees(empRes.employees);
      if (branchRes && Array.isArray(branchRes.branches)) setBranches(branchRes.branches);
      if (misRes && misRes.mission) setMission(misRes.mission);
    } catch (err) {
      console.error("Failed to refresh admin data:", err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-bg via-slate-50 to-slate-100/70 pb-20">
      {/* Header Banner */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-accent/10 text-brand-dark border border-brand-accent/20">
              <ShieldCheck className="w-6 h-6 text-brand-dark" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  Admin boshqaruv paneli
                </span>
                <span className="px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-dark text-[10px] font-bold">
                  Faol Sessiya
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
                Haziniy ORG Boshqaruv Markazi
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <AdminSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{
                departments: departments.length,
                positions: positions.length,
                employees: employees.length,
                branches: branches.length,
              }}
            />
          </div>

          {/* Right Main Content Tabs */}
          <div className="lg:col-span-3">
            {activeTab === "departments" && (
              <DepartmentsTab
                departments={departments}
                onRefresh={refreshAll}
                onDepartmentSaved={handleDepartmentSaved}
                onDepartmentDeleted={handleDepartmentDeleted}
              />
            )}

            {activeTab === "positions" && (
              <PositionsTab
                positions={positions}
                departments={departments}
                branches={branches}
                onRefresh={refreshAll}
                onPositionSaved={handlePositionSaved}
                onPositionDeleted={handlePositionDeleted}
              />
            )}

            {activeTab === "employees" && (
              <EmployeesTab
                employees={employees}
                positions={positions}
                onRefresh={refreshAll}
                onEmployeeSaved={handleEmployeeSaved}
                onEmployeeDeleted={handleEmployeeDeleted}
              />
            )}

            {activeTab === "branches" && (
              <BranchesTab
                branches={branches}
                onRefresh={refreshAll}
                onBranchSaved={handleBranchSaved}
                onBranchDeleted={handleBranchDeleted}
              />
            )}

            {activeTab === "mission" && (
              <MissionTab
                initialMission={mission}
                onMissionSaved={handleMissionSaved}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
