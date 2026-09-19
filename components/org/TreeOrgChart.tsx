"use client";

import React from "react";
import { Department, Position, Employee } from "@/types";
import { OrgEmployeePill } from "./OrgEmployeePill";
import { Crown, Briefcase, FileText, Layers } from "lucide-react";

interface TreeOrgChartProps {
  departments: (Department & {
    positions?: (Position & { employees?: Employee[] })[];
  })[];
  mode: "current" | "target";
}

// Brand Colors for each Department
const DEPARTMENT_COLORS: Record<string, { bg: string; text: string; lightBg: string; border: string; gradient: string }> = {
  Moliya: { bg: "#EAB308", text: "#ffffff", lightBg: "#FEF08A", border: "#CA8A04", gradient: "from-amber-500 to-yellow-600" },
  Marketing: { bg: "#2563EB", text: "#ffffff", lightBg: "#BFDBFE", border: "#1D4ED8", gradient: "from-blue-600 to-indigo-600" },
  Sotuv: { bg: "#EA580C", text: "#ffffff", lightBg: "#FED7AA", border: "#C2410C", gradient: "from-orange-500 to-amber-600" },
  "O'quv": { bg: "#059669", text: "#ffffff", lightBg: "#A7F3D0", border: "#047857", gradient: "from-emerald-600 to-teal-600" },
  "O‘quv": { bg: "#059669", text: "#ffffff", lightBg: "#A7F3D0", border: "#047857", gradient: "from-emerald-600 to-teal-600" },
  Oquv: { bg: "#059669", text: "#ffffff", lightBg: "#A7F3D0", border: "#047857", gradient: "from-emerald-600 to-teal-600" },
  HR: { bg: "#7C3AED", text: "#ffffff", lightBg: "#DDD6FE", border: "#6D28D9", gradient: "from-purple-600 to-violet-600" },
  Texnik: { bg: "#C2410C", text: "#ffffff", lightBg: "#FED7AA", border: "#9A3412", gradient: "from-amber-700 to-orange-800" },
  Yuridik: { bg: "#991B1B", text: "#ffffff", lightBg: "#FECACA", border: "#7F1D1D", gradient: "from-rose-700 to-red-800" },
  Boshqaruv: { bg: "#1E293B", text: "#ffffff", lightBg: "#CBD5E1", border: "#0F172A", gradient: "from-slate-800 to-slate-900" },
};

function getDeptColor(name: string, fallbackHex?: string | null) {
  for (const key of Object.keys(DEPARTMENT_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return DEPARTMENT_COLORS[key];
    }
  }
  const hex = fallbackHex || "#2563EB";
  return { bg: hex, text: "#ffffff", lightBg: "#E2E8F0", border: hex, gradient: "from-blue-600 to-indigo-600" };
}

// Canonical order of 7 departments from Google Sheets
const DEPT_ORDER = ["Moliya", "Marketing", "Sotuv", "O'quv", "HR", "Texnik", "Yuridik"];

