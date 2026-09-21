"use client";

import React, { useState } from "react";
import { Users, ChevronDown, Award } from "lucide-react";
import { Position, Employee } from "@/types";
import { OrgEmployeePill } from "./OrgEmployeePill";

export interface GroupedPositionItem {
  key: string;
  position: Position;
  employees: Employee[];
  isPlanned: boolean;
}

export function groupPositionsByTitle(
  positions: (Position & { employees?: Employee[] })[]
): GroupedPositionItem[] {
  const map = new Map<string, GroupedPositionItem>();

  for (const pos of positions) {
    const titleKey = pos.title.trim().toLowerCase();
    const existing = map.get(titleKey);

    const posEmployees = pos.employees || [];
    const isPlanned = pos.status === "rejalashtirilgan";

    if (existing) {
      existing.employees = [...existing.employees, ...posEmployees];
      if (!isPlanned) existing.isPlanned = false;
    } else {
      map.set(titleKey, {
        key: pos.id,
        position: pos,
        employees: [...posEmployees],
        isPlanned,
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Xodimlarni fanlar ko'p-kamligiga qarab tartiblash:
 * 1-o'rinda eng ko'p o'qituvchiga ega fan (masalan: Arab tili - 7 ta),
 * 2-o'rinda keyingi ko'p fan (Ingliz tili - 3 ta), va h.k.
 */
export function sortEmployeesBySubjectFrequency(employees: Employee[]): Employee[] {
  const countMap = new Map<string, number>();
  for (const emp of employees) {
    const subj = (emp.subject || "").trim().toLowerCase();
    countMap.set(subj, (countMap.get(subj) || 0) + 1);
  }

  return [...employees].sort((a, b) => {
    const subjA = (a.subject || "").trim().toLowerCase();
    const subjB = (b.subject || "").trim().toLowerCase();

    // Fan biriktirilganlar birinchi chiqadi
    if (subjA && !subjB) return -1;
    if (!subjA && subjB) return 1;

    // Fanning umumiy soni bo'yicha (ko'pdan kamga)
    const countA = countMap.get(subjA) || 0;
    const countB = countMap.get(subjB) || 0;
    if (countB !== countA) {
      return countB - countA;
    }

    // Bir xil miqdordagi fanlar alifbo bo'yicha
    if (subjA !== subjB) {
      return subjA.localeCompare(subjB);
    }

    // Bir fanning o'zida ism bo'yicha alifbo tartibi
    return a.full_name.localeCompare(b.full_name);
  });
}

interface PositionGroupDropdownProps {
  position: Position;
  employees: Employee[];
  color?: string;
  isPlanned?: boolean;
}

export function PositionGroupDropdown({
  position,
  employees = [],
  color = "#1D4ED8",
  isPlanned = false,
}: PositionGroupDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sortedEmployees = React.useMemo(() => sortEmployeesBySubjectFrequency(employees), [employees]);

  // 1. Agar xodim bo'lmasa (bo'sh o'rin / rejalashtirilgan vakansiya)
  if (!employees || employees.length === 0) {
    return (
      <OrgEmployeePill
        position={position}
        color={color}
        isPlanned={isPlanned}
      />
    );
  }

  // 2. Agar lavozimda faqat 1 ta xodim bo'lsa (bitta xodim uchun oddiy karta)
  if (employees.length === 1) {
    return (
      <OrgEmployeePill
        employee={employees[0]}
        position={position}
        color={color}
        isPlanned={false}
      />
    );
  }

  // 3. Agar lavozimda 1 tadan ortiq xodim bo'lsa (ustozlar, administratorlar, supportlar va h.k.) -> Dropdown guruhi
  const renderTooltip = () => {
    if (!position.yqm_text) return null;

    return (
      <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 w-64 sm:w-72 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700/90 text-left scale-95 group-hover:scale-100 origin-bottom">
        {/* Header with icon and status */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 truncate">
              {position.title} ({employees.length} ta xodim)
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
            Guruh
          </span>
        </div>

        {/* YQM Text */}
        <div className="text-[11px] leading-relaxed text-slate-200 font-normal">
          <span className="font-bold text-white block text-[10px] uppercase text-slate-400 mb-0.5">
            Yakuniy Qimmatli Mahsulot:
          </span>
          <p className="whitespace-pre-line text-slate-100">
            {position.yqm_text}
          </p>
        </div>

        {/* Note */}
        <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>
            Jami: <strong className="text-white">{employees.length} ta xodim</strong>
          </span>
          <span className="text-brand-accent font-semibold">
            {isOpen ? "Yopish" : "Ochish"} &darr;
          </span>
        </div>

        {/* Arrow pointer pointing down */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95" />
      </div>
    );
  };

  return (
    <div className="w-full space-y-1.5">
      {/* Guruh Dropdown Tugmasi (Lavozim nomi va soni, masalan: Ustoz (12)) */}
      <div className="group relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="flex items-center justify-between w-full min-w-0 rounded-xl p-2 shadow-xs transition-all duration-200 hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] cursor-pointer text-left select-none"
          style={{
            backgroundColor: color,
            boxShadow: `0 3px 10px -2px ${color}40`,
          }}
        >
          {/* Multi-user Avatar Icon */}
          <div className="relative flex-shrink-0">
            <div className="flex h-7 w-7 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white shadow-2xs">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Lavozim nomi va soni */}
          <div className="ml-2 min-w-0 flex-1 text-left text-white">
            <p className="text-[11px] sm:text-[11.5px] font-black uppercase tracking-wider leading-tight break-words">
              {position.title} ({employees.length})
            </p>
          </div>

          {/* O'ng tomondagi ochish/yopish strelkasi */}
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0 ml-1">
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Hover YQM Tooltip */}
        {renderTooltip()}
      </div>

      {/* Ochilganda ko'rinadigan xodimlar ro'yxati */}
      {isOpen && (
        <div
          className="pl-1.5 border-l-2 space-y-1.5 transition-all duration-200 pt-0.5"
          style={{ borderColor: `${color}60` }}
        >
          {sortedEmployees.map((emp) => (
            <OrgEmployeePill
              key={emp.id}
              employee={emp}
              position={position}
              color={color}
              isPlanned={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
