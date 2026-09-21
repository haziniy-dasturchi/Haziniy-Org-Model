"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Employee, Position, Department, CertificateItem, isTeachingOrSupportRole } from "@/types";
import { compressImageFile, isPdf } from "@/lib/imageUtils";
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
  Upload,
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
  const [subject, setSubject] = useState(employee.subject || "");
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(
    employee.portfolio_links && employee.portfolio_links.length > 0
      ? [...employee.portfolio_links]
      : [""]
  );
  const [certificates, setCertificates] = useState<CertificateItem[]>(
    Array.isArray(employee.certificates) ? [...employee.certificates] : []
  );

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const certFileInputRef = useRef<HTMLInputElement>(null);

  const selectedPosition =
    positions.find((p) => p.id === positionId) ||
    (employee.position_id === positionId ? employee.position : null);
  const isUstozOrSupport = isTeachingOrSupportRole(selectedPosition?.title);


  useEffect(() => {
    if (isOpen) {
      setFullName(employee.full_name || "");
      setPositionId(employee.position_id || "");
      setPhone(employee.phone || "");
      setPhotoUrl(employee.photo_url || "");
      setHiredAt(employee.hired_at ? employee.hired_at.split("T")[0] : "");
      setPersonalYqm(employee.personal_yqm || "");
      setResume(employee.resume || "");
      setSubject(employee.subject || "");
      setPortfolioLinks(
        employee.portfolio_links && employee.portfolio_links.length > 0
          ? [...employee.portfolio_links]
          : [""]
      );
      setCertificates(Array.isArray(employee.certificates) ? [...employee.certificates] : []);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, employee]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
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
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
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
          subject: isUstozOrSupport ? (subject.trim() || null) : null,
          portfolio_links: cleanLinks,
          certificates,
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

          {/* Avatar Upload Section */}
          <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-900/10 flex items-center gap-4">
            <div className="relative shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName || "Xodim"}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-white ring-1 ring-emerald-900/10"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-white shadow-inner flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-brand-dark mb-1">Xodim fotosurati</span>
              <p className="text-[11px] text-slate-500 mb-2">Qurilmadan rasm tanlang yoki URL kiriting</p>

              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-900/15 hover:bg-emerald-50 text-xs font-bold text-brand-dark shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Yuklanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-brand-accent" />
                      <span>Fayl tanlash</span>
                    </>
                  )}
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("")}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    O&apos;chirish
                  </button>
                )}
              </div>
            </div>
          </div>

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

          {/* O'qitadigan fani - Faqat ustoz va supportlar uchun */}
          {isUstozOrSupport && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                O&apos;qitadigan fani <span className="text-slate-400 font-normal lowercase">(ustoz/supportlar uchun: Arab tili, Ingliz tili va h.k.)</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Masalan: Arab tili, Ingliz tili, Matematika..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
              />
            </div>
          )}

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

          {/* 4. Shaxsiy YQM */}
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

          {/* 5. Rezyume / Bio */}
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

          {/* 6. Sertifikatlar va Diplomlar */}
          <div className="pt-2 border-t border-emerald-900/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
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
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white shrink-0 shadow-2xs"
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
                        placeholder="Berilgan sana (masalan: 2024)..."
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none focus:border-brand-accent transition"
                      />
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(cert.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition shrink-0 cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Portfolio Links */}
          <div className="pt-2 border-t border-emerald-900/10">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                Portfolio va Hujjat havolalari
              </label>
              <button
                type="button"
                onClick={handleAddLink}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-accent hover:underline cursor-pointer"
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
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
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
