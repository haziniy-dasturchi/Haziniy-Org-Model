"use client";

import React, { useState, useEffect } from "react";
import { X, Building2, Save, Pencil } from "lucide-react";
import { Branch } from "@/types";

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Branch>) => Promise<void>;
  initialData?: Branch | null;
}

export function BranchModal({ isOpen, onClose, onSave, initialData }: BranchModalProps) {
  const [name, setName] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [roomCount, setRoomCount] = useState("");
  const [capacityEstimate, setCapacityEstimate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setStudentCount(initialData.student_count != null ? String(initialData.student_count) : "0");
      setRoomCount(initialData.room_count != null ? String(initialData.room_count) : "0");
      setCapacityEstimate(
        initialData.capacity_estimate != null ? String(initialData.capacity_estimate) : "0"
      );
    } else {
      setName("");
      setStudentCount("0");
      setRoomCount("1");
      setCapacityEstimate("100");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Filial nomi kiritilishi shart");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await onSave({
        id: initialData?.id,
        name: name.trim(),
        student_count: Number(studentCount) || 0,
        room_count: Number(roomCount) || 0,
        capacity_estimate: Number(capacityEstimate) || 0,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Filial ma'lumotlarini saqlashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              {isEditing ? <Pencil className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-brand-dark">
                {isEditing ? "Filialni Tahrirlash" : "Yangi Filial Qo'shish"}
              </h2>
              <p className="text-xs text-slate-500">Filial ko&apos;rsatkichlarini boshqarish</p>
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
          {/* Filial Nomi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Filial Nomi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Asosiy filial yoki Chilonzor filiali"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* O'quvchilar soni */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Joriy O&apos;quvchilar Soni
              </label>
              <input
                type="number"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
                placeholder="358"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition bg-white"
              />
            </div>

            {/* Xonalar soni */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Xonalar Soni
              </label>
              <input
                type="number"
                value={roomCount}
                onChange={(e) => setRoomCount(e.target.value)}
                placeholder="6"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition bg-white"
              />
            </div>
          </div>

          {/* Maksimal Sig'im */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Maksimal Sig&apos;im (O&apos;quvchi o&apos;rni)
            </label>
            <input
              type="number"
              value={capacityEstimate}
              onChange={(e) => setCapacityEstimate(e.target.value)}
              placeholder="960"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 outline-none transition bg-white"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              AI o&apos;sish va kengayish strategiyasini hisoblashda ushbu sig&apos;imdan foydalanadi.
            </span>
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
              <span>{isLoading ? "Saqlanmoqda..." : isEditing ? "O'zgarishlarni saqlash" : "Filialni saqlash"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
