"use client";

import React from "react";
import { Briefcase, FileText } from "lucide-react";
import { Position, Employee } from "@/types";
import { EmployeeCard } from "./EmployeeCard";

interface PositionCardProps {
  position: Position & { employees?: Employee[] };
  mode: "current" | "target";
}

export function PositionCard({ position, mode }: PositionCardProps) {
  const isPlanned = position.status === "rejalashtirilgan";
  const employees = position.employees || [];

  return (
    <div
      className={`rounded-xl p-3.5 transition-all duration-200 ${
        isPlanned
          ? "border-2 border-dashed border-amber-300/80 bg-amber-50/40"
          : "border border-slate-200/90 bg-slate-50/50 shadow-2xs"
      }`}
    >
      {/* Position Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Briefcase
            className={`w-3.5 h-3.5 flex-shrink-0 ${
              isPlanned ? "text-amber-500" : "text-brand-accent"
            }`}
          />
          <h4
            className={`text-xs font-bold truncate ${
              isPlanned ? "text-amber-900" : "text-brand-dark"
            }`}
          >
            {position.title}
          </h4>
        </div>
        {isPlanned && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
            Rejalashtirilgan
          </span>
        )}
      </div>

      {/* Position YQM (Yakuniy Qimmatli Mahsulot) */}
      {position.yqm_text && (
        <div className="mb-2.5 px-2 py-1 rounded bg-white/70 border border-slate-100 text-[11px] text-slate-600 flex items-start gap-1">
          <FileText className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
          <span className="leading-tight line-clamp-2" title={position.yqm_text}>
            <strong className="text-slate-700">YQM:</strong> {position.yqm_text}
          </span>
        </div>
      )}

      {/* Employees or Vacancy Slot */}
      <div className="space-y-2 mt-2">
        {employees.length > 0 ? (
          employees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              position={position}
              isPlanned={false}
            />
          ))
        ) : (
          <EmployeeCard
            position={position}
            isPlanned={isPlanned || mode === "target"}
          />
        )}
      </div>
    </div>
  );
}
