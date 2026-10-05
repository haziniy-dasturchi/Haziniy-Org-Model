"use client";

import React, { useState, useCallback, useEffect } from "react";
import { AdminSidebar, AdminTab } from "./AdminSidebar";
import { DepartmentsTab } from "./DepartmentsTab";
import { PositionsTab } from "./PositionsTab";
import { EmployeesTab } from "./EmployeesTab";
import { BranchesTab } from "./BranchesTab";
import { MissionTab } from "./MissionTab";
import { ShieldCheck, Building2, ChevronDown } from "lucide-react";
import { Department, Position, Employee, Branch, isEmployeeInBranch, isDepartmentInBranch, isPositionInBranch } from "@/types";

interface AdminDashboardClientProps {
  initialDepartments: Department[];
  initialPositions: (Position & { department?: Department })[];
  initialEmployees: (Employee & { position?: Position & { department?: Department }; branch?: Branch | null })[];
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
  const [positions, setPositions] = useState<(Position & { department?: Department })[]>(initialPositions);
  const [employees, setEmployees] = useState<(Employee & { position?: Position & { department?: Department }; branch?: Branch | null })[]>(initialEmployees);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [mission, setMission] = useState<string>(initialMission);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("haziniy_admin_selected_branch") || localStorage.getItem("haziniy_selected_branch");
      if (saved) {
        setSelectedBranchId(saved);
      }
    } catch {}
  }, []);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    try {
      localStorage.setItem("haziniy_admin_selected_branch", branchId);
      localStorage.setItem("haziniy_selected_branch", branchId);
    } catch {}
  };

  const displayedEmployees = selectedBranchId === "all"
    ? employees
    : employees.filter((emp) => isEmployeeInBranch(emp, selectedBranchId));

  const displayedDepartments = selectedBranchId === "all"
    ? departments
    : departments.filter((d) => isDepartmentInBranch(d, selectedBranchId));

  const displayedPositions = selectedBranchId === "all"
    ? positions
    : positions.filter((p) => isPositionInBranch(p, selectedBranchId));

  // 1. Immediate optimistic state updates
  const handlePositionSaved = useCallback((savedPos: Position) => {
    setPositions((prev) => {
      const dept = departments.find((d) => d.id === savedPos.department_id);
      const enriched = { ...savedPos, department: dept };
      const exists = prev.some((p) => p.id === savedPos.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPos.id ? enriched : p));
      }
      return [...prev, enriched];
    });
  }, [departments]);

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
      const branch = branches.find((b) => b.id === savedEmp.branch_id) || null;
      const enriched = { ...savedEmp, position: pos, branch };
      const exists = prev.some((e) => e.id === savedEmp.id);
      if (exists) {
        return prev.map((e) => (e.id === savedEmp.id ? enriched : e));
      }
      return [...prev, enriched];
    });
  }, [positions, branches]);

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

            {/* Global Branch Selector Dropdown */}
            <div className="relative flex items-center min-w-[240px] w-full sm:w-auto">
              <span className="absolute left-3.5 text-slate-500 pointer-events-none z-10">
                <Building2 className="w-4 h-4 text-emerald-700" />
              </span>
              <select
                id="admin-branch-selector"
                value={selectedBranchId}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold rounded-2xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition appearance-none cursor-pointer shadow-2xs"
              >
                <option value="all">Umumiy (Barcha filiallar)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
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
                departments: displayedDepartments.length,
                positions: displayedPositions.length,
                employees: displayedEmployees.length,
                branches: branches.length,
              }}
            />
          </div>

          {/* Right Main Content Tabs */}
          <div className="lg:col-span-3">
            {activeTab === "departments" && (
              <DepartmentsTab
                departments={departments}
                branches={branches}
                selectedBranchId={selectedBranchId}
                onBranchChange={handleBranchChange}
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
                selectedBranchId={selectedBranchId}
                onBranchChange={handleBranchChange}
                onRefresh={refreshAll}
                onPositionSaved={handlePositionSaved}
                onPositionDeleted={handlePositionDeleted}
              />
            )}

            {activeTab === "employees" && (
              <EmployeesTab
                employees={employees}
                positions={positions}
                branches={branches}
                selectedBranchId={selectedBranchId}
                onBranchChange={handleBranchChange}
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
