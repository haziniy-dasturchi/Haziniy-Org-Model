import React from "react";
import { OrgChart } from "@/components/org/OrgChart";
import { AIRecommendation } from "@/components/org/AIRecommendation";
import { MissionCarousel } from "@/components/org/MissionCarousel";
import { Sparkles } from "lucide-react";
import { getFullOrgStructure, getMission, getLatestOrgAIAnalysis } from "@/lib/dataStore";
import { checkAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const departmentsWithData = getFullOrgStructure();
  const mainMission = getMission();
  const aiRecommendation = await getLatestOrgAIAnalysis();
  const isAdmin = checkAdminSession();

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-bg via-[#f7faf9] to-slate-100/70 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-14 pb-6 sm:pb-10 px-4 sm:px-6 lg:px-8 text-center">
        {/* Atmosphere Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-accent/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-brand-dark/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[340px] sm:w-[540px] h-32 bg-emerald-100/40 blur-2xl rounded-full pointer-events-none" />

        <div className="mx-auto max-w-5xl relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/30 bg-emerald-50/90 text-brand-dark text-xs font-bold uppercase tracking-wider shadow-2xs backdrop-blur-xs hover:border-brand-accent/50 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
            <span>Xush Kelibsiz!</span>
          </div>

          {/* Heading with generous responsive spacing and elegant aesthetics */}
          <div className="my-5 sm:my-8 lg:my-9">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black text-brand-dark tracking-tight leading-[1.18] sm:leading-[1.15] max-w-4xl mx-auto drop-shadow-2xs">
              Haziniy Ilm Maskani{" "}
              <span className="bg-gradient-to-r from-brand-accent via-emerald-600 to-teal-700 bg-clip-text text-transparent inline-block">
                ORG Modeli
              </span>
            </h1>
            
            {/* Elegant decorative ornament divider */}
            <div className="flex items-center justify-center gap-3 mt-3 sm:mt-4 opacity-80">
              <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-brand-accent/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent/60" />
              <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-brand-accent/40" />
            </div>
          </div>

          {/* Korxona Bosh Maqsadi (Interactive Auto-rotating Quote Carousel) */}
          <div className="pt-1 sm:pt-2">
            <MissionCarousel mission={mainMission} />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1550px] px-3 sm:px-6 lg:px-8 space-y-10">
        {/* 2 & 3 & 4. Interactive OrgChart with Switcher, 7 Departments Auto-fit Grid, Positions, and Vacancy Slots */}
        <section id="org-chart-section">
          <OrgChart departments={departmentsWithData} />
        </section>

        {/* 5. AI Recommendations Block */}
        <section className="pt-2 max-w-5xl mx-auto">
          <AIRecommendation
            recommendation={aiRecommendation}
            departments={departmentsWithData}
            isAdmin={isAdmin}
          />
        </section>
      </div>
    </main>
  );
}

