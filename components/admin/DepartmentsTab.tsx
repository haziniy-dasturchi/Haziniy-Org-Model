"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Layers, Search, Building2 } from "lucide-react";
import { Department, Branch, isDepartmentInBranch } from "@/types";
import { DepartmentModal } from "./DepartmentModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { useToast } from "./ToastContext";

interface DepartmentsTabProps {
  departments: Department[];
  branches?: Branch[];
  selectedBranchId?: string;
  onBranchChange?: (branchId: string) => void;
  onRefresh: () => Promise<void>;
  onDepartmentSaved?: (dept: Department) => void;
  onDepartmentDeleted?: (id: string) => void;
}

export function DepartmentsTab({
  departments,
  branches = [],
  selectedBranchId = "all",
  onBranchChange,
  onRefresh,
  onDepartmentSaved,
  onDepartmentDeleted,
}: DepartmentsTabProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const [activeBranch, setActiveBranch] = useState<string>(selectedBranchId);

  useEffect(() => {
    setActiveBranch(selectedBranchId);
  }, [selectedBranchId]);

  const handleBranchSelect = (branchId: string) => {
    setActiveBranch(branchId);
    try {
      localStorage.setItem("haziniy_admin_selected_branch", branchId);
      localStorage.setItem("haziniy_selected_branch", branchId);
    } catch {}
    if (onBranchChange) {
      onBranchChange(branchId);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filial bo'yicha saralash
  const branchFiltered = activeBranch === "all"
    ? departments
    : departments.filter((d) => isDepartmentInBranch(d, activeBranch));

  const filtered = branchFiltered.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.yqm_text && d.yqm_text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setSelectedDept(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setSelectedDept(dept);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Department>) => {
    const isEdit = !!data.id;
    const url = isEdit ? `/api/departments/${data.id}` : "/api/departments";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok || resData.error) {
      throw new Error(resData.error || "Bo'limni saqlashda xatolik");
    }

    if (resData.department && onDepartmentSaved) {
      onDepartmentSaved(resData.department);
    } else if (onDepartmentSaved && data.id) {
      onDepartmentSaved(data as Department);
    }

    showToast(isEdit ? "Bo'lim muvaffaqiyatli yangilandi!" : "Yangi bo'lim muvaffaqiyatli qo'shildi!");
    onRefresh().catch(console.error);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/departments/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || "Bo'limni o'chirib bo'lmadi");
      }

      if (onDepartmentDeleted) {
        onDepartmentDeleted(deleteTarget.id);
      }

      showToast("Bo'lim muvaffaqiyatli o'chirildi!");
      setDeleteTarget(null);
      onRefresh().catch(console.error);
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
            <Layers className="w-5 h-5 text-brand-accent" />
            <span>Tashkiliy Bo&apos;limlar ({branchFiltered.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeBranch === "all"
              ? "Barcha filiallar bo'yicha tashkiliy bo'limlar ro'yxati va YQMlari"
              : `${branches.find((b) => b.id === activeBranch)?.name || "Filial"} bo'yicha tuzilgan bo'limlar va YQMlari`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-dark hover:bg-emerald-950 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Bo&apos;lim qo&apos;shish</span>
        </button>
      </div>

      {/* Branch Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2 pr-1 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          Filial:
        </span>
        <button
          type="button"
          onClick={() => handleBranchSelect("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeBranch === "all"
              ? "bg-brand-dark text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
          }`}
        >
          Umumiy ({departments.length})
        </button>
        {branches.map((b) => {
          const count = departments.filter((d) => isDepartmentInBranch(d, b.id)).length;
          const isActive = activeBranch === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => handleBranchSelect(b.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-brand-dark text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
              }`}
            >
              {b.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Bo'lim nomi yoki YQM bo'yicha qidirish..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-brand-accent focus:ring-2 focus:ring-blue-100 shadow-2xs transition"
        />
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4 sm:px-6 w-16">Tartib</th>
                <th className="py-3.5 px-4 sm:px-6">Bo&apos;lim nomi</th>
                <th className="py-3.5 px-4 sm:px-6">Filial</th>
                <th className="py-3.5 px-4 sm:px-6">Rang</th>
                <th className="py-3.5 px-4 sm:px-6">Yakuniy Qiymatli Mahsulot (YQM)</th>
                <th className="py-3.5 px-4 sm:px-6 text-right w-28">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((dept) => {
                  const isUniversal = !dept.branch_id || dept.branch_id === "all" || (dept.branch_ids && dept.branch_ids.includes("all"));
                  const branchName = branches.find((b) => b.id === dept.branch_id)?.name || (dept.branch_ids && branches.find(b => dept.branch_ids?.includes(b.id))?.name);

                  return (
                    <tr key={dept.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 sm:px-6 font-mono text-slate-400 font-bold">
                        #{dept.sort_order ?? 0}
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                            style={{ backgroundColor: dept.color_hex || "#1D4ED8" }}
                          />
                          <span className="font-bold text-brand-dark">{dept.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        {isUniversal ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Barcha filiallar
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                            <Building2 className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                            {branchName || "Maxsus filial"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-mono text-[11px] text-slate-500">
                        {dept.color_hex || "#1D4ED8"}
                      </td>
                      <td className="py-4 px-4 sm:px-6 max-w-md">
                        {dept.yqm_text ? (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {dept.yqm_text}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-400 italic">YQM kiritilmagan</span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(dept)}
                            title="Tahrirlash"
                            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-brand-accent transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(dept)}
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
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    Hech qanday bo&apos;lim topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        department={selectedDept}
        branches={branches}
        defaultBranchId={activeBranch}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget ? `"${deleteTarget.name}" bo'limini o'chirish` : ""}
        description="Ushbu bo'limni o'chirish unga biriktirilgan lavozimlarga ta'sir qilishi mumkin. Davom ettirasizmi?"
        isDeleting={isDeleting}
      />
    </div>
  );
}
