"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span>O&apos;chirishni tasdiqlang</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-2">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {description || "Ushbu ma'lumotni o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            {isDeleting ? (
              <span>O&apos;chirilmoqda...</span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ha, o&apos;chirilsin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
