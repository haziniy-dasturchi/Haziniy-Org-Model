"use client";

import React, { useState } from "react";
import { Department, Position, Employee } from "@/types";
import { InteractiveTreeCanvas } from "./InteractiveTreeCanvas";
import { MobileOrgAccordion } from "./MobileOrgAccordion";
import { Target, CheckCircle2, Info, Sparkles } from "lucide-react";

interface OrgChartProps {
  departments: (Department & {
    positions?: (Position & { employees?: Employee[] })[];
  })[];
}

export function OrgChart({ departments }: OrgChartProps) {
  const [mode, setMode] = useState<"current" | "target">("current");

  // Summary counts
  const allPositions = departments.flatMap((d) => d.positions || []);
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
      {/* Prominent Mode Switcher Header Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        {/* Toggle Buttons */}
        <div className="flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMode("current")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              mode === "current"
                ? "bg-white text-brand-dark shadow-sm scale-[1.02]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${
                mode === "current" ? "text-brand-accent" : "text-slate-400"
              }`}
            />
            Hozirgi holat
          </button>
          <button
            type="button"
            onClick={() => setMode("target")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              mode === "target"
                ? "bg-white text-brand-dark shadow-sm scale-[1.02]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Target
              className={`w-4 h-4 ${
                mode === "target" ? "text-amber-500" : "text-slate-400"
              }`}
            />
            Maqsad (Namuna)
          </button>
        </div>

        {/* Dynamic Badge Metrics */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent"></span>
            <span>
              Bo&apos;limlar: <strong className="text-slate-800">{departments.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>
              Xodimlar: <strong className="text-slate-800">{totalEmployees}</strong>
            </span>
          </div>

          {mode === "current" ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-brand-accent/30 text-brand-dark font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-accent"></span>
              <span>
                Mavjud lavozimlar: <strong className="text-emerald-950">{existingPositions.length}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>
                Rejalashtirilgan: <strong>{plannedPositions.length}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Target Mode Info Hint */}
      {mode === "target" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs sm:text-sm">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Maqsad (Namuna) rejimi faol:</strong> Tashkiliy tuzilmaning to&apos;liq namunaviy modeli. Chiziqli (dashed) va xira rangli kartalar kelgusida ochilishi rejalashtirilgan yangi vakansiyalardir.
          </span>
        </div>
      )}

      {/* 1. Desktop & Tablet View: Full Interactive Canvas (Pan, Zoom, Fullscreen, Tree Canvas) */}
      <div className="hidden md:block">
        <InteractiveTreeCanvas departments={departments} mode={mode} />
      </div>

      {/* 2. Mobile View: Responsive Collapsible Accordion List */}
      <div className="block md:hidden bg-white/95 rounded-3xl border border-slate-200/90 shadow-sm p-4 backdrop-blur-sm">
        <MobileOrgAccordion departments={departments} mode={mode} />
      </div>
    </div>
  );
}