export function TreeOrgChart({ departments, mode }: TreeOrgChartProps) {
  // 1. Find Boshqaruv (Top Management Department)
  const boshqaruvDept = departments.find(
    (d) => d.name.toLowerCase().includes("boshqaruv") || d.name.toLowerCase().includes("asoschi")
  );

  // 2. Sort 7 branch departments in canonical order
  const branchDepartments = departments
    .filter((d) => d !== boshqaruvDept)
    .sort((a, b) => {
      const idxA = DEPT_ORDER.findIndex((name) => a.name.toLowerCase().includes(name.toLowerCase()));
      const idxB = DEPT_ORDER.findIndex((name) => b.name.toLowerCase().includes(name.toLowerCase()));
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

  // Positions for Boshqaruv
  const allBoshqaruvPositions = boshqaruvDept?.positions || [];

  // Top Position 1: ASOSCHI
  const asoschiPos: Position & { employees?: Employee[] } = allBoshqaruvPositions.find((p) =>
    p.title.toUpperCase().includes("ASOSCHI")
  ) || {
    id: "pos-asoschi-default",
    department_id: boshqaruvDept?.id || "dept-boshqaruv",
    title: "ASOSCHI",
    yqm_text: "Korxona strategiyasi, missiyasi va yuksalishi",
    status: "mavjud",
    sort_order: 1,
    created_at: "",
    employees: allBoshqaruvPositions[0]?.employees || [],
  };

  // Top Position 2: MENEJER / DIREKTOR
  const menejerPos: Position & { employees?: Employee[] } = allBoshqaruvPositions.find((p) =>
    p.title.toUpperCase().includes("MENEJER") || p.title.toUpperCase().includes("DIREKTOR")
  ) || {
    id: "pos-menejer-default",
    department_id: boshqaruvDept?.id || "dept-boshqaruv",
    title: mode === "target" ? "DIREKTOR" : "MENEJER",
    yqm_text: "Operatsion boshqaruv va barcha bo'limlar integratsiyasi",
    status: "mavjud",
    sort_order: 2,
    created_at: "",
    employees: allBoshqaruvPositions.length > 1 ? (allBoshqaruvPositions[1]?.employees || []) : [],
  };

  return (
    <div className="w-full select-none">
      <div className="w-full flex flex-col items-center">
        
        {/* ================= TIER 1: ASOSCHI (HEADER NODE) ================= */}
        <div className="relative z-30 flex flex-col items-center">
          <div className="group relative flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md border border-slate-700/80 hover:shadow-lg transition-all">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase">
                  {asoschiPos.title}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Mavjud
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium">
                {asoschiPos.employees && asoschiPos.employees.length > 0
                  ? asoschiPos.employees[0].full_name
                  : "Hali band emas"}
              </p>
            </div>

            {asoschiPos.yqm_text && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-3 rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-40 border border-slate-700">
                <strong>YQM:</strong> {asoschiPos.yqm_text}
              </div>
            )}
          </div>
        </div>

        {/* ================= CONNECTOR BLOCK & MENEJER TIER ================= */}
        <div className="w-full h-[110px] relative my-0.5">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 700 110">
            {/* 1. Vertical stem from ASOSCHI down to MENEJER (X=350, Y=0 to 40) */}
            <line x1="350" y1="0" x2="350" y2="40" stroke="#94A3B8" strokeWidth="2" />

            {/* 2. ASOSCHI DIRECT GOVERNANCE BRANCH (Top horizontal bar at Y=16) */}
            {/* Left to Moliya (Col 0 center = 50), Right to Yuridik (Col 6 center = 650) */}
            <path
              d="M 50 110 L 50 16 L 650 16 L 650 110"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
            />

            {/* Small connector dots on Asoschi branch */}
            <circle cx="50" cy="16" r="3" fill="#64748B" />
            <circle cx="650" cy="16" r="3" fill="#64748B" />
            <circle cx="350" cy="16" r="3" fill="#64748B" />

            {/* 3. Vertical stem from MENEJER down to Operational branch (X=350, Y=70 to 86) */}
            <line x1="350" y1="70" x2="350" y2="86" stroke="#64748B" strokeWidth="2" />

            {/* 4. MENEJER OPERATIONAL BRANCH (Lower horizontal bar at Y=86) */}
            {/* Spans from Moliya (X=50) to Texnik (X=550) - NOT reaching Yuridik! */}
            <path
              d="M 50 86 L 550 86"
              fill="none"
              stroke="#64748B"
              strokeWidth="2"
            />

            {/* Vertical drops from Menejer horizontal bar (Y=86 to 110) to operational departments */}
            {/* Col 0: Moliya (50), Col 1: Marketing (150), Col 2: Sotuv (250), Col 3: O'quv (350), Col 4: HR (450), Col 5: Texnik (550) */}
            <line x1="150" y1="86" x2="150" y2="110" stroke="#64748B" strokeWidth="2" />
            <line x1="250" y1="86" x2="250" y2="110" stroke="#64748B" strokeWidth="2" />
            <line x1="350" y1="86" x2="350" y2="110" stroke="#64748B" strokeWidth="2" />
            <line x1="450" y1="86" x2="450" y2="110" stroke="#64748B" strokeWidth="2" />
            <line x1="550" y1="86" x2="550" y2="110" stroke="#64748B" strokeWidth="2" />

            {/* Connector dots */}
            <circle cx="150" cy="86" r="2.5" fill="#475569" />
            <circle cx="250" cy="86" r="2.5" fill="#475569" />
            <circle cx="350" cy="86" r="2.5" fill="#475569" />
            <circle cx="450" cy="86" r="2.5" fill="#475569" />
            <circle cx="550" cy="86" r="2.5" fill="#475569" />
          </svg>

          {/* MENEJER (DIREKTOR) NODE (Centered at Y=30 to 70 inside connector area) */}
          <div className="absolute top-[28px] left-1/2 -translate-x-1/2 z-20">
            <div className="group relative flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-md border border-slate-600/80 hover:shadow-lg transition-all">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-400/20 border border-blue-400/40 text-blue-300">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-wider uppercase">
                    {menejerPos.title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Mavjud
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">
                  {menejerPos.employees && menejerPos.employees.length > 0
                    ? menejerPos.employees[0].full_name
                    : "Hali band emas"}
                </p>
              </div>

              {menejerPos.yqm_text && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-3 rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-40 border border-slate-700">
                  <strong>YQM:</strong> {menejerPos.yqm_text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= 7 DEPARTMENTS GRID (AUTO-FITS 100% WIDTH) ================= */}
        <div className="w-full grid grid-cols-7 gap-2 lg:gap-2.5 xl:gap-3.5 items-stretch pt-0">
          {branchDepartments.map((dept) => {
            const deptColor = getDeptColor(dept.name, dept.color_hex);
            
            // Filter positions by mode
            const positions = (dept.positions || []).filter((p) => {
              if (mode === "target") return true;
              return p.status === "mavjud";
            });

            return (
              <div
                key={dept.id}
                className="flex flex-col justify-between rounded-2xl bg-slate-50/70 border border-slate-200/90 p-2 sm:p-2.5 shadow-2xs transition-all duration-200 hover:bg-white hover:shadow-md hover:border-slate-300"
              >
                {/* Top: Department Header & Positions List */}
                <div className="w-full flex flex-col space-y-2.5">
                  {/* Department Header Badge */}
                  <div
                    className={`w-full py-2 px-2.5 rounded-xl bg-gradient-to-r ${deptColor.gradient} text-white shadow-2xs text-center transition-transform hover:scale-[1.02] cursor-default`}
                  >
                    <h3 className="text-xs font-black uppercase tracking-wide truncate">
                      {dept.name}
                    </h3>
                  </div>

                  {/* Positions List */}
                  <div className="w-full flex flex-col space-y-2">
                    {positions.length > 0 ? (
                      positions.map((pos) => {
                        const employees = pos.employees || [];
                        const isPlanned = pos.status === "rejalashtirilgan";

                        // If position has real employees assigned
                        if (employees.length > 0) {
                          return (
                            <div key={pos.id} className="w-full space-y-1.5">
                              {employees.map((emp) => (
                                <OrgEmployeePill
                                  key={emp.id}
                                  employee={emp}
                                  position={pos}
                                  color={deptColor.bg}
                                  isPlanned={false}
                                />
                              ))}
                            </div>
                          );
                        }

                        // Vacant Position: "Hali band emas"
                        return (
                          <OrgEmployeePill
                            key={pos.id}
                            position={pos}
                            color={deptColor.bg}
                            isPlanned={isPlanned}
                          />
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-[10px] text-slate-400 italic">
                        Mavjud lavozimlar yo&apos;q
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom: Department Core YQM Box (Sheets style) */}
                {dept.yqm_text && (
                  <div className="w-full mt-4 pt-2 border-t border-slate-200/60">
                    <div
                      className="w-full p-2 rounded-xl text-[9px] sm:text-[10px] font-extrabold uppercase text-center leading-snug shadow-2xs text-white"
                      style={{ backgroundColor: deptColor.bg }}
                      title={dept.yqm_text}
                    >
                      {dept.yqm_text}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
