"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Layers, HelpCircle } from "lucide-react";
import { Department, Position, Employee } from "@/types";
import { PositionCard } from "./PositionCard";

interface DepartmentColumnProps {
  department: Department & {
    positions?: (Position & { employees?: Employee[] })[];
  };
  mode: "current" | "target";
}

export function DepartmentColumn({ department, mode }: DepartmentColumnProps) {
  // Mobile accordion state (default open)
  const [isOpenMobile, setIsOpenMobile] = useState(true);

  const allPositions = department.positions || [];
  
  // Filter positions based on mode
  const displayedPositions = allPositions.filter((pos) => {
    if (mode === "target") return true;
    // In current mode, show if status is 'mavjud' or if there are active employees
    return pos.status === "mavjud" || (pos.employees && pos.employees.length > 0);
  });

  const color = department.color_hex || "#3b82f6";

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Department Header */}
      <div
        className="p-4 border-b border-slate-100 relative cursor-pointer sm:cursor-default select-none"
        style={{ borderTop: `4px solid ${color}` }}
        onClick={() => setIsOpenMobile(!isOpenMobile)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-sm font-bold text-brand-dark truncate">
              {department.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {displayedPositions.length}
            </span>
            {/* Mobile Accordion Toggle */}
            <button
              type="button"
              className="sm:hidden p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label="Bo'limni ochish/yopish"
            >
              {isOpenMobile ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Department YQM */}
        {department.yqm_text && (
          <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100/80 leading-snug">
            <span className="font-semibold text-slate-700">YQM: </span>
            {department.yqm_text}
          </div>
        )}
      </div>

      {/* Positions List */}
      <div
        className={`${
          isOpenMobile ? "flex" : "hidden"
        } sm:flex flex-col flex-1 p-3 gap-3 bg-slate-50/30 overflow-y-auto min-h-[150px]`}
      >
        {displayedPositions.length > 0 ? (
          displayedPositions.map((pos) => (
            <PositionCard key={pos.id} position={pos} mode={mode} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 flex-1">
            <Layers className="w-8 h-8 stroke-1 text-slate-300 mb-1.5" />
            <p className="text-xs">Lavozimlar mavjud emas</p>
          </div>
        )}
      </div>
    </div>
  );
}
