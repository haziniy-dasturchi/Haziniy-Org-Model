"use client";

import React, { useState, useEffect } from "react";
import { X, Briefcase, Save } from "lucide-react";
import { Position, Department, Branch } from "@/types";

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Position>) => Promise<void>;
  position?: Position | null;
  departments: Department[];
  branches?: Branch[];
}

export function PositionModal({
  isOpen,
  onClose,
  onSave,
  position,
  departments,
  branches = [],
}: PositionModalProps) {
  const [departmentId, setDepartmentId] = useState("");
  const [branchId, setBranchId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [yqmText, setYqmText] = useState("");
  const [status, setStatus] = useState<"mavjud" | "rejalashtirilgan">("mavjud");
  const [sortOrder, setSortOrder] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (position) {
      setDepartmentId(position.department_id || (departments[0]?.id || ""));
      setBranchId(position.branch_id || "");
      setTitle(position.title || "");
      setYqmText(position.yqm_text || "");
      setStatus(position.status || "mavjud");
      setSortOrder(position.sort_order ?? 0);
    } else {
      setDepartmentId(departments[0]?.id || "");
      setBranchId("");
      setTitle("");
      setYqmText("");
      setStatus("mavjud");
      setSortOrder(0);
    }
    setError(null);
  }, [position, departments, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Lavozim nomi kiritilishi shart");
      return;
    }
    if (!departmentId) {
      setError("Bo'lim tanlanishi shart");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSave({
        id: position?.id,
        department_id: departmentId,
        branch_id: branchId ? branchId : null,
        title: title.trim(),
        yqm_text: yqmText.trim() || undefined,
        status,
        sort_order: Number(sortOrder) || 0,
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
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-brand-dark">
                {position ? "Lavozimni tahrirlash" : "Yangi lavozim qo'shish"}
              </h2>
              <p className="text-xs text-slate-500">Bo&apos;lim lavozimi va YQM parametrlari</p>
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
          {/* Bo'lim tanlash */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Bo&apos;lim <span className="text-rose-500">*</span>
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-emerald-100 text-sm font-medium text-slate-800 outline-none transition bg-white"
              required
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} bo&apos;limi
                </option>
              ))}
            </select>
          </div>

          {/* Filial tanlash */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Filial tegishliligi (Ixtiyoriy)
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-emerald-100 text-sm font-medium text-slate-800 outline-none transition bg-white"
            >
              <option value="">Umumiy / Barcha filiallar (Markaziy)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>


          {/* Lavozim nomi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Lavozim nomi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Bo'lim boshlig'i, Ustoz, Administrator..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Lavozim holati (Status)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  status === "mavjud"
                    ? "border-emerald-500 bg-emerald-50/60 text-emerald-900 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="mavjud"
                  checked={status === "mavjud"}
                  onChange={() => setStatus("mavjud")}
                  className="accent-emerald-600"
                />
                <div className="text-xs">
                  <span className="block font-bold">Mavjud</span>
                  <span className="text-[10px] text-slate-500">Hozirgi holatda ko&apos;rinadi</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  status === "rejalashtirilgan"
                    ? "border-amber-500 bg-amber-50/60 text-amber-900 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="rejalashtirilgan"
                  checked={status === "rejalashtirilgan"}
                  onChange={() => setStatus("rejalashtirilgan")}
                  className="accent-amber-600"
                />
                <div className="text-xs">
                  <span className="block font-bold">Rejalashtirilgan</span>
                  <span className="text-[10px] text-slate-500">Maqsad (Namuna) rejada</span>
                </div>
              </label>
            </div>
          </div>

          {/* Tartib raqami */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tartib raqami (Sort Order)
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              min={0}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition"
            />
          </div>

          {/* YQM matni */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Lavozim Yakuniy Qimmatli Mahsuloti (YQM)
            </label>
            <textarea
              value={yqmText}
              onChange={(e) => setYqmText(e.target.value)}
              rows={3}
              placeholder="Ushbu lavozimning yakuniy qimmatli mahsuloti ta'rifi..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm font-medium text-slate-800 outline-none transition leading-relaxed resize-none"
            />
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
