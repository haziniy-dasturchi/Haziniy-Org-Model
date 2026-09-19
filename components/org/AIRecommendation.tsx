"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  CheckCheck,
  CheckCircle2,
  Building2,
  Edit3,
  Shield,
  Users2,
  GitBranch,
} from "lucide-react";
import {
  OrgStructureAnalysis,
  OrgStructureRecommendationItem,
  Department,
  TheoryBasisType,
} from "@/types";
import { EditAIRecommendationModal } from "./EditAIRecommendationModal";

interface AIRecommendationProps {
  recommendation?: OrgStructureAnalysis | null;
  departments?: Department[];
  isAdmin?: boolean;
}

export function AIRecommendation({
  recommendation: initialRec,
  departments = [],
  isAdmin = false,
}: AIRecommendationProps) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<OrgStructureAnalysis | null>(initialRec || null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [resolvingItemId, setResolvingItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<OrgStructureRecommendationItem | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const res = await fetch("/api/org-structure-analysis", { method: "POST" });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setSuccessMsg("Tashkiliy tuzilma AI tahlili yangilandi!");
        setTimeout(() => setSuccessMsg(null), 4000);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to regenerate org analysis:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleResolve = async (item: OrgStructureRecommendationItem) => {
    try {
      setResolvingItemId(item.id);
      const res = await fetch("/api/org-structure-analysis", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.id }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setSuccessMsg(
          data.message || `"${item.suggested_position_title || item.title}" lavozimi Hozirgi Org Modelga qo'shildi (mavjud holatga o'tdi)!`
        );
        setTimeout(() => setSuccessMsg(null), 6000);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to resolve recommendation:", err);
    } finally {
      setResolvingItemId(null);
    }
  };

  const handleSaveEditedRecommendation = async (
    itemId: string,
    updates: Partial<OrgStructureRecommendationItem>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/org-structure-analysis", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, updates }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.analysis) {
        setAnalysis(data.analysis);
        setSuccessMsg("AI tavsiyasi muvaffaqiyatli tahrirlandi va saqlandi!");
        setTimeout(() => setSuccessMsg(null), 5000);
        router.refresh();
        return { success: true };
      }
      return {
        success: false,
        error: data.error || `Saqlashda xatolik yuz berdi (${res.status})`,
      };
    } catch (err: any) {
      console.error("Failed to save edited recommendation:", err);
      return {
        success: false,
        error: err.message || "Server bilan bog'lanishda xatolik yuz berdi",
      };
    }
  };

  if (!analysis || !analysis.recommendations || analysis.recommendations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
          <Sparkles className="h-6 w-6 text-brand-accent" />
        </div>
        <h3 className="text-sm font-bold text-brand-dark">Tuzilmaviy AI Tahlili</h3>
        <p className="mt-1 text-xs text-slate-500 mb-4">
          Hozircha tizimda faol tashkiliy tavsiyalar mavjud emas.
        </p>
        {isAdmin && (
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold shadow-xs hover:bg-emerald-950 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-accent ${isRegenerating ? "animate-spin" : ""}`} />
            Tahlilni shakllantirish
          </button>
        )}
      </div>
    );
  }

  function formatUzDate(dateStr: string | undefined): string | null {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      const months = [
        "yanvar", "fevral", "mart", "aprel", "may", "iyun",
        "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
      ];
      return `${d.getDate()}-${months[d.getMonth()]}, ${d.getFullYear()}`;
    } catch {
      return null;
    }
  }

  const formattedDate = formatUzDate(analysis.generated_at);
  const items = analysis.recommendations || [];

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-emerald-950/10 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 p-6 sm:p-8 shadow-sm">
        {/* Decorative ambient glow */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-brand-dark/5 blur-3xl pointer-events-none" />

        {/* Success Notification Alert */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-brand-accent/40 px-4 py-3.5 text-xs sm:text-sm font-bold text-brand-dark animate-in fade-in shadow-xs">
            <CheckCheck className="w-4 h-4 text-brand-accent shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-dark text-brand-accent shadow-md shadow-brand-dark/15 border border-emerald-800">
              <Sparkles className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-brand-dark">
                  Keyingi Qadam — AI Tahlili
                </h3>
                <span className="inline-flex items-center rounded-full bg-brand-accent/15 px-2.5 py-0.5 text-[11px] font-bold text-brand-dark border border-brand-accent/30">
                  Top-{items.length} Tavsiya
                </span>
              </div>
              {formattedDate && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Tahlil sanasi: {formattedDate}
                </p>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isAdmin && (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-dark hover:bg-emerald-950 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-accent ${isRegenerating ? "animate-spin" : ""}`} />
                <span>{isRegenerating ? "Tahlil qilinmoqda..." : "Yangilash (AI)"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Summary Overview */}
        {analysis.summary_text && (
          <div className="relative z-10 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-white/95 rounded-2xl p-4 sm:p-5 border border-emerald-950/10 shadow-2xs mb-5">
            <div className="flex items-center gap-2 text-brand-dark font-bold text-xs uppercase tracking-wider mb-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-accent" />
              <span>Tuzilmaviy Xulosa</span>
            </div>
            <p className="leading-relaxed text-slate-800 font-medium">
              {analysis.summary_text}
            </p>
          </div>
        )}

        {/* Recommendation Cards */}
        <div className="relative z-10 space-y-4">
          {items.map((item, index) => (
            <OrgRecommendationCard
              key={item.id || index}
              item={item}
              rankIndex={index + 1}
              isAdmin={isAdmin}
              isResolving={resolvingItemId === item.id}
              onResolve={() => handleResolve(item)}
              onEditRecommendation={() => setEditingItem(item)}
            />
          ))}
        </div>
      </div>

      {/* Edit Recommendation Modal */}
      {editingItem && (
        <EditAIRecommendationModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          departments={departments}
          onSave={handleSaveEditedRecommendation}
        />
      )}
    </>
  );
}

