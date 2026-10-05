"use client";

import React, { useState, useEffect } from "react";
import { Department, Position, Employee, Branch, isEmployeeInBranch, isDepartmentInBranch, isPositionInBranch } from "@/types";
import { InteractiveTreeCanvas } from "./InteractiveTreeCanvas";
import { MobileOrgAccordion } from "./MobileOrgAccordion";
import { Target, CheckCircle2, Info, Building2, ChevronDown } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/auth";

interface OrgChartProps {
  departments: (Department & {
    positions?: (Position & { employees?: Employee[] })[];
  })[];
  branches?: Branch[];
  isAdmin?: boolean;
}

export function OrgChart({ departments, branches = [], isAdmin = false }: OrgChartProps) {
  const [isAdminState, setIsAdminState] = useState(isAdmin);
  const [mode, setMode] = useState<"current" | "target">("current");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");

  useEffect(() => {
    setIsAdminState(isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("haziniy_selected_branch");
      if (saved) {
        setSelectedBranchId(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    getCurrentUserProfile()
      .then((prof) => {
        setIsAdminState(Boolean(prof && prof.role === "admin"));
      })
      .catch(() => {});
  }, []);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    try {
      localStorage.setItem("haziniy_selected_branch", branchId);
    } catch {}
  };

  // Regular userlar uchun har doim faqat "current" (hozirgi holat) ishlaydi
  const activeMode = isAdminState ? mode : "current";

  const isBranchFiltered = selectedBranchId !== "all";

  // Filter department positions' employees if a specific branch is selected
  // Positions are never hidden if assigned to this branch; if an employee doesn't belong to this branch,
  // the position remains visible with "Bu filialda hali band emas".
  const displayedDepartments = departments
    .filter((dept) => isDepartmentInBranch(dept, selectedBranchId))
    .map((dept) => ({
      ...dept,
      positions: (dept.positions || [])
        .filter((pos) => isPositionInBranch(pos, selectedBranchId))
        .map((pos) => {
          const allPosEmployees = pos.employees || [];
          const filteredEmployees = isBranchFiltered
            ? allPosEmployees.filter((emp) => isEmployeeInBranch(emp, selectedBranchId))
            : allPosEmployees;

          return {
            ...pos,
            // If it had employees in this branch, treat as active in org model so it stays visible
            status: filteredEmployees.length > 0 ? ("mavjud" as const) : pos.status,
            employees: filteredEmployees,
          };
        }),
    }));

  // Summary counts based on filtered view
  const allPositions = displayedDepartments.flatMap((d) => d.positions || []);
  const existingPositions = allPositions.filter(
    (p) => p.status === "mavjud" || (p.employees && p.employees.length > 0)
  );
  const plannedPositions = allPositions.filter(
    (p) => p.status === "rejalashtirilgan" && (!p.employees || p.employees.length === 0)
  );

  const totalEmployees = allPositions.reduce(
    (acc, p) => acc + (p.employees?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Prominent Mode Switcher & Branch Selector Header Card */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Buttons (Faqat adminga ko'rinadi, userga faqat Hozirgi holat ko'rinadi) */}
          {isAdminState ? (
            <div className="flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setMode("current")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeMode === "current"
                    ? "bg-white text-brand-dark shadow-sm scale-[1.02]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${
                    activeMode === "current" ? "text-brand-accent" : "text-slate-400"
                  }`}
                />
                Hozirgi holat
              </button>
              <button
                type="button"
                onClick={() => setMode("target")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeMode === "target"
                    ? "bg-white text-brand-dark shadow-sm scale-[1.02]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Target
                  className={`w-4 h-4 ${
                    activeMode === "target" ? "text-amber-500" : "text-slate-400"
                  }`}
                />
                Maqsad (Namuna)
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-50/90 border border-brand-accent/30 text-brand-dark text-xs sm:text-sm font-bold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-brand-accent" />
              <span>Tashkiliy Tuzilma (Hozirgi holat)</span>
            </div>
          )}

          {/* Dynamic Branch Selector Dropdown - BARCHA foydalanuvchilarga ko'rinadi */}
          <div className="relative flex items-center min-w-[210px] w-full sm:w-auto">
            <span className="absolute left-3.5 text-slate-500 pointer-events-none z-10">
              <Building2 className="w-4 h-4 text-emerald-700" />
            </span>
            <select
              id="branch-selector"
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

        {/* Dynamic Badge Metrics */}
        <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2.5 sm:gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent"></span>
            <span>
              Bo&apos;limlar: <strong className="text-slate-800">{displayedDepartments.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>
              Xodimlar: <strong className="text-slate-800">{totalEmployees}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-brand-accent/30 text-brand-dark font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent"></span>
            <span>
              Mavjud lavozimlar: <strong className="text-emerald-950">{existingPositions.length}</strong>
            </span>
          </div>

          {isAdminState && activeMode === "target" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>
                Rejalashtirilgan: <strong>{plannedPositions.length}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Target Mode Info Hint (Faqat adminga ko'rinadi) */}
      {isAdminState && activeMode === "target" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs sm:text-sm">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Maqsad (Namuna) rejimi faol:</strong> Tashkiliy tuzilmaning to&apos;liq namunaviy modeli. Chiziqli (dashed) va xira rangli kartalar kelgusida ochilishi rejalashtirilgan yangi vakansiyalardir.
          </span>
        </div>
      )}

      {/* 1. Desktop & Tablet View: Full Interactive Canvas (Pan, Zoom, Fullscreen, Tree Canvas) */}
      <div className="hidden md:block">
        <InteractiveTreeCanvas
          departments={displayedDepartments}
          mode={activeMode}
          selectedBranchId={selectedBranchId}
        />
      </div>

      {/* 2. Mobile View: Responsive Collapsible Accordion List */}
      <div className="block md:hidden bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm p-4 backdrop-blur-sm">
        <MobileOrgAccordion
          departments={displayedDepartments}
          mode={activeMode}
          selectedBranchId={selectedBranchId}
        />
      </div>
    </div>
  );
}
