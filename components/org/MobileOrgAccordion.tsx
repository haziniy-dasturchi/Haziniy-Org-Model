"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Layers, Award } from "lucide-react";
import { Department, Position, Employee } from "@/types";
import { OrgEmployeePill } from "./OrgEmployeePill";

interface MobileOrgAccordionProps {
  departments: (Department & {
    positions?: (Position & { employees?: Employee[] })[];
  })[];
  mode: "current" | "target";
}

const DEPARTMENT_COLORS: Record<string, string> = {
  Boshqaruv: "#0F172A",
  Moliya: "#B45309",
  Marketing: "#1D4ED8",
  Sotuv: "#C2410C",
  "O'quv": "#047857",
  "O‘quv": "#047857",
  Texnik: "#475569",
  HR: "#6D28D9",
  Yuridik: "#881337",
};

function getDeptColor(name: string, fallback?: string | null) {
  for (const key of Object.keys(DEPARTMENT_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return DEPARTMENT_COLORS[key];
    }
  }
  return fallback || "#2563eb";
}

export function MobileOrgAccordion({ departments, mode }: MobileOrgAccordionProps) {
  // Store open state for each department id (open all by default)
  const [openStates, setOpenStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    departments.forEach((d) => {
      initial[d.id] = true;
    });
    return initial;
  });

  const toggleDept = (id: string) => {
    setOpenStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-4 md:hidden">
      {departments.map((dept) => {
        const color = getDeptColor(dept.name, dept.color_hex);
        const isOpen = !!openStates[dept.id];

        // Filter positions by mode
        const positions = (dept.positions || []).filter((p) => {
          if (mode === "target") return true;
          return p.status === "mavjud" || (p.employees && p.employees.length > 0);
        });

        return (
          <div
            key={dept.id}
            className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all duration-200"
          >
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleDept(dept.id)}
              className="w-full flex items-center justify-between p-4 text-left select-none focus:outline-none"
              style={{ borderLeft: `5px solid ${color}` }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <h3 className="font-bold text-sm text-brand-dark truncate">
                  {dept.name} bo&apos;limi
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {positions.length} lavozim
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {/* Department YQM */}
            {isOpen && dept.yqm_text && (
              <div className="px-4 pb-3 pt-1 text-[11px] text-slate-600 bg-slate-50/70 border-t border-slate-100 flex items-start gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-slate-700">YQM: </strong>
                  {dept.yqm_text}
                </span>
              </div>
            )}

            {/* Accordion Content */}
            {isOpen && (
              <div className="p-4 space-y-3 bg-slate-50/40 border-t border-slate-100">
                {positions.length > 0 ? (
                  positions.map((pos) => {
                    const employees = pos.employees || [];
                    const isPlanned = pos.status === "rejalashtirilgan";

                    if (employees.length > 0) {
                      return (
                        <div key={pos.id} className="space-y-2">
                          {employees.map((emp) => (
                            <OrgEmployeePill
                              key={emp.id}
                              employee={emp}
                              position={pos}
                              color={color}
                              isPlanned={false}
                            />
                          ))}
                        </div>
                      );
                    }

                    return (
                      <OrgEmployeePill
                        key={pos.id}
                        position={pos}
                        color={color}
                        isPlanned={isPlanned}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Layers className="w-4 h-4 text-slate-300" />
                    Lavozimlar mavjud emas
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
