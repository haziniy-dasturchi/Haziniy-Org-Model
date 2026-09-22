"use client";

import React from "react";
import Link from "next/link";
import { Plus, User, Award, CheckCircle2, Clock } from "lucide-react";
import { Employee, Position, isTeachingOrSupportRole } from "@/types";

interface OrgEmployeePillProps {
  employee?: Employee;
  position: Position;
  color?: string;
  isPlanned?: boolean;
}

function getInitials(name: string): string {
  if (!name) return "X";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function OrgEmployeePill({
  employee,
  position,
  color = "#1D4ED8",
  isPlanned,
}: OrgEmployeePillProps) {
  const isPlannedStatus = isPlanned || position.status === "rejalashtirilgan";

  // Reusable Tooltip component for hover state
  const renderTooltip = () => {
    if (!position.yqm_text) return null;

    return (
      <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 w-64 sm:w-72 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700/90 text-left scale-95 group-hover:scale-100 origin-bottom">
        {/* Header with icon and status */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 break-words">
              {position.title}
            </span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 ${
              isPlannedStatus
                ? "bg-amber-950/80 text-amber-300 border border-amber-800/80"
                : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
            }`}
          >
            {isPlannedStatus ? "Rejalashtirilgan" : "Mavjud"}
          </span>
        </div>

        {/* YQM Text */}
        <div className="text-[11px] leading-relaxed text-slate-200 font-normal">
          <span className="font-bold text-white block text-[10px] uppercase text-slate-400 mb-0.5">
            Yakuniy Qiymatli Mahsulot:
          </span>
          <p className="whitespace-pre-line text-slate-100">
            {position.yqm_text}
          </p>
        </div>

        {/* Assigned employee note */}
        {employee && (
          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="break-words">Xodim: <strong className="text-white">{employee.full_name}</strong></span>
            <span className="text-brand-accent font-semibold flex-shrink-0 ml-1">Batafsil &rarr;</span>
          </div>
        )}

        {/* Arrow pointer pointing down */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95" />
      </div>
    );
  };

  // Case 1: Rejalashtirilgan (Planned vacancy) in target mode
  if (isPlannedStatus) {
    return (
      <div className="group relative flex items-center w-full min-w-0 rounded-xl border border-dashed border-amber-300/90 bg-amber-50/60 p-2 sm:p-2.5 text-amber-900 shadow-2xs transition-all hover:border-amber-400 hover:bg-amber-100/50 cursor-help select-none">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-amber-400 bg-white text-amber-600 shadow-2xs">
          <Plus className="h-3.5 w-3.5" />
        </div>
        <div className="ml-2 min-w-0 flex-1 text-left">
          <p className="text-[11px] font-bold text-amber-950 leading-snug break-words">
            {position.title}
          </p>
          <span className="inline-block text-[9px] font-semibold text-amber-700/90 uppercase tracking-wider">
            Vakansiya
          </span>
        </div>

        {/* Hover YQM Tooltip */}
        {renderTooltip()}
      </div>
    );
  }

  // Case 2: Mavjud position without an assigned employee (Vacant existing position)
  if (!employee) {
    return (
      <div className="group relative flex items-center w-full min-w-0 rounded-xl border border-slate-200/90 bg-white p-2 text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50/80 cursor-help select-none">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400">
          <User className="h-3.5 w-3.5 stroke-[1.75]" />
        </div>
        <div className="ml-2 min-w-0 flex-1 text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-snug break-words">
            {position.title}
          </p>
          <p className="text-[11px] font-semibold text-slate-700 leading-snug mt-0.5 break-words">
            Hali band emas
          </p>
        </div>

        {/* Hover YQM Tooltip */}
        {renderTooltip()}
      </div>
    );
  }

  // Case 3: Assigned employee (Clickable to employee profile)
  return (
    <div className="group relative w-full">
      <Link
        href={`/xodim/${employee.id}`}
        className="flex items-center w-full min-w-0 rounded-xl p-2 shadow-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer"
        style={{
          backgroundColor: color,
          boxShadow: `0 3px 10px -2px ${color}40`,
        }}
      >
        {/* Avatar Circle */}
        <div className="relative flex-shrink-0">
          {employee.photo_url ? (
            <img
              src={employee.photo_url}
              alt={employee.full_name}
              className="h-8 w-8 rounded-full object-cover border border-white/60 shadow-2xs"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm border border-white/50 text-white text-[10px] font-black shadow-2xs">
              {getInitials(employee.full_name)}
            </div>
          )}
        </div>

        {/* Info labels (Fani yoki lavozimi va to'liq ism) */}
        <div className="ml-2 min-w-0 flex-1 text-left text-white">
          <p className="text-[9.5px] font-bold text-white/80 uppercase tracking-wider leading-tight break-words">
            {isTeachingOrSupportRole(position.title) && employee.subject ? employee.subject : position.title}
          </p>
          <p className="text-[11.5px] font-bold text-white leading-tight mt-0.5 break-words">
            {employee.full_name}
          </p>
        </div>
      </Link>

      {/* Hover YQM Tooltip */}
      {renderTooltip()}
    </div>
  );
}
