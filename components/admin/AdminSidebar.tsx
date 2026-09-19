"use client";

import React from "react";
import { Layers, Briefcase, Users, Building2, TrendingUp, Compass, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export type AdminTab = "departments" | "positions" | "employees" | "branches" | "mission";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  counts: {
    departments: number;
    positions: number;
    employees: number;
    branches: number;
  };
}

export function AdminSidebar({ activeTab, onTabChange, counts }: AdminSidebarProps) {
  const tabs = [
    {
      id: "departments" as AdminTab,
      label: "Bo'limlar",
      icon: Layers,
      count: counts.departments,
      color: "text-blue-600 bg-blue-50",
    },
    {
      id: "positions" as AdminTab,
      label: "Lavozimlar",
      icon: Briefcase,
      count: counts.positions,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      id: "employees" as AdminTab,
      label: "Xodimlar",
      icon: Users,
      count: counts.employees,
      color: "text-amber-600 bg-amber-50",
    },
    {
      id: "branches" as AdminTab,
      label: "Filiallar",
      icon: Building2,
      count: counts.branches,
      color: "text-cyan-600 bg-cyan-50",
    },
    {
      id: "mission" as AdminTab,
      label: "Korxona maqsadi",
      icon: Compass,
      color: "text-rose-600 bg-rose-50",
    },
  ];


  return (
    <div className="flex flex-col gap-2 bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-sm">
      {/* Sidebar Header Brand Badge */}
      <div className="hidden lg:flex items-center gap-2.5 px-3 py-2.5 mb-1 rounded-2xl bg-brand-dark text-white border border-emerald-900 shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/haziniy-icon-white.png" alt="Haziniy" className="h-6 w-6 object-contain" />
        <span className="font-serif text-xs font-black tracking-wider uppercase">Haziniy Admin</span>
      </div>

      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Boshqaruv bo&apos;limlari
      </div>

      <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-brand-dark text-white shadow-md shadow-brand-dark/20 scale-[1.01]"
                  : "text-slate-600 hover:bg-emerald-50/50 hover:text-brand-dark"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-xl transition ${
                    isActive ? "bg-brand-accent/20 text-brand-accent" : tab.color
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{tab.label}</span>
              </div>

              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-brand-accent/20 text-brand-accent border border-brand-accent/30"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 hidden lg:block">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-emerald-50/50 hover:bg-emerald-100/60 border border-brand-accent/30 text-xs font-bold text-brand-dark transition"
        >
          <span>Asosiy sahifani ko&apos;rish</span>
          <ArrowUpRight className="w-4 h-4 text-brand-accent" />
        </Link>
      </div>
    </div>
  );
}
