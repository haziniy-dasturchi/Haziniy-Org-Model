"use client";

import React, { useState } from "react";
import { Plus, Building2, Pencil, Trash2, Users, DoorClosed, Maximize2 } from "lucide-react";
import { Branch } from "@/types";
import { BranchModal } from "./BranchModal";
import { useToast } from "./ToastContext";

interface BranchesTabProps {
  branches: Branch[];
  onRefresh: () => Promise<void>;
  onBranchSaved?: (branch: Branch) => void;
  onBranchDeleted?: (id: string) => void;
}

export function BranchesTab({
  branches,
  onRefresh,
  onBranchSaved,
  onBranchDeleted,
}: BranchesTabProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateNew = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleDelete = async (branch: Branch) => {
    if (!confirm(`"${branch.name}" filialini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    try {
      setDeletingId(branch.id);
      const res = await fetch(`/api/branches?id=${branch.id}`, {
        method: "DELETE",
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || "Filialni o'chirishda xatolik");
      }

      if (onBranchDeleted) {
        onBranchDeleted(branch.id);
      }

      showToast("Filial muvaffaqiyatli o'chirildi!");
      onRefresh().catch(console.error);
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik yuz berdi");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (data: Partial<Branch>) => {
    const isEdit = Boolean(data.id);
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch("/api/branches", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok || resData.error) {
      throw new Error(resData.error || "Filialni saqlashda xatolik");
    }

    if (resData.branch && onBranchSaved) {
      onBranchSaved(resData.branch);
    } else if (onBranchSaved && data.id) {
      onBranchSaved(data as Branch);
    }

    showToast(isEdit ? "Filial muvaffaqiyatli yangilandi!" : "Yangi filial muvaffaqiyatli qo'shildi!");
    onRefresh().catch(console.error);
  };

  const totalStudents = branches.reduce((sum, b) => sum + (Number(b.student_count) || 0), 0);
  const totalCapacity = branches.reduce((sum, b) => sum + (Number(b.capacity_estimate) || 0), 0);
  const totalRooms = branches.reduce((sum, b) => sum + (Number(b.room_count) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-brand-dark flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-600" />
            <span>O&apos;quv Markaz Filiallari ({branches.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filiallar ro&apos;yxati, xonalar soni, o&apos;quvchilar soni va sig&apos;im boshqaruvi
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-dark hover:bg-emerald-950 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi filial qo&apos;shish</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Jami O&apos;quvchilar Soni
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-black text-brand-dark flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" />
            <span>{totalStudents} nafar</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Barcha filiallar bo&apos;yicha</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Maksimal Sig&apos;im
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-black text-indigo-600 flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-indigo-500" />
            <span>{totalCapacity} o&apos;rin</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Bandlik darajasi: {totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0}%
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Jami Xonalar Soni
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-black text-amber-600 flex items-center gap-2">
            <DoorClosed className="w-5 h-5 text-amber-500" />
            <span>{totalRooms} ta xona</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Filiallar infratuzilmasi</span>
        </div>
      </div>

      {/* Branches Table / Cards List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-600" />
            <span>Barcha Filiallar</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {branches.length > 0 ? (
            branches.map((branch) => {
              const isDeleting = deletingId === branch.id;
              const occupancy =
                branch.capacity_estimate > 0
                  ? Math.min(100, Math.round((branch.student_count / branch.capacity_estimate) * 100))
                  : 0;

              return (
                <div
                  key={branch.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-100 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>{branch.name}</span>
                        {occupancy >= 85 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                            Bandlik yuqori ({occupancy}%)
                          </span>
                        )}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-cyan-600" />
                          {branch.student_count} o&apos;quvchi
                        </span>
                        <span className="flex items-center gap-1">
                          <DoorClosed className="w-3.5 h-3.5 text-slate-400" />
                          {branch.room_count} xona
                        </span>
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                          Sig&apos;im: {branch.capacity_estimate} o&apos;rin
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleEdit(branch)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(branch)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>O&apos;chirish</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Filiallar mavjud emas. Yangi filial qo&apos;shing.
            </div>
          )}
        </div>
      </div>

      {/* Branch Modal */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBranch(null);
        }}
        initialData={editingBranch}
        onSave={handleSave}
      />
    </div>
  );
}
