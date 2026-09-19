"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, Palette, Save } from "lucide-react";
import { Department } from "@/types";

const COLOR_PRESETS = [
  { name: "Navy", hex: "#0F172A" },
  { name: "Amber", hex: "#B45309" },
  { name: "Blue", hex: "#1D4ED8" },
  { name: "Orange", hex: "#C2410C" },
  { name: "Emerald", hex: "#047857" },
  { name: "Purple", hex: "#6D28D9" },
  { name: "Slate", hex: "#475569" },
  { name: "Rose", hex: "#881337" },
  { name: "Cyan", hex: "#0891B2" },
  { name: "Indigo", hex: "#4338CA" },
];

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Department>) => Promise<void>;
  department?: Department | null;
}

export function DepartmentModal({
  isOpen,
  onClose,
  onSave,
  department,
}: DepartmentModalProps) {
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState("#1D4ED8");
  const [sortOrder, setSortOrder] = useState(0);
  const [yqmText, setYqmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (department) {
      setName(department.name || "");
      setColorHex(department.color_hex || "#1D4ED8");
      setSortOrder(department.sort_order ?? 0);
      setYqmText(department.yqm_text || "");
    } else {
      setName("");
      setColorHex("#1D4ED8");
      setSortOrder(0);
      setYqmText("");
    }
    setError(null);
  }, [department, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Bo'lim nomi kiritilishi shart");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onSave({
        id: department?.id,
        name: name.trim(),
        color_hex: colorHex,
        sort_order: Number(sortOrder) || 0,
        yqm_text: yqmText.trim() || undefined,
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
            <div className="p-2 rounded-xl bg-blue-50 text-brand-accent">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-brand-dark">
                {department ? "Bo'limni tahrirlash" : "Yangi bo'lim qo'shish"}
              </h2>
              <p className="text-xs text-slate-500">Tashkiliy tuzilma bo&apos;limi parametrlari</p>
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
          {/* Nomi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Bo&apos;lim nomi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Moliya, Marketing, Sotuv..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition"
              required
            />
          </div>

          {/* Rang tanlash */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Bo&apos;lim rangi (Rang palitrasi)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer p-1 bg-white"
              />
              <input
                type="text"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                placeholder="#1D4ED8"
                className="w-32 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-700"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => setColorHex(p.hex)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-semibold text-slate-700 transition"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
                  <span>{p.name}</span>
                </button>
              ))}
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
              Yakuniy Qimmatli Mahsulot (YQM)
            </label>
            <textarea
              value={yqmText}
              onChange={(e) => setYqmText(e.target.value)}
              rows={3}
              placeholder="Bo'limning umumiy yakuniy qimmatli mahsuloti ta'rifi..."
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
