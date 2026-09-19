"use client";

import React, { useState, useEffect } from "react";
import { Compass, Save, Sparkles, RotateCcw, Info } from "lucide-react";
import { HAZINIY_MAIN_MISSION } from "@/lib/defaultOrgData";
import { MissionCarousel } from "@/components/org/MissionCarousel";
import { useToast } from "./ToastContext";

interface MissionTabProps {
  initialMission: string;
  onMissionSaved?: (mission: string) => void;
}

export function MissionTab({ initialMission, onMissionSaved }: MissionTabProps) {
  const { showToast } = useToast();
  const [mission, setMission] = useState(initialMission || HAZINIY_MAIN_MISSION);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMission(initialMission || HAZINIY_MAIN_MISSION);
  }, [initialMission]);

  const handleReset = () => {
    setMission(HAZINIY_MAIN_MISSION);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission.trim()) {
      showToast("Korxona maqsadi bo'sh bo'lishi mumkin emas", "error");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/settings/mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mission: mission.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Saqlashda xatolik yuz berdi");
      }

      if (onMissionSaved) {
        onMissionSaved(mission.trim());
      }

      showToast("Korxona bosh maqsadi muvaffaqiyatli saqlandi!");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-emerald-900/10 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-dark flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-accent" />
            <span>Korxona Bosh Maqsadi & Karuseli</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bosh sahifadagi aylanuvchi iqtibos karuselida ko&apos;rinadigan korxona bosh maqsadlarini boshqarish
          </p>
        </div>
      </div>

      {/* Real-time Carousel Preview */}
      <div className="bg-white rounded-3xl border border-emerald-900/10 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-dark">
            <Sparkles className="w-4 h-4 text-brand-accent" />
            <span>Bosh sahifadagi jonli karusel ko&apos;rinishi</span>
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-900/10">
            Avtomatik aylanadi
          </span>
        </div>

        <div className="p-2 sm:p-4 rounded-2xl bg-brand-bg border border-emerald-900/10">
          <MissionCarousel mission={mission} />
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-emerald-900/10 shadow-sm p-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Missiya & Maqsadlar Matni
            </label>
            <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Har bir yangi qator alohida karusel slaydiga aylanadi
            </span>
          </div>

          <textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            rows={5}
            placeholder="1-maqsad: Yuqori darajali xizmat ko'rsatish...&#10;2-maqsad: Har bir talabaga shaxsiy yondashuv..."
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-accent focus:ring-2 focus:ring-emerald-100 text-sm font-semibold text-slate-800 outline-none transition leading-relaxed resize-y font-serif"
            required
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Slaydlar soni: <strong>{mission.split(/\n+/).filter(s => s.trim().length > 0).length} ta</strong></span>
            <span>Belgilar soni: {mission.length} ta</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Asl holatga qaytarish</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-dark hover:bg-[#002824] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer border border-brand-accent/30"
          >
            <Save className="w-4 h-4 text-brand-accent" />
            <span>{isLoading ? "Saqlanmoqda..." : "Maqsadlarni saqlash"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