function OrgRecommendationCard({
  item,
  rankIndex,
  isAdmin = false,
  isResolving = false,
  onResolve,
  onEditRecommendation,
}: {
  item: OrgStructureRecommendationItem;
  rankIndex: number;
  isAdmin?: boolean;
  isResolving?: boolean;
  onResolve: () => void;
  onEditRecommendation: () => void;
}) {
  const theoryBadge = getTheoryBadge(item.theory_basis || "vysotskiy");

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 shadow-2xs hover:shadow-md ${
        item.is_resolved
          ? "bg-slate-50/90 border-slate-200 opacity-80"
          : "bg-white border-emerald-950/10 hover:border-brand-accent/40"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
        {/* Title and Theory Tag */}
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-dark text-brand-accent font-black text-xs shadow-xs border border-emerald-800">
            #{rankIndex}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${theoryBadge.color}`}
              >
                {theoryBadge.icon}
                {theoryBadge.label}
              </span>

              {item.target_department_name && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  {item.target_department_name}
                </span>
              )}

              {item.is_resolved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5">
                  <CheckCircle2 className="w-3 h-3 text-brand-accent" />
                  Bajarildi
                </span>
              )}
            </div>

            <h5 className="text-sm sm:text-base font-bold text-brand-dark">
              {item.title}
            </h5>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          {isAdmin && (
            <button
              type="button"
              onClick={onEditRecommendation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-emerald-50 hover:border-brand-accent/40 text-brand-dark text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-brand-accent" />
              <span>AI xulosasini tahrirlash</span>
            </button>
          )}

          {isAdmin && !item.is_resolved && (
            <button
              type="button"
              onClick={onResolve}
              disabled={isResolving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-accent/40 bg-emerald-50 hover:bg-emerald-100 text-brand-dark text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5 text-brand-accent" />
              <span>{isResolving ? "Saqlanmoqda..." : "Bajarildi deb belgilash"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Direct punchy 1-2 sentence recommendation text */}
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal mt-2">
        {item.text}
      </p>

      {/* Suggested Position Info Tag */}
      {item.suggested_position_title && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
          <ArrowRight className="w-3.5 h-3.5 text-brand-accent shrink-0" />
          <span>
            Tavsiya etilayotgan lavozim:{" "}
            <strong className="text-brand-dark font-bold">
              {item.suggested_position_title}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

function getTheoryBadge(basis?: TheoryBasisType) {
  switch (basis) {
    case "vysotskiy":
      return {
        label: "Vysotskiy 7 ta yo'nalish",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        icon: <Layers className="w-3 h-3 text-brand-accent" />,
      };
    case "span_of_control":
      return {
        label: "Nazorat Radiusi",
        color: "bg-blue-50 text-blue-800 border-blue-200",
        icon: <Users2 className="w-3 h-3 text-blue-600" />,
      };
    case "face_overlap":
      return {
        label: "FACe / Vazifalar Chatishmasi",
        color: "bg-amber-50 text-amber-800 border-amber-200",
        icon: <Shield className="w-3 h-3 text-amber-600" />,
      };
    case "greiner":
      return {
        label: "Greiner Bosqichi",
        color: "bg-purple-50 text-purple-800 border-purple-200",
        icon: <GitBranch className="w-3 h-3 text-purple-600" />,
      };
    default:
      return {
        label: "Tuzilmaviy Tahlil",
        color: "bg-slate-50 text-slate-700 border-slate-200",
        icon: <Sparkles className="w-3 h-3 text-slate-500" />,
      };
  }
}


