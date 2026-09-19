"use client";

import React, { useState, useEffect } from "react";
import { X, TrendingUp, Save, Sparkles, Building2, Pencil } from "lucide-react";

interface FinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any | null;
}

export function FinanceModal({ isOpen, onClose, onSave, initialData }: FinanceModalProps) {
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split("T")[0]);
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [standardCoursePrice, setStandardCoursePrice] = useState("200000");
  const [specialCoursePrice, setSpecialCoursePrice] = useState("250000");
  const [maxTeacherLoad, setMaxTeacherLoad] = useState("");
  const [minTeacherLoad, setMinTeacherLoad] = useState("");
  const [mainBranchStudents, setMainBranchStudents] = useState("358");
  const [xazinaBranchStudents, setXazinaBranchStudents] = useState("88");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setSnapshotDate(initialData.snapshot_date || new Date().toISOString().split("T")[0]);
      setMonthlyRevenue(initialData.monthly_revenue != null ? String(initialData.monthly_revenue) : "");
      setMonthlyExpenses(initialData.monthly_expenses != null ? String(initialData.monthly_expenses) : "");
      setStandardCoursePrice(
        initialData.course_prices?.["Standart kurs"] != null
          ? String(initialData.course_prices["Standart kurs"])
          : "200000"
      );
      setSpecialCoursePrice(
        initialData.course_prices?.["Maxsus kurs"] != null
          ? String(initialData.course_prices["Maxsus kurs"])
          : "250000"
      );
      setMaxTeacherLoad(
        initialData.max_teacher_load != null ? String(initialData.max_teacher_load) : ""
      );
      setMinTeacherLoad(
        initialData.min_teacher_load != null ? String(initialData.min_teacher_load) : ""
      );
      setMainBranchStudents(
        initialData.main_branch_students != null ? String(initialData.main_branch_students) : "358"
      );
      setXazinaBranchStudents(
        initialData.xazina_branch_students != null ? String(initialData.xazina_branch_students) : "88"
      );
      setNotes(initialData.notes || "");
    } else {
      setSnapshotDate(new Date().toISOString().split("T")[0]);
      setMonthlyRevenue("");
      setMonthlyExpenses("");
      setStandardCoursePrice("200000");
      setSpecialCoursePrice("250000");
      setMaxTeacherLoad("");
      setMinTeacherLoad("");
      setMainBranchStudents("358");
      setXazinaBranchStudents("88");
      setNotes("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      await onSave({
        id: initialData?.id,
        snapshot_date: snapshotDate,
        monthly_revenue: Number(monthlyRevenue) || 0,
        monthly_expenses: Number(monthlyExpenses) || 0,
        standard_course_price: Number(standardCoursePrice) || 200000,
        special_course_price: Number(specialCoursePrice) || 250000,
        course_prices: {
          "Standart kurs": Number(standardCoursePrice) || 200000,
          "Maxsus kurs": Number(specialCoursePrice) || 250000,
        },
        max_teacher_load: maxTeacherLoad ? Number(maxTeacherLoad) : null,
        min_teacher_load: minTeacherLoad ? Number(minTeacherLoad) : null,
        main_branch_students: mainBranchStudents ? Number(mainBranchStudents) : 0,
        xazina_branch_students: xazinaBranchStudents ? Number(xazinaBranchStudents) : 0,
        notes: notes.trim() || undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Moliya ma'lumotlarini saqlashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              {isEditing ? <Pencil className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-brand-dark">
                {isEditing ? "Moliya Snapshotini Tahrirlash" : "Yangi Moliya Snapshotini Qo'shish"}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? "Mavjud moliya ko'rsatkichlari va o'quvchilar sonini yangilash"
                  : "Moliya ko'rsatkichlari va o'quvchilar tarixini yangilash"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
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
          {/* Snapshot Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Snapshot Sanasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={snapshotDate}
              onChange={(e) => setSnapshotDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition bg-white"
              required
            />
          </div>

          {/* Group: AI tahlili va Moliya ko'rsatkichlari */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3.5">
            <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs uppercase tracking-wider border-b border-indigo-100 pb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI tahlili va Moliya ma&apos;lumotlari</span>
            </div>

            {/* 1 & 2. Oylik Daromad va Oylik Xarajat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  1. Oylik umumiy daromad (so&apos;m) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(e.target.value)}
                  placeholder="350000000"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs font-medium text-slate-800 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  2. Oylik umumiy xarajat (so&apos;m) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  placeholder="210000000"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs font-medium text-slate-800 outline-none transition"
                />
              </div>
            </div>

            {/* 3 & 4. Standart kurs narxi va Maxsus kurs narxi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  3. Standart kurs narxi (so&apos;m)
                </label>
                <input
                  type="number"
                  value={standardCoursePrice}
                  onChange={(e) => setStandardCoursePrice(e.target.value)}
                  placeholder="200000"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs font-medium text-slate-800 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  4. Maxsus kurs narxi (so&apos;m)
                </label>
                <input
                  type="number"
                  value={specialCoursePrice}
                  onChange={(e) => setSpecialCoursePrice(e.target.value)}
                  placeholder="250000"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs font-medium text-slate-800 outline-none transition"
                />
              </div>
            </div>

            {/* 5 & 6. Eng band va Eng bo'sh ustoz yuklamasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  5. Eng band ustoz (o&apos;quvchi soni)
                </label>
                <input
                  type="number"
                  value={maxTeacherLoad}
                  onChange={(e) => setMaxTeacherLoad(e.target.value)}
                  placeholder="92"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs font-medium text-slate-800 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  6. Eng bo&apos;sh ustoz (o&apos;quvchi soni)
                </label>
                <input
                  type="number"
                  value={minTeacherLoad}
                  onChange={(e) => setMinTeacherLoad(e.target.value)}
                  placeholder="28"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs font-medium text-slate-800 outline-none transition"
                />
              </div>
            </div>

            {/* 7 & 8. Filiallardagi o'quvchilar soni (Editable per month) */}
            <div className="pt-2 border-t border-indigo-100/80">
              <span className="block text-[11px] font-bold text-indigo-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Filiallardagi joriy o&apos;quvchilar soni (Ushbu oy uchun):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Asosiy filial — O&apos;quvchilar soni
                  </label>
                  <input
                    type="number"
                    value={mainBranchStudents}
                    onChange={(e) => setMainBranchStudents(e.target.value)}
                    placeholder="358"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs font-medium text-slate-800 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Xazina filial — O&apos;quvchilar soni
                  </label>
                  <input
                    type="number"
                    value={xazinaBranchStudents}
                    onChange={(e) => setXazinaBranchStudents(e.target.value)}
                    placeholder="88"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs font-medium text-slate-800 outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Izoh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Izoh / Eslatmalar (Ixtiyoriy)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ushbu oydagi asosiy moliyaviy o'zgarishlar..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm font-medium text-slate-800 outline-none transition leading-relaxed resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-dark hover:bg-emerald-950 text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Saqlanmoqda..." : isEditing ? "O'zgarishlarni saqlash" : "Snapshotni saqlash"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
