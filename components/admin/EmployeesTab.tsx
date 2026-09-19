"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Users, Search, ExternalLink, Phone, Calendar } from "lucide-react";
import { Employee, Position, Department } from "@/types";
import { EmployeeModal } from "./EmployeeModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { useToast } from "./ToastContext";

interface EmployeesTabProps {
  employees: (Employee & { position?: Position & { department?: Department } })[];
  positions: (Position & { department?: Department })[];
  onRefresh: () => Promise<void>;
  onEmployeeSaved?: (emp: Employee) => void;
  onEmployeeDeleted?: (id: string) => void;
}

function getInitials(name: string): string {
  if (!name) return "X";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function EmployeesTab({
  employees,
  positions,
  onRefresh,
  onEmployeeSaved,
  onEmployeeDeleted,
}: EmployeesTabProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = employees.filter((emp) =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.phone && emp.phone.includes(searchTerm)) ||
    (emp.position?.title && emp.position.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setSelectedEmp(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmp(emp);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Employee>) => {
    const isEdit = !!data.id;
    const url = isEdit ? `/api/employees/${data.id}` : "/api/employees";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok || resData.error) {
      throw new Error(resData.error || "Xodimni saqlashda xatolik");
    }

    if (resData.employee && onEmployeeSaved) {
      onEmployeeSaved(resData.employee);
    } else if (onEmployeeSaved && data.id) {
      onEmployeeSaved(data as Employee);
    }

    showToast(isEdit ? "Xodim ma'lumotlari muvaffaqiyatli yangilandi!" : "Yangi xodim muvaffaqiyatli qo'shildi!");
    await onRefresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/employees/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || "Xodimni o'chirib bo'lmadi");
      }

      if (onEmployeeDeleted) {
        onEmployeeDeleted(deleteTarget.id);
      }

      showToast("Xodim muvaffaqiyatli o'chirildi!");
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
            <Users className="w-5 h-5 text-amber-600" />
            <span>Xodimlar ({employees.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Barcha xodimlarning shaxsiy profillari, fotosuratlari va YQMlari
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-dark hover:bg-emerald-950 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Xodim qo&apos;shish</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Xodim F.I.Sh, lavozimi yoki telefoni bo'yicha qidirish..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-brand-accent shadow-2xs transition"
        />
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Xodim F.I.Sh</th>
                <th className="py-3.5 px-4 sm:px-6">Lavozim & Bo&apos;lim</th>
                <th className="py-3.5 px-4 sm:px-6">Telefon</th>
                <th className="py-3.5 px-4 sm:px-6">Shaxsiy YQM</th>
                <th className="py-3.5 px-4 sm:px-6 text-right w-36">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((emp) => {
                  const pos = emp.position || positions.find((p) => p.id === emp.position_id);
                  const dept = pos?.department;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {emp.photo_url ? (
                              <img
                                src={emp.photo_url}
                                alt={emp.full_name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black flex items-center justify-center shadow-2xs">
                                {getInitials(emp.full_name)}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-brand-dark block leading-tight">
                              {emp.full_name}
                            </span>
                            {emp.hired_at && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                {emp.hired_at}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6">
                        {pos ? (
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">
                              {pos.title}
                            </span>
                            {dept && (
                              <span
                                className="inline-block text-[10px] font-bold text-white px-2 py-0.5 rounded-full mt-0.5"
                                style={{ backgroundColor: dept.color_hex || "#1D4ED8" }}
                              >
                                {dept.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Lavozimsiz</span>
                        )}
                      </td>

                      <td className="py-4 px-4 sm:px-6">
                        {emp.phone ? (
                          <span className="font-mono text-xs text-slate-600 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {emp.phone}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 sm:px-6 max-w-xs">
                        {emp.personal_yqm ? (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {emp.personal_yqm}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-400 italic">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/xodim/${emp.id}`}
                            target="_blank"
                            title="Profilni ko'rish"
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-brand-accent transition cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(emp)}
                            title="Tahrirlash"
                            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-amber-600 transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(emp)}
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
                    Hech qanday xodim topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        employee={selectedEmp}
        positions={positions}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget ? `"${deleteTarget.full_name}" profilini o'chirish` : ""}
        description="Xodim ma'lumotlari bazadan butunlay o'chiriladi. Davom ettirasizmi?"
        isDeleting={isDeleting}
      />
    </div>
  );
}
