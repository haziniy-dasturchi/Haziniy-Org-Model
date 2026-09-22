"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Calendar,
  Briefcase,
  Layers,
  Award,
  ExternalLink,
  FileText,
  Edit3,
  Shield,
  UserCheck,
} from "lucide-react";
import { Employee, Position, Department, isTeachingOrSupportRole } from "@/types";
import { EditEmployeeModal } from "./EditEmployeeModal";
import { EmployeeCertificatesCarousel } from "./EmployeeCertificatesCarousel";

interface EmployeeProfileViewProps {
  employee: Employee & {
    position?: (Position & { department?: Department }) | null;
  };
  positions: (Position & { department?: Department })[];
  isAdmin: boolean;
}

function getInitials(name: string): string {
  if (!name) return "X";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function EmployeeProfileView({
  employee: initialEmployee,
  positions,
  isAdmin,
}: EmployeeProfileViewProps) {
  const [employee, setEmployee] = useState(initialEmployee);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  React.useEffect(() => {
    setEmployee(initialEmployee);
  }, [initialEmployee]);

  const position = employee.position;
  const department = position?.department;
  const deptColor = department?.color_hex || "#00BC55";
  const isTeacherOrSupport = isTeachingOrSupportRole(position?.title);

  function formatUzDate(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      const months = [
        "yanvar", "fevral", "mart", "aprel", "may", "iyun",
        "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
      ];
      return `${d.getDate()}-${months[d.getMonth()]}, ${d.getFullYear()}`;
    } catch {
      return null;
    }
  }

  const hiredDate = formatUzDate(employee.hired_at);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Navigation Bar: Back link + Admin Edit Button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-dark/70 hover:text-brand-dark transition-all group px-4 py-2.5 rounded-xl bg-white border border-emerald-900/10 shadow-2xs hover:border-brand-accent/40 hover:bg-emerald-50/40"
        >
          <ArrowLeft className="w-4 h-4 text-brand-accent transition-transform group-hover:-translate-x-1" />
          Bosh sahifaga qaytish
        </Link>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-dark hover:bg-[#002824] text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer border border-brand-accent/30 hover:border-brand-accent"
          >
            <Edit3 className="w-4 h-4 text-brand-accent" />
            Tahrirlash (Admin)
          </button>
        )}
      </div>

      {/* Main Profile Card Container */}
      <div className="bg-white rounded-3xl border border-emerald-900/10 shadow-md overflow-hidden">
        {/* Header Gradient Banner */}
        <div
          className="h-36 sm:h-48 w-full relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, #003933 0%, #002824 60%, ${deptColor} 140%)`,
          }}
        >
          {/* Subtle Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00BC55_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Top Corner Department Badge */}
          {department && (
            <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: deptColor }} />
              {department.name} bo&apos;limi
            </div>
          )}
        </div>

        {/* Profile Content Body */}
        <div className="px-6 sm:px-10 pb-10 relative">
          
          {/* Avatar & Badges Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            {/* Avatar / Photo */}
            <div className="relative">
              {employee.photo_url ? (
                <img
                  src={employee.photo_url}
                  alt={employee.full_name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-xl bg-white ring-2 ring-emerald-900/10"
                />
              ) : (
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-[#003933] to-[#002420] border-4 border-white text-brand-accent flex items-center justify-center text-3xl sm:text-4xl font-serif font-bold shadow-xl ring-2 ring-emerald-900/10">
                  {getInitials(employee.full_name)}
                </div>
              )}
            </div>

            {/* Badges / Position & Department */}
            <div className="flex flex-wrap gap-2 items-center">
              {position && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-brand-dark text-xs font-bold border border-brand-accent/30 shadow-2xs">
                  <Briefcase className="w-3.5 h-3.5 text-brand-accent" />
                  {position.title}
                </span>
              )}

              {department && (
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-2xs"
                  style={{ backgroundColor: deptColor }}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {department.name}
                </span>
              )}

              {isTeacherOrSupport && employee.subject && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 shadow-2xs">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Fani: {employee.subject}
                </span>
              )}
            </div>
          </div>

          {/* Name & Metadata Info */}
          <div className="space-y-2 mb-8">
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-brand-dark tracking-tight">
              {employee.full_name}
            </h1>
            <p className="text-sm font-semibold text-emerald-800/80 uppercase tracking-wider text-xs">
              {position
                ? isTeacherOrSupport && employee.subject
                  ? `${position.title} • ${employee.subject}`
                  : position.title
                : "Lavozim belgilanmagan"}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600">
              {employee.phone && (
                <div className="flex items-center gap-2 bg-emerald-50/70 hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-900/10 transition">
                  <Phone className="w-3.5 h-3.5 text-brand-accent" />
                  <a
                    href={`tel:${employee.phone}`}
                    className="hover:text-brand-accent font-bold text-brand-dark transition"
                  >
                    {employee.phone}
                  </a>
                </div>
              )}

              {hiredDate && (
                <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ishga qabul qilingan: <strong className="text-slate-800">{hiredDate}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Core YQM Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6 border-t border-emerald-900/10">
            {/* 1. Shaxsiy YQM (Yakuniy Qiymatli Mahsulot) - Highlighted Haziniy Brand Style */}
            <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 p-5 shadow-2xs hover:border-brand-accent/50 transition">
              <div className="flex items-center gap-2 text-brand-dark font-bold text-xs uppercase tracking-wider mb-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-dark text-brand-accent shadow-2xs">
                  <Award className="w-4 h-4" />
                </div>
                <span>Shaxsiy YQM (Yakuniy Qiymatli Mahsulot)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line pl-1 uppercase">
                {employee.personal_yqm ||
                  position?.yqm_text ||
                  "Ushbu xodim uchun shaxsiy YQM hali belgilanmagan."}
              </p>
            </div>

            {/* 2. Bo'limning umumiy YQMi */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-2xs hover:border-slate-300 transition">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-700 text-white shadow-2xs">
                  <Layers className="w-4 h-4" />
                </div>
                <span>Bo&apos;limning Umumiy YQMi</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-1 uppercase">
                {department?.yqm_text || "Bo'lim YQMi ko'rsatilmagan."}
              </p>
            </div>
          </div>

          {/* Rezyume / Bio (Formatted Multi-line Text) */}
          <div className="mt-6 pt-6 border-t border-emerald-900/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900/60">
              <FileText className="w-4 h-4 text-brand-accent" />
              <span>Rezyume / Tarjimai Hol (Bio)</span>
            </div>
            {employee.resume || (employee as any).bio ? (
              <div className="p-5 rounded-2xl bg-emerald-50/30 border border-emerald-900/10 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {employee.resume || (employee as any).bio}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-400 italic">
                Ushbu xodim haqida rezyume yoki bio ma&apos;lumotlari kiritilmagan.
              </div>
            )}
          </div>

          {/* Sertifikatlar va Diplomlar Karuseli */}
          <EmployeeCertificatesCarousel
            certificates={employee.certificates}
            employeeName={employee.full_name}
          />

          {/* Portfolio & Documents External Links */}
          {employee.portfolio_links && employee.portfolio_links.length > 0 && (
            <div className="mt-6 pt-6 border-t border-emerald-900/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 flex items-center gap-1.5">
                <span>Portfolio va Hujjat Havolalari</span>
              </h3>

              <div className="flex flex-wrap gap-2.5">
                {employee.portfolio_links.map((link: string, idx: number) => {
                  const href = link.startsWith("http") ? link : `https://${link}`;
                  return (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-emerald-900/10 hover:border-brand-accent/50 text-xs font-bold text-brand-dark hover:text-brand-accent transition group shadow-2xs"
                    >
                      <span>Havola #{idx + 1}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-accent transition-transform group-hover:translate-x-0.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Admin Edit Modal */}
      {isAdmin && (
        <EditEmployeeModal
          employee={employee}
          positions={positions}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={(updated) => {
            const pos = positions.find((p) => p.id === updated.position_id) || employee.position;
            setEmployee({ ...updated, position: pos });
          }}
        />
      )}
    </div>
  );
}
