"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, User, Upload, Plus, Trash2, Save, Image as ImageIcon } from "lucide-react";
import { Employee, Position, Department } from "@/types";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Employee>) => Promise<void>;
  employee?: Employee | null;
  positions: (Position & { department?: Department })[];
}

export function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  employee,
  positions,
}: EmployeeModalProps) {
  const [fullName, setFullName] = useState("");
  const [positionId, setPositionId] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [hiredAt, setHiredAt] = useState("");
  const [personalYqm, setPersonalYqm] = useState("");
  const [resume, setResume] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (employee) {
      setFullName(employee.full_name || "");
      setPositionId(employee.position_id || (positions[0]?.id || ""));
      setPhone(employee.phone || "");
      setPhotoUrl(employee.photo_url || "");
      setHiredAt(employee.hired_at || "");
      setPersonalYqm(employee.personal_yqm || "");
      setResume(employee.resume || "");
      setPortfolioLinks(Array.isArray(employee.portfolio_links) ? employee.portfolio_links : []);
    } else {
      setFullName("");
      setPositionId(positions[0]?.id || "");
      setPhone("");
      setPhotoUrl("");
      setHiredAt("");
      setPersonalYqm("");
      setResume("");
      setPortfolioLinks([]);
    }
    setNewLink("");
    setError(null);
  }, [employee, positions, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Surat yuklashda xatolik");
      }

      setPhotoUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Surat yuklab bo'lmadi");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      setPortfolioLinks((prev) => [...prev, newLink.trim()]);
      setNewLink("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setPortfolioLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Xodim F.I.Sh kiritilishi shart");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSave({
        id: employee?.id,
        full_name: fullName.trim(),
        position_id: positionId || undefined,
        phone: phone.trim() || undefined,
        photo_url: photoUrl.trim() || undefined,
        hired_at: hiredAt || undefined,
        personal_yqm: personalYqm.trim() || undefined,
        resume: resume.trim() || undefined,
        portfolio_links: portfolioLinks,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-brand-dark">
                {employee ? "Xodim profilini tahrirlash" : "Yangi xodim qo'shish"}
              </h2>
              <p className="text-xs text-slate-500">Xodim shaxsiy ma&apos;lumotlari va YQMi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Avatar Upload Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
            <div className="relative shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white shadow-inner flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-slate-800 mb-1">Xodim fotosurati</span>
              <p className="text-[11px] text-slate-500 mb-2">JPG, PNG yoki WEBP formatidagi rasm</p>
              
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-2xs transition"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isUploading ? "Yuklanmoqda..." : "Fayl tanlash"}</span>
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    O&apos;chirish
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* F.I.Sh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              To&apos;liq F.I.Sh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masalan: Abdullayev Rustam Xamidovich"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition"
              required
            />
          </div>

          {/* Lavozim tanlash */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Lavozimi
            </label>
            <select
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition bg-white"
            >
              <option value="">Lavozim tanlanmagan</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.department ? `(${p.department.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Telefon */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Telefon raqami
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123-45-67"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition"
              />
            </div>

            {/* Ishga kirgan sana */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ishga kirgan sana
              </label>
              <input
                type="date"
                value={hiredAt}
                onChange={(e) => setHiredAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition bg-white"
              />
            </div>
          </div>

          {/* Shaxsiy YQM */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Shaxsiy Yakuniy Qimmatli Mahsulot (YQM)
            </label>
            <textarea
              value={personalYqm}
              onChange={(e) => setPersonalYqm(e.target.value)}
              rows={2}
              placeholder="Xodimning shaxsiy YQM ta'rifi..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm font-medium text-slate-800 outline-none transition leading-relaxed resize-none"
            />
          </div>

          {/* Rezyume / Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Rezyume / Bio (Qisqacha ma&apos;lumot)
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              rows={3}
              placeholder="Xodimning tajribasi, yutuqlari va o'quv faoliyati haqida..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm font-medium text-slate-800 outline-none transition leading-relaxed resize-none"
            />
          </div>

          {/* Portfolio havolalari */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Portfolio & Havolalar
            </label>
            <div className="space-y-2">
              {portfolioLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={link}
                    readOnly
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 truncate"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://t.me/portfolio yoki https://github.com/..."
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-brand-accent transition"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Qo&apos;shish</span>
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-dark hover:bg-emerald-950 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Saqlanmoqda..." : "Saqlash"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
