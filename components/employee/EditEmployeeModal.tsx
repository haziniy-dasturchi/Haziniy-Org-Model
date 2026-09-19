"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Employee, Position, Department } from "@/types";
import {
  X,
  Save,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  User,
  Briefcase,
  Phone,
  Calendar,
  Award,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

interface EditEmployeeModalProps {
  employee: Employee & {
    position?: (Position & { department?: Department }) | null;
  };
  positions: (Position & { department?: Department })[];
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (employee: any) => void;
}

export function EditEmployeeModal({
  employee,
  positions,
  isOpen,
  onClose,
  onSaved,
}: EditEmployeeModalProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState(employee.full_name || "");
  const [positionId, setPositionId] = useState(employee.position_id || "");
  const [phone, setPhone] = useState(employee.phone || "");
  const [photoUrl, setPhotoUrl] = useState(employee.photo_url || "");
  const [hiredAt, setHiredAt] = useState(
    employee.hired_at ? employee.hired_at.split("T")[0] : ""
  );
  const [personalYqm, setPersonalYqm] = useState(employee.personal_yqm || "");
  const [resume, setResume] = useState(employee.resume || "");
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(
    employee.portfolio_links && employee.portfolio_links.length > 0
      ? [...employee.portfolio_links]
      : [""]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFullName(employee.full_name || "");
      setPositionId(employee.position_id || "");
      setPhone(employee.phone || "");
      setPhotoUrl(employee.photo_url || "");
      setHiredAt(employee.hired_at ? employee.hired_at.split("T")[0] : "");
      setPersonalYqm(employee.personal_yqm || "");
      setResume(employee.resume || "");
      setPortfolioLinks(
        employee.portfolio_links && employee.portfolio_links.length > 0
          ? [...employee.portfolio_links]
          : [""]
      );
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, employee]);

  if (!isOpen) return null;

  const handleAddLink = () => {
    setPortfolioLinks([...portfolioLinks, ""]);
  };

  const handleLinkChange = (index: number, val: string) => {
    const updated = [...portfolioLinks];
    updated[index] = val;
    setPortfolioLinks(updated);
  };

  const handleRemoveLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Xodim F.I.Sh kiritilishi shart");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const cleanLinks = portfolioLinks.map((l) => l.trim()).filter((l) => l.length > 0);

      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          position_id: positionId || null,
          phone: phone.trim() || null,
          photo_url: photoUrl.trim() || null,
          hired_at: hiredAt || null,
          personal_yqm: personalYqm.trim() || null,
          resume: resume.trim() || null,
          portfolio_links: cleanLinks,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Xatolik yuz berdi");
      }

      setSuccess(true);
      if (onSaved && data.employee) {
        onSaved(data.employee);
      }
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-brand-dark/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-900/10 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/10 bg-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-dark text-brand-accent text-xs font-bold border border-brand-accent/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-dark">
                Xodim profilini tahrirlash
              </h3>
              <p className="text-[11px] text-emerald-800/70">
                Barcha o&apos;zgarishlar darhol bazada saqlanadi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-emerald-100/60 hover:text-brand-dark transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-brand-accent/30 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
              <span>Muvaffaqiyatli saqlandi! Sahifa yangilanmoqda...</span>
            </div>
          )}

          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              F.I.Sh (To&apos;liq ism-familiya) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masalan: Alisher Navoiy"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
              />
            </div>
          </div>

          {/* 2. Position Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lavozimi va Bo&apos;limi
            </label>
            <select
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            >
              <option value="">-- Lavozimni tanlang --</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.department ? `${pos.department.name} - ` : ""}
                  {pos.title} ({pos.status === "mavjud" ? "Mavjud" : "Rejalashtirilgan"})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Phone & Hired At (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telefon raqam
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ishga kirgan sana
              </label>
              <input
                type="date"
                value={hiredAt}
                onChange={(e) => setHiredAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
              />
            </div>
          </div>

          {/* 4. Photo URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Surat havolasi (Photo URL)
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            />
          </div>

          {/* 5. Shaxsiy YQM */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Shaxsiy YQM (Yakuniy Qimmatli Mahsulot)
            </label>
            <textarea
              rows={3}
              value={personalYqm}
              onChange={(e) => setPersonalYqm(e.target.value)}
              placeholder="Xodimning shaxsiy YQM vazifasi..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent leading-relaxed"
            />
          </div>

          {/* 6. Rezyume / Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Rezyume / Bio ma&apos;lumotlari
            </label>
            <textarea
              rows={4}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Xodim haqida qisqacha ma'lumot, tajribasi, yutuqlari..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent leading-relaxed"
            />
          </div>

          {/* 7. Portfolio Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                Portfolio va Hujjat havolalari
              </label>
              <button
                type="button"
                onClick={handleAddLink}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-accent hover:underline"
              >
                <Plus className="w-3 h-3" /> Havola qo&apos;shish
              </button>
            </div>

            <div className="space-y-2">
              {portfolioLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => handleLinkChange(idx, e.target.value)}
                    placeholder={`https://github.com/... yoki Portfolio ${idx + 1}`}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
                  />
                  {portfolioLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-dark hover:bg-emerald-950 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  O&apos;zgarishlarni saqlash
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
