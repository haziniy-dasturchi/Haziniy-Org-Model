"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Department, Position, Employee } from "@/types";
import { OrgEmployeePill } from "./OrgEmployeePill";
import { PositionGroupDropdown, groupPositionsByTitle } from "./PositionGroupDropdown";
import { DEFAULT_TEST_EMPLOYEES } from "@/lib/defaultOrgData";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Crown,
  Briefcase,
  Move,
  Layers,
  User,
} from "lucide-react";

function getInitials(name: string): string {
  if (!name) return "X";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface InteractiveTreeCanvasProps {
  departments: (Department & {
    positions?: (Position & { employees?: Employee[] })[];
  })[];
  mode: "current" | "target";
}

// Matte, calm, professional brand colors (no neon, easy on the eyes)
const DEPARTMENT_COLORS: Record<
  string,
  { bg: string; text: string; lightBg: string; border: string; headerClass: string; darkText: string }
> = {
  Moliya: {
    bg: "#B45309",
    text: "#ffffff",
    lightBg: "#FFFBEB",
    border: "#D97706",
    headerClass: "bg-amber-700 text-white",
    darkText: "#92400E",
  },
  Marketing: {
    bg: "#0369A1",
    text: "#ffffff",
    lightBg: "#F0F9FF",
    border: "#0284C7",
    headerClass: "bg-sky-700 text-white",
    darkText: "#075985",
  },
  Sotuv: {
    bg: "#C2410C",
    text: "#ffffff",
    lightBg: "#FFF7ED",
    border: "#EA580C",
    headerClass: "bg-orange-700 text-white",
    darkText: "#9A3412",
  },
  "O'quv": {
    bg: "#007A4D",
    text: "#ffffff",
    lightBg: "#ECFDF5",
    border: "#00BC55",
    headerClass: "bg-emerald-800 text-white",
    darkText: "#065F46",
  },
  "O‘quv": {
    bg: "#007A4D",
    text: "#ffffff",
    lightBg: "#ECFDF5",
    border: "#00BC55",
    headerClass: "bg-emerald-800 text-white",
    darkText: "#065F46",
  },
  Oquv: {
    bg: "#007A4D",
    text: "#ffffff",
    lightBg: "#ECFDF5",
    border: "#00BC55",
    headerClass: "bg-emerald-800 text-white",
    darkText: "#065F46",
  },
  HR: {
    bg: "#6D28D9",
    text: "#ffffff",
    lightBg: "#F5F3FF",
    border: "#7C3AED",
    headerClass: "bg-purple-700 text-white",
    darkText: "#5B21B6",
  },
  Texnik: {
    bg: "#475569",
    text: "#ffffff",
    lightBg: "#F1F5F9",
    border: "#64748B",
    headerClass: "bg-slate-600 text-white",
    darkText: "#1E293B",
  },
  Yuridik: {
    bg: "#881337",
    text: "#ffffff",
    lightBg: "#FFF1F2",
    border: "#9F1239",
    headerClass: "bg-rose-900 text-white",
    darkText: "#881337",
  },
  Boshqaruv: {
    bg: "#003933",
    text: "#ffffff",
    lightBg: "#E6F4F1",
    border: "#003933",
    headerClass: "bg-brand-dark text-white",
    darkText: "#003933",
  },
};

function getDeptColor(name: string, fallbackHex?: string | null) {
  for (const key of Object.keys(DEPARTMENT_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return DEPARTMENT_COLORS[key];
    }
  }
  const hex = fallbackHex || "#1D4ED8";
  return {
    bg: hex,
    text: "#ffffff",
    lightBg: `${hex}15`,
    border: hex,
    headerClass: "bg-blue-700 text-white",
    darkText: hex,
  };
}

const DEPT_ORDER = ["Moliya", "Marketing", "Sotuv", "O'quv", "HR", "Texnik", "Yuridik"];

export function InteractiveTreeCanvas({ departments, mode }: InteractiveTreeCanvasProps) {
  // Canvas Transform State: zoom (scale) and pan (position)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Separate Boshqaruv vs 7 Branch Departments
  const boshqaruvDept = departments.find(
    (d) => d.name.toLowerCase().includes("boshqaruv") || d.name.toLowerCase().includes("asoschi")
  );

  const branchDepartments = departments
    .filter((d) => d !== boshqaruvDept)
    .sort((a, b) => {
      const idxA = DEPT_ORDER.findIndex((name) => a.name.toLowerCase().includes(name.toLowerCase()));
      const idxB = DEPT_ORDER.findIndex((name) => b.name.toLowerCase().includes(name.toLowerCase()));
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

  const allBoshqaruvPositions = boshqaruvDept?.positions || [];

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
    employees: allBoshqaruvPositions.length > 1 ? allBoshqaruvPositions[1]?.employees || [] : [],
  };

  const allEmployees = departments.flatMap((d) => (d.positions || []).flatMap((p) => p.employees || []));

  const asoschiEmp =
    (asoschiPos.employees && asoschiPos.employees.length > 0 ? asoschiPos.employees[0] : null) ||
    allEmployees.find((e) => e.position_id === asoschiPos.id || e.id === "asoschi-test-emp") ||
    DEFAULT_TEST_EMPLOYEES[0];

  const menejerEmp =
    (menejerPos.employees && menejerPos.employees.length > 0 ? menejerPos.employees[0] : null) ||
    allEmployees.find((e) => e.position_id === menejerPos.id || e.id === "menejer-test-emp") ||
    DEFAULT_TEST_EMPLOYEES[1];

  // Zoom Controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.45));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag & Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || isFullscreen) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.45), 1.8));
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none transition-all duration-300 rounded-3xl ${
        isFullscreen
          ? "fixed inset-0 z-[100] bg-slate-900/98 p-6 h-screen w-screen backdrop-blur-xl"
          : "bg-slate-50/50 border border-slate-200/90 min-h-[620px] shadow-2xs"
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Subtle Dot Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `radial-gradient(#64748b 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Floating Canvas Controls (Zoom In, Zoom Out, Reset, Fullscreen) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Yaqinlashtirish (+)"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          title="Uzoqlashtirish (-)"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="px-2 text-[11px] font-bold text-slate-500 min-w-[42px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={handleReset}
          title="Asl holatga qaytarish (100%)"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "To'liq ekrandan chiqish" : "To'liq ekran rejimi"}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Helper Tag (Top Left) */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-500">
        <Move className="w-3.5 h-3.5 text-slate-400" />
        <span>Sichqoncha bilan ushlab surishingiz mumkin</span>
      </div>

      {/* Transform Canvas Area */}
      <div
        className="w-full h-full flex flex-col items-center justify-start pt-7 pb-10 transition-transform duration-75 origin-top"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <div className="w-full max-w-[1360px] px-3 flex flex-col items-center">
          
          {/* ================= 1. ASOSCHI NODE (BRAND DARK & MINT ACCENT) ================= */}
          <div className="relative z-30 flex flex-col items-center">
            <div className="group relative">
              <Link
                href={`/xodim/${asoschiEmp.id}`}
                className="flex items-center min-w-[220px] sm:min-w-[240px] max-w-[280px] p-2 sm:p-2.5 rounded-2xl bg-brand-dark text-white shadow-md border border-emerald-900/60 hover:border-brand-accent hover:bg-[#002824] hover:scale-[1.02] transition-all duration-200 cursor-pointer text-left brand-card-hover"
                style={{ boxShadow: "0 6px 20px -2px rgba(0, 57, 51, 0.35)" }}
              >
                {/* Photo / Avatar */}
                <div className="relative flex-shrink-0">
                  {asoschiEmp.photo_url ? (
                    <img
                      src={asoschiEmp.photo_url}
                      alt={asoschiEmp.full_name}
                      className="h-9 w-9 rounded-full object-cover border border-brand-accent/50 shadow-2xs"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent/20 backdrop-blur-sm border border-brand-accent/40 text-brand-accent text-xs font-black shadow-2xs">
                      {getInitials(asoschiEmp.full_name)}
                    </div>
                  )}
                </div>

                {/* Info: Lavozim & Ism Familiya */}
                <div className="ml-2.5 min-w-0 flex-1 text-left text-white">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-brand-accent truncate leading-tight flex items-center gap-1">
                      <Crown className="w-3 h-3 text-brand-accent inline" />
                      {asoschiPos.title}
                    </p>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-brand-accent/20 text-brand-accent border border-brand-accent/30">
                      Mavjud
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors truncate leading-tight mt-0.5">
                    {asoschiEmp.full_name}
                  </p>
                </div>
              </Link>

              {/* Rich Hover Popover (Identical to Department Employees, Positioned Below to Avoid Canvas Clipping) */}
              {asoschiPos.yqm_text && (
                <div className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700/90 text-left scale-95 group-hover:scale-100 origin-top">
                  {/* Header with icon and status */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 truncate">
                        {asoschiPos.title}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                      Mavjud
                    </span>
                  </div>

                  {/* YQM Text */}
                  <div className="text-[11px] leading-relaxed text-slate-200 font-normal">
                    <span className="font-bold text-white block text-[10px] uppercase text-slate-400 mb-0.5">
                      Yakuniy Qimmatli Mahsulot:
                    </span>
                    <p className="whitespace-pre-line text-slate-100">
                      {asoschiPos.yqm_text}
                    </p>
                  </div>

                  {/* Assigned employee note */}
                  {asoschiEmp && (
                    <div className="mt-2.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span className="truncate">
                        Xodim: <strong className="text-white">{asoschiEmp.full_name}</strong>
                      </span>
                      <span className="text-brand-accent font-semibold">Batafsil &rarr;</span>
                    </div>
                  )}

                  {/* Arrow pointer pointing up to Asoschi card */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900/95" />
                </div>
              )}
            </div>
          </div>

          {/* ================= 2. SVG CONNECTOR LINES & MENEJER TIER ================= */}
          <div className="w-full h-[140px] relative my-1">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 700 140">
              {/* --- 1. ASOSCHI DIRECT GOVERNANCE BRANCH (Top horizontal bar at Y=16) --- */}
              {/* Asoschi stem down to Menejer (X=350, Y=0 to 32) */}
              <line x1="350" y1="0" x2="350" y2="32" stroke="#003933" strokeWidth="2" />

              {/* Asoschi direct governance bar: Left to Moliya (X=50), Right to Yuridik (X=650) */}
              <path
                d="M 50 140 L 50 16 L 650 16 L 650 140"
                fill="none"
                stroke="#003933"
                strokeWidth="2"
              />

              {/* Junction dots on Asoschi branch */}
              <circle cx="350" cy="16" r="3" fill="#00BC55" />
              <circle cx="50" cy="16" r="3" fill="#00BC55" />
              <circle cx="650" cy="16" r="3" fill="#00BC55" />

              {/* --- 2. MENEJER OPERATIONAL BRANCH (Lower horizontal bar at Y=110) --- */}
              {/* Gap between Menejer (Y=78) and Menejer Bus (Y=110) is exactly 32px, equal to Asoschi-Menejer gap! */}
              <line x1="350" y1="78" x2="350" y2="110" stroke="#003933" strokeWidth="2" />

              {/* MENEJER BUS: Spans from Moliya (X=50) to Texnik (X=550) - DOES NOT REACH YURIDIK! */}
              <line x1="50" y1="110" x2="550" y2="110" stroke="#003933" strokeWidth="2" />

              {/* Vertical drops from Menejer horizontal bar (Y=110 to 140) to operational departments */}
              <line x1="150" y1="110" x2="150" y2="140" stroke="#003933" strokeWidth="2" />
              <line x1="250" y1="110" x2="250" y2="140" stroke="#003933" strokeWidth="2" />
              <line x1="350" y1="110" x2="350" y2="140" stroke="#003933" strokeWidth="2" />
              <line x1="450" y1="110" x2="450" y2="140" stroke="#003933" strokeWidth="2" />
              <line x1="550" y1="110" x2="550" y2="140" stroke="#003933" strokeWidth="2" />

              {/* Junction dots on Menejer bus */}
              <circle cx="50" cy="110" r="3" fill="#00BC55" />
              <circle cx="150" cy="110" r="3" fill="#00BC55" />
              <circle cx="250" cy="110" r="3" fill="#00BC55" />
              <circle cx="350" cy="110" r="3" fill="#00BC55" />
              <circle cx="450" cy="110" r="3" fill="#00BC55" />
              <circle cx="550" cy="110" r="3" fill="#00BC55" />
            </svg>

            {/* MENEJER (DIREKTOR) NODE (Centered at Top=32px, height ~46px, bottom=78px) */}
            <div className="absolute top-[32px] left-1/2 -translate-x-1/2 z-20">
              <div className="group relative">
                <Link
                  href={`/xodim/${menejerEmp.id}`}
                  className="flex items-center min-w-[220px] sm:min-w-[240px] max-w-[280px] p-2 sm:p-2.5 rounded-2xl bg-brand-dark text-white shadow-md border border-emerald-900/60 hover:border-brand-accent hover:bg-[#002824] hover:scale-[1.02] transition-all duration-200 cursor-pointer text-left brand-card-hover"
                  style={{ boxShadow: "0 6px 20px -2px rgba(0, 57, 51, 0.35)" }}
                >
                  {/* Photo / Avatar */}
                  <div className="relative flex-shrink-0">
                    {menejerEmp.photo_url ? (
                      <img
                        src={menejerEmp.photo_url}
                        alt={menejerEmp.full_name}
                        className="h-9 w-9 rounded-full object-cover border border-brand-accent/50 shadow-2xs"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent/20 backdrop-blur-sm border border-brand-accent/40 text-brand-accent text-xs font-black shadow-2xs">
                        {getInitials(menejerEmp.full_name)}
                      </div>
                    )}
                  </div>

                  {/* Info: Lavozim & Ism Familiya */}
                  <div className="ml-2.5 min-w-0 flex-1 text-left text-white">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-brand-accent truncate leading-tight flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-brand-accent inline" />
                        {menejerPos.title}
                      </p>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-brand-accent/20 text-brand-accent border border-brand-accent/30">
                        Mavjud
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors truncate leading-tight mt-0.5">
                      {menejerEmp.full_name}
                    </p>
                  </div>
                </Link>

                {/* Rich Hover Popover (Identical to Department Employees, Positioned Below) */}
                {menejerPos.yqm_text && (
                  <div className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700/90 text-left scale-95 group-hover:scale-100 origin-top">
                    {/* Header with icon and status */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-2 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Briefcase className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 truncate">
                          {menejerPos.title}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                        Mavjud
                      </span>
                    </div>

                    {/* YQM Text */}
                    <div className="text-[11px] leading-relaxed text-slate-200 font-normal">
                      <span className="font-bold text-white block text-[10px] uppercase text-slate-400 mb-0.5">
                        Yakuniy Qimmatli Mahsulot:
                      </span>
                      <p className="whitespace-pre-line text-slate-100">
                        {menejerPos.yqm_text}
                      </p>
                    </div>

                    {/* Assigned employee note */}
                    {menejerEmp && (
                      <div className="mt-2.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                        <span className="truncate">
                          Xodim: <strong className="text-white">{menejerEmp.full_name}</strong>
                        </span>
                        <span className="text-brand-accent font-semibold">Batafsil &rarr;</span>
                      </div>
                    )}

                    {/* Arrow pointer pointing up to Menejer card */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900/95" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= 3. 7 DEPARTMENTS GRID (CALM MATTE PALETTE) ================= */}
          <div className="w-full grid grid-cols-7 gap-2 lg:gap-2.5 xl:gap-3.5 items-stretch pt-0">
            {branchDepartments.map((dept) => {
              const deptColor = getDeptColor(dept.name, dept.color_hex);

              // Filter positions by mode
              const rawPositions = (dept.positions || []).filter((p) => {
                if (mode === "target") return true;
                return p.status === "mavjud" || (p.employees && p.employees.length > 0);
              });
              const groupedPositions = groupPositionsByTitle(rawPositions);

              return (
                <div
                  key={dept.id}
                  className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 p-2 sm:p-2.5 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-xs"
                >
                  {/* Top: Department Header & Positions List */}
                  <div className="w-full flex flex-col space-y-2">
                    {/* Department Header Badge (Calm solid matte header) */}
                    <div
                      className={`w-full py-2 px-2 rounded-xl ${deptColor.headerClass} shadow-2xs text-center select-none cursor-default`}
                    >
                      <h3 className="text-xs font-black uppercase tracking-wide truncate">
                        {dept.name}
                      </h3>
                    </div>

                    {/* Positions List */}
                    <div className="w-full flex flex-col space-y-1.5">
                      {groupedPositions.length > 0 ? (
                        groupedPositions.map((group) => (
                          <PositionGroupDropdown
                            key={group.key}
                            position={group.position}
                            employees={group.employees}
                            color={deptColor.bg}
                            isPlanned={group.isPlanned}
                          />
                        ))
                      ) : (
                        <div className="text-center py-4 text-[10px] text-slate-400 italic">
                          Mavjud lavozimlar yo&apos;q
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Department Core YQM Box (Tinted light background with matching department text color) */}
                  {dept.yqm_text && (
                    <div className="w-full mt-4 pt-2 border-t border-slate-100">
                      <div
                        className="w-full p-2.5 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase text-center leading-snug border transition-all shadow-2xs"
                        style={{
                          backgroundColor: deptColor.lightBg,
                          color: deptColor.darkText,
                          borderColor: `${deptColor.bg}40`,
                        }}
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
    </div>
  );
}
