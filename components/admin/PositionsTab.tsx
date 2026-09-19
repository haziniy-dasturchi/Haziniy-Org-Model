"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Briefcase, Search, Filter, Building2 } from "lucide-react";
import { Position, Department, Branch } from "@/types";
import { PositionModal } from "./PositionModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { useToast } from "./ToastContext";

interface PositionsTabProps {
  positions: (Position & { department?: Department; branch?: Branch | null })[];
  departments: Department[];
  branches?: Branch[];
  onRefresh: () => Promise<void>;
}

export function PositionsTab({ positions, departments, branches = [], onRefresh }: PositionsTabProps) {

  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = positions.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.yqm_text && p.yqm_text.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = deptFilter === "all" || p.department_id === deptFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenAdd = () => {
    setSelectedPos(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pos: Position) => {
    setSelectedPos(pos);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Position>) => {
    const isEdit = !!data.id;
    const url = isEdit ? `/api/positions/${data.id}` : "/api/positions";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok || resData.error) {
      throw new Error(resData.error || "Lavozimni saqlashda xatolik");
    }

    showToast(isEdit ? "Lavozim muvaffaqiyatli yangilandi!" : "Yangi lavozim muvaffaqiyatli qo'shildi!");
    await onRefresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/positions/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || "Lavozimni o'chirib bo'lmadi");
      }

      showToast("Lavozim muvaffaqiyatli o'chirildi!");
      setDeleteTarget(null);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-brand-dark flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <span>Lavozimlar ({positions.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mavjud va rejalashtirilgan barcha shtat lavozimlari va YQMlari
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-dark hover:bg-emerald-950 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lavozim qo&apos;shish</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Lavozim nomi yoki YQM bo'yicha..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-brand-accent shadow-2xs transition"
          />
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-brand-accent shadow-2xs transition"
          >
            <option value="all">Barcha bo&apos;limlar</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} bo&apos;limi
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-brand-accent shadow-2xs transition"
          >
            <option value="all">Barcha holatlar (Status)</option>
            <option value="mavjud">Mavjud lavozimlar</option>
            <option value="rejalashtirilgan">Rejalashtirilgan (Vakansiyalar)</option>
          </select>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Lavozim nomi</th>
                <th className="py-3.5 px-4 sm:px-6">Bo&apos;lim</th>
                <th className="py-3.5 px-4 sm:px-6">Holati</th>
                <th className="py-3.5 px-4 sm:px-6">YQM</th>
                <th className="py-3.5 px-4 sm:px-6 text-right w-28">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((pos) => {
                  const dept = pos.department || departments.find((d) => d.id === pos.department_id);
                  const isPlanned = pos.status === "rejalashtirilgan";

                  return (
                    <tr key={pos.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-brand-dark">{pos.title}</span>
                          {pos.branch ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 w-fit">
                              <Building2 className="w-3 h-3" />
                              {pos.branch.name}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        {dept ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: dept.color_hex || "#003933" }}
                          >
                            {dept.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isPlanned
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-brand-accent/20 text-brand-dark border border-brand-accent/30"
                          }`}
                        >
                          {isPlanned ? "Rejalashtirilgan" : "Mavjud"}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 max-w-md">
                        {pos.yqm_text ? (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {pos.yqm_text}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-400 italic">YQM kiritilmagan</span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(pos)}
                            title="Tahrirlash"
                            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-brand-dark transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(pos)}
                            title="O'chirish"
                            className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    Hech qanday lavozim topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <PositionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        position={selectedPos}
        departments={departments}
        branches={branches}
      />


      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget ? `"${deleteTarget.title}" lavozimini o'chirish` : ""}
        description="Ushbu lavozimni o'chirish xodimlar bog'lanishiga ta'sir qilishi mumkin. Davom ettirasizmi?"
        isDeleting={isDeleting}
      />
    </div>
  );
}
