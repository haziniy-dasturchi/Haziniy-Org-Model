"use client";

import React, { useState } from "react";
import { Plus, TrendingUp, Calendar, Tag, FileText, Pencil, Trash2 } from "lucide-react";
import { FinanceModal } from "./FinanceModal";
import { useToast } from "./ToastContext";

interface FinanceSnapshot {
  id: string;
  snapshot_date: string;
  monthly_revenue: number;
  monthly_expenses: number;
  course_prices: Record<string, number>;
  max_teacher_load?: number | null;
  min_teacher_load?: number | null;
  main_branch_students?: number | null;
  xazina_branch_students?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface FinanceTabProps {
  snapshots: FinanceSnapshot[];
  onRefresh: () => Promise<void>;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

export function FinanceTab({ snapshots, onRefresh }: FinanceTabProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnapshot, setEditingSnapshot] = useState<FinanceSnapshot | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateNew = () => {
    setEditingSnapshot(null);
    setIsModalOpen(true);
  };

  const handleEdit = (snap: FinanceSnapshot) => {
    setEditingSnapshot(snap);
    setIsModalOpen(true);
  };

  const handleDelete = async (snap: FinanceSnapshot) => {
    if (!confirm(`${snap.snapshot_date} sanasidagi moliya snapshotini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    try {
      setDeletingId(snap.id);
      const res = await fetch(`/api/finance?id=${snap.id}`, {
        method: "DELETE",
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || "Snapshotni o'chirishda xatolik");
      }

      showToast("Moliya snapshoti o'chirildi!");
      await onRefresh();
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik yuz berdi");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (data: any) => {
    const isEdit = Boolean(data.id);
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch("/api/finance", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok || resData.error) {
      throw new Error(resData.error || "Snapshotni saqlashda xatolik");
    }

    showToast(isEdit ? "Moliya snapshoti muvaffaqiyatli yangilandi!" : "Yangi moliya snapshoti muvaffaqiyatli saqlandi!");
    await onRefresh();
  };

  const latestSnapshot = snapshots[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-brand-dark flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>Moliya Ko&apos;rsatkichlari & Snapshotlar ({snapshots.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kurs narxlari, oylik daromad, xarajatlar va o&apos;zgarishlar tarixi
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-dark hover:bg-emerald-950 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi snapshot qo&apos;shish</span>
        </button>
      </div>

      {/* Latest KPI Summary Cards */}
      {latestSnapshot && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Oxirgi Oylik Daromad
            </span>
            <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-600">
              {formatMoney(latestSnapshot.monthly_revenue)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Sana: {latestSnapshot.snapshot_date}
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Oxirgi Oylik Xarajat
            </span>
            <div className="mt-2 text-xl sm:text-2xl font-black text-rose-600">
              {formatMoney(latestSnapshot.monthly_expenses)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Sana: {latestSnapshot.snapshot_date}
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Sof Foyda (Tushum - Xarajat)
            </span>
            <div
              className={`mt-2 text-xl sm:text-2xl font-black ${
                latestSnapshot.monthly_revenue - latestSnapshot.monthly_expenses >= 0
                  ? "text-brand-dark"
                  : "text-rose-600"
              }`}
            >
              {formatMoney(latestSnapshot.monthly_revenue - latestSnapshot.monthly_expenses)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Oylik sof saldo
            </span>
          </div>
        </div>
      )}

      {/* Historical Snapshots List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Moliya Tarixi (Vaqt bo&apos;yicha snapshotlar)</span>
        </h3>

        <div className="space-y-3">
          {snapshots.length > 0 ? (
            snapshots.map((snap) => {
              const prices = snap.course_prices || {};
              const priceKeys = Object.keys(prices);
              const isDeleting = deletingId === snap.id;

              return (
                <div
                  key={snap.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 transition hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold">
                        {snap.snapshot_date}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        (Yaratilgan: {snap.created_at ? new Date(snap.created_at).toLocaleDateString("uz-UZ") : "—"})
                      </span>
                      {snap.updated_at && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-200/60">
                          Tahrirlangan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="text-emerald-700">
                          Daromad: {formatMoney(snap.monthly_revenue)}
                        </span>
                        <span className="text-rose-700">
                          Xarajat: {formatMoney(snap.monthly_expenses)}
                        </span>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleEdit(snap)}
                          title="Tahrirlash"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(snap)}
                          disabled={isDeleting}
                          title="O'chirish"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Course Prices */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Kurs narxlari:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {priceKeys.length > 0 ? (
                        priceKeys.map((k) => (
                          <div
                            key={k}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
                          >
                            <span className="text-slate-500">{k}:</span>
                            <strong className="text-brand-dark">{formatMoney(prices[k])}</strong>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Kurs narxlari kiritilmagan</span>
                      )}
                    </div>
                  </div>

                  {/* Branch students & Teacher loads */}
                  {(snap.main_branch_students != null || snap.max_teacher_load != null) && (
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {snap.main_branch_students != null && (
                        <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-medium">
                          Asosiy filial: <strong>{snap.main_branch_students}</strong> ta
                        </div>
                      )}
                      {snap.xazina_branch_students != null && (
                        <div className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                          Xazina filial: <strong>{snap.xazina_branch_students}</strong> ta
                        </div>
                      )}
                      {snap.max_teacher_load != null && (
                        <div className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-medium">
                          Eng band ustoz: <strong>{snap.max_teacher_load}</strong> ta | Eng bo&apos;sh: <strong>{snap.min_teacher_load || 0}</strong> ta
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {snap.notes && (
                    <div className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{snap.notes}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              Moliya snapshotlari mavjud emas. Yangi snapshot qo&apos;shing.
            </div>
          )}
        </div>
      </div>

      {/* Finance Modal */}
      <FinanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSnapshot(null);
        }}
        initialData={editingSnapshot}
        onSave={handleSave}
      />
    </div>
  );
}
