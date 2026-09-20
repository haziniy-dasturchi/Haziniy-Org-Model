"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, User, Upload, Plus, Trash2, Save, Image as ImageIcon, Award, Loader2, FileText } from "lucide-react";
import { Employee, Position, Department, CertificateItem } from "@/types";
import { compressImageFile, isPdf } from "@/lib/imageUtils";

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
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const certFileInputRef = useRef<HTMLInputElement>(null);

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
      setCertificates(Array.isArray(employee.certificates) ? [...employee.certificates] : []);
    } else {
      setFullName("");
      setPositionId(positions[0]?.id || "");
      setPhone("");
      setPhotoUrl("");
      setHiredAt("");
      setPersonalYqm("");
      setResume("");
      setPortfolioLinks([]);
      setCertificates([]);
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

      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append("file", compressed);

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

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCert(true);
      setError(null);

      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Sertifikat yuklashda xatolik");
      }

      const defaultTitle =
        file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim() || "Sertifikat";

      const newCert: CertificateItem = {
        id: "cert-" + Date.now(),
        title: defaultTitle,
        image_url: data.url,
        issued_date: "",
      };

      setCertificates((prev) => [...prev, newCert]);
      if (certFileInputRef.current) certFileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Sertifikat yuklab bo'lmadi");
    } finally {
      setIsUploadingCert(false);
    }
  };

  const handleRemoveCert = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCertChange = (id: string, field: "title" | "issued_date", val: string) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
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
        position_id: positionId || null,
        phone: phone.trim() || null,
        photo_url: photoUrl.trim() || null,
        hired_at: hiredAt || null,
        personal_yqm: personalYqm.trim() || null,
        resume: resume.trim() || null,
        portfolio_links: portfolioLinks,
        certificates,
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

          {/* Sertifikatlar va Diplomlar */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Sertifikatlar va Diplomlar ({certificates.length})</span>
              </label>

              <button
                type="button"
                onClick={() => certFileInputRef.current?.click()}
                disabled={isUploadingCert}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isUploadingCert ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Yuklanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Sertifikat qo&apos;shish (Rasm/PDF)</span>
                  </>
                )}
              </button>

              <input
                ref={certFileInputRef}
                type="file"
                accept="image/*,application/pdf,.pdf"
                onChange={handleCertificateUpload}
                className="hidden"
              />
            </div>

            {certificates.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 bg-slate-50/50">
                Ushbu xodim uchun sertifikatlar yuklanmagan. Yuqoridagi tugma orqali rasm yoki PDF yuklashingiz mumkin.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition"
                  >
                    {/* Thumbnail preview: Image or PDF Badge */}
                    {isPdf(cert.image_url) ? (
                      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 shrink-0 font-bold text-[10px] shadow-2xs">
                        <FileText className="w-5 h-5 text-rose-500" />
                        <span>PDF</span>
                      </div>
                    ) : (
                      <img
                        src={cert.image_url}
                        alt={cert.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                      />
                    )}

                    {/* Inputs */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cert.title}
                        onChange={(e) => handleCertChange(cert.id, "title", e.target.value)}
                        placeholder="Sertifikat nomi..."
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none focus:border-brand-accent transition"
                      />
                      <input
                        type="text"
                        value={cert.issued_date || ""}
                        onChange={(e) => handleCertChange(cert.id, "issued_date", e.target.value)}
                        placeholder="Berilgan sanasi (masalan: 2024)..."
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none focus:border-brand-accent transition"
                      />
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(cert.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition shrink-0"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
