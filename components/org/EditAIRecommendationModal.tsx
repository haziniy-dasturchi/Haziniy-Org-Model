"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Sparkles,
  Save,
  Building2,
  Briefcase,
  Layers,
  AlertCircle,
  CheckCheck,
  PlusCircle,
} from "lucide-react";
import {
  OrgStructureRecommendationItem,
  Department,
  Position,
  TheoryBasisType,
} from "@/types";

interface EditAIRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OrgStructureRecommendationItem | null;
  departments: (Department & { positions?: Position[] })[];
  onSave: (
    itemId: string,
    updates: Partial<OrgStructureRecommendationItem>
  ) => Promise<{ success: boolean; error?: string }>;
}

export function EditAIRecommendationModal({
  isOpen,
  onClose,
  item,
  departments,
  onSave,
}: EditAIRecommendationModalProps) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [selectedPosId, setSelectedPosId] = useState<string>("");
  const [suggestedPositionTitle, setSuggestedPositionTitle] = useState("");
  const [isCustomPosition, setIsCustomPosition] = useState(false);
  const [targetDepartmentId, setTargetDepartmentId] = useState("");
  const [theoryBasis, setTheoryBasis] = useState<TheoryBasisType>("vysotskiy");
  const [priority, setPriority] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Flatten all available positions from departments
  const allPositions = useMemo(() => {
    const list: {
      id: string;
      title: string;
      departmentId: string;
      departmentName: string;
      status?: string;
    }[] = [];

    departments.forEach((d: any) => {
      if (Array.isArray(d.positions)) {
        d.positions.forEach((p: Position) => {
          list.push({
            id: p.id,
            title: p.title,
            departmentId: d.id,
            departmentName: d.name,
            status: p.status,
          });
        });
      }
    });
    return list;
  }, [departments]);

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setText(item.text || "");
      setTheoryBasis(item.theory_basis || "vysotskiy");
      setPriority(item.priority || 1);
      setErrorMsg(null);

      const initialDeptId = item.target_department_id || departments[0]?.id || "";
      setTargetDepartmentId(initialDeptId);

      const posTitle = (item.suggested_position_title || "").trim();
      setSuggestedPositionTitle(posTitle);

      // Check if suggested position matches an existing model position
      if (item.suggested_position_id) {
        setSelectedPosId(item.suggested_position_id);
        setIsCustomPosition(false);
      } else if (posTitle) {
        const matched = allPositions.find(
          (p) => p.title.trim().toLowerCase() === posTitle.toLowerCase()
        );
        if (matched) {
          setSelectedPosId(matched.id);
          setIsCustomPosition(false);
          if (matched.departmentId) setTargetDepartmentId(matched.departmentId);
        } else {
          setSelectedPosId("__custom__");
          setIsCustomPosition(true);
        }
      } else {
        setSelectedPosId("");
        setIsCustomPosition(false);
      }
    }
  }, [item, departments, allPositions]);

  if (!isOpen || !item) return null;

  // Handle position select from dropdown
  const handlePositionDropdownChange = (val: string) => {
    if (val === "__custom__") {
      setSelectedPosId("__custom__");
      setIsCustomPosition(true);
      setSuggestedPositionTitle("");
    } else if (!val) {
      setSelectedPosId("");
      setIsCustomPosition(false);
      setSuggestedPositionTitle("");
    } else {
      setSelectedPosId(val);
      setIsCustomPosition(false);
      const matched = allPositions.find((p) => p.id === val);
      if (matched) {
        setSuggestedPositionTitle(matched.title);
        setTargetDepartmentId(matched.departmentId);
      }
    }
  };

  // Handle department select
  const handleDepartmentChange = (deptId: string) => {
    setTargetDepartmentId(deptId);
    // If the selected position does not belong to this department and is not custom, update or clear
    if (selectedPosId && selectedPosId !== "__custom__") {
      const pos = allPositions.find((p) => p.id === selectedPosId);
      if (pos && pos.departmentId !== deptId) {
        const firstDeptPos = allPositions.find((p) => p.departmentId === deptId);
        if (firstDeptPos) {
          setSelectedPosId(firstDeptPos.id);
          setSuggestedPositionTitle(firstDeptPos.title);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Tavsiya sarlavhasini kiriting");
      return;
    }
    if (!text.trim()) {
      setErrorMsg("AI xulosasi / tavsiya matnini kiriting");
      return;
    }
    if (!suggestedPositionTitle.trim()) {
      setErrorMsg("Tavsiya etilayotgan lavozimni tanlang yoki kiriting");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);
      const selectedDept = departments.find((d) => d.id === targetDepartmentId);
      
      const res = await onSave(item.id, {
        title: title.trim(),
        text: text.trim(),
        suggested_position_id: selectedPosId !== "__custom__" ? selectedPosId : undefined,
        suggested_position_title: suggestedPositionTitle.trim(),
        target_department_id: targetDepartmentId || null,
        target_department_name: selectedDept?.name || null,
        theory_basis: theoryBasis,
        priority: Number(priority) || 1,
      });

      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || "Saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Saqlashda kutilmagan xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-950/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-dark via-emerald-950 to-brand-dark text-white flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-brand-accent border border-white/10 shadow-inner">
              <Sparkles className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                AI Xulosasini Tahrirlash va Tasdiqlash
              </h3>
              <p className="text-xs text-emerald-200/80">
                Lavozimni tanlang, tahrirlang va Hozirgi Org Modelga mavjud holatda qo&apos;shing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sarlavha */}
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
              Tavsiya Sarlavhasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Tozalovchi (Farrosh) lavozimini joriy etish"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-hidden text-slate-800 font-medium text-sm transition"
              required
            />
          </div>

          {/* AI Xulosasi / Tavsiya Matni */}
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
              AI Xulosasi va Asoslash Matni <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Holat va muammo, nima uchun bu xodim kerakligi hamda aniq harakat..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-hidden text-slate-800 text-sm leading-relaxed transition resize-none"
              required
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Format: 1-2 gapda mavjud holat, yuzaga kelayotgan xavf va tavsiya etiladigan chora.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tavsiya etilayotgan lavozim (Namunadagi lavozimlar dropdown) - Full Width */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
                Tavsiya Etilayotgan Lavozim (Namunadagi lavozimlar) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedPosId}
                  onChange={(e) => handlePositionDropdownChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-hidden text-slate-800 font-semibold text-sm transition bg-white appearance-none cursor-pointer"
                  required
                >
                  <option value="">Lavozimni tanlang...</option>
                  {departments.map((dept: any) => {
                    const deptPositions = (dept.positions || []) as Position[];
                    if (deptPositions.length === 0) return null;
                    return (
                      <optgroup key={dept.id} label={`${dept.name} bo'limi (${deptPositions.length} ta lavozim)`}>
                        {deptPositions.map((pos) => (
                          <option key={pos.id} value={pos.id}>
                            {pos.title} — {dept.name} bo&apos;limi {pos.status === "rejalashtirilgan" ? "(Rejadagi)" : "(Mavjud)"}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                  <option value="__custom__">➕ Boshqa yangi lavozim yozish...</option>
                </select>
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>

              {/* Custom position title text input if custom selected */}
              {isCustomPosition && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <div className="relative">
                    <input
                      type="text"
                      value={suggestedPositionTitle}
                      onChange={(e) => setSuggestedPositionTitle(e.target.value)}
                      placeholder="Yangi lavozim nomini kiriting..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-emerald-300 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-hidden text-slate-800 font-medium text-xs bg-emerald-50/40 transition"
                      required
                    />
                    <PlusCircle className="w-3.5 h-3.5 text-brand-accent absolute left-3 top-3" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nazariy Metodologiya */}
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
                Nazariy Metodologiya
              </label>
              <div className="relative">
                <select
                  value={theoryBasis}
                  onChange={(e) => setTheoryBasis(e.target.value as TheoryBasisType)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-hidden text-slate-800 font-medium text-sm transition bg-white appearance-none cursor-pointer"
                >
                  <option value="vysotskiy">Vysotskiy 7 ta yo&apos;nalish</option>
                  <option value="span_of_control">Nazorat Radiusi</option>
                  <option value="face_overlap">FACe / Vazifalar Chatishmasi</option>
                  <option value="greiner">Greiner Bosqichi</option>
                </select>
                <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Prioritet */}
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
                Prioritet (Top-1, Top-2, Top-3)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-hidden text-slate-800 font-medium text-sm transition bg-white cursor-pointer"
              >
                <option value={1}>#1 — O&apos;ta muhim (Shoshilinch zarur)</option>
                <option value={2}>#2 — Muhim (Keyingi qadam)</option>
                <option value={3}>#3 — O&apos;rta (Kengaytirish bosqichi)</option>
              </select>
            </div>
          </div>

          {/* Explanation Alert Box */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Eslatma:</strong> Tahrirlangan ma&apos;lumotlar saqlanadi. Ushbu lavozimni tashkiliy tuzilmaga qo&apos;shish uchun tavsiya kartasidagi <strong>&quot;Bajarildi deb belgilash&quot;</strong> tugmasini bosing.
            </p>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-dark hover:bg-emerald-950 text-white text-xs font-bold transition shadow-md shadow-brand-dark/15 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4 text-brand-accent" />
              <span>{isSaving ? "Saqlanmoqda..." : "Tahrirni Saqlash"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

