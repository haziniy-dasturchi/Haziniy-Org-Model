"use client";

import React from "react";
import Link from "next/link";
import { User, Phone, Plus, Sparkles } from "lucide-react";
import { Employee, Position } from "@/types";

interface EmployeeCardProps {
  employee?: Employee;
  position: Position;
  isPlanned?: boolean;
}

// Initsiallarni olish (masalan: "Muhammad Said Hasan" -> "MS")
function getInitials(name: string): string {
  if (!name) return "X";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function EmployeeCard({ employee, position, isPlanned }: EmployeeCardProps) {
  // Agar rejalashtirilgan lavozim bo'lsa (bo'sh o'rin)
  if (isPlanned || !employee) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 text-slate-400">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white text-slate-400 shadow-2xs">
          <Plus className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold text-slate-500 block truncate">
            Hali band emas
          </span>
          <span className="text-[11px] text-slate-400 block truncate">
            {position.title} (Vakansiya)
          </span>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/xodim/${employee.id}`}
      className="group brand-card-hover flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:border-brand-accent/50 hover:bg-emerald-50/25 cursor-pointer"
    >
      {/* Avatar / Photo */}
      {employee.photo_url ? (
        <div className="relative overflow-hidden rounded-full h-10 w-10 flex-shrink-0 select-none">
          <img
            src={employee.photo_url}
            alt={employee.full_name}
            draggable={false}
            className="h-10 w-10 rounded-full object-cover border border-slate-200 pointer-events-none select-none"
          />
          <div
            className="absolute inset-0 z-10 bg-transparent select-none cursor-pointer"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200/60 text-brand-dark text-xs font-bold shadow-2xs group-hover:from-emerald-100 group-hover:to-brand-accent/30 group-hover:text-emerald-950 transition">
          {getInitials(employee.full_name)}
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-bold text-brand-dark truncate group-hover:text-emerald-900 transition">
          {employee.full_name}
        </h4>
        <p className="text-[11px] text-slate-500 truncate font-medium">
          {position.title}
        </p>
        {employee.phone && (
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Phone className="w-2.5 h-2.5 text-brand-accent" />
            <span className="truncate">{employee.phone}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
