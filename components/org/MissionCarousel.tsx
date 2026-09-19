"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Compass, Quote, ChevronLeft, ChevronRight, Play, Pause, Sparkles } from "lucide-react";

interface MissionCarouselProps {
  mission: string | string[];
  autoPlayInterval?: number;
}

export function MissionCarousel({
  mission,
  autoPlayInterval = 6000,
}: MissionCarouselProps) {
  const slides: string[] = React.useMemo(() => {
    if (Array.isArray(mission)) {
      return mission.map((m) => m.trim()).filter((m) => m.length > 0);
    }
    if (!mission) return [];
    return mission
      .split(/\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [mission]);

  const totalSlides = slides.length > 0 ? slides.length : 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");

  const touchStartX = useRef<number | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating || index === currentIndex) return;
      setIsAnimating(true);
      setFadeState("out");

      setTimeout(() => {
        setCurrentIndex((index + totalSlides) % totalSlides);
        setFadeState("in");
        setTimeout(() => {
          setIsAnimating(false);
        }, 250);
      }, 200);
    },
    [currentIndex, isAnimating, totalSlides]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides, autoPlayInterval, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  const currentText =
    slides.length > 0
      ? slides[currentIndex % slides.length]
      : "YUQORI DARAJALI XIZMAT KO'RSATISH ORQALI XALQIMIZ ORASIDA GO'ZAL XULQLI, AQLLI TALABALAR YETISHIB CHIQISHI VA ILM YUKSAK DARAJAGA KO'TARILISHIGA O'Z HISSAMIZNI QO'SHISH";

  return (
    <div
      className="mx-auto max-w-4xl relative group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Decorative Outer Glow on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent/20 via-emerald-500/10 to-brand-dark/20 rounded-3xl blur-md opacity-40 group-hover:opacity-100 transition duration-500 pointer-events-none" />

      {/* Main Quote Card Container */}
      <div className="relative bg-white/95 backdrop-blur-md border border-emerald-950/15 rounded-3xl p-5 sm:p-7 shadow-sm shadow-emerald-950/5 overflow-hidden text-left transition-all duration-300">
        
        {/* Giant Watermark Quote Icon in Background */}
        <div className="absolute -bottom-6 -right-6 text-emerald-900/[0.04] pointer-events-none transform -rotate-12">
          <Quote className="w-40 h-40" />
        </div>

        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-3 mb-3 relative z-10 border-b border-emerald-900/10 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-dark">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 border border-brand-accent/40 text-brand-accent shadow-2xs">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span>Korxona Bosh Maqsadi</span>
          </div>

          {/* Carousel Slide Controls */}
          <div className="flex items-center gap-1.5">
            {totalSlides > 1 && (
              <span className="text-[10px] font-bold text-emerald-800/70 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-900/10">
                {currentIndex + 1} / {totalSlides}
              </span>
            )}

            {totalSlides > 1 && (
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                title={isPaused ? "Avtomatik aylanishni boshlash" : "To'xtatib turish"}
                className="p-1 rounded-lg text-slate-400 hover:text-brand-dark hover:bg-emerald-50 transition cursor-pointer"
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
            )}

            {totalSlides > 1 && (
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  type="button"
                  onClick={prevSlide}
                  title="Oldingi maqsad"
                  className="p-1 rounded-lg text-slate-400 hover:text-brand-dark hover:bg-emerald-50 transition cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  title="Keyingi maqsad"
                  className="p-1 rounded-lg text-slate-400 hover:text-brand-dark hover:bg-emerald-50 transition cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quote Content with Smooth Transition */}
        <div className="relative z-10 py-1 min-h-[72px] sm:min-h-[84px] flex items-center">
          <div
            className={`transition-all duration-200 transform ${
              fadeState === "in"
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-2 scale-[0.99]"
            }`}
          >
            <p className="font-serif text-sm sm:text-base md:text-lg font-bold text-brand-dark leading-relaxed tracking-wide">
              <span className="text-brand-accent font-serif text-xl sm:text-2xl mr-1 leading-none inline-block align-top">&ldquo;</span>
              {currentText}
              <span className="text-brand-accent font-serif text-xl sm:text-2xl ml-1 leading-none inline-block align-bottom">&rdquo;</span>
            </p>
          </div>
        </div>

        {/* Bottom Pagination Dots & Auto-play Progress Indicator */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2 relative z-10">
          <div className="flex items-center gap-1.5">
            {slides.length > 1 ? (
              slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? "w-6 bg-brand-accent shadow-2xs"
                      : "w-1.5 bg-emerald-900/20 hover:bg-emerald-900/40"
                  }`}
                  title={`${idx + 1}-maqsad`}
                />
              ))
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-1.5 rounded-full bg-brand-accent shadow-2xs" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-900/20" />
              </div>
            )}
          </div>

          {/* <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-emerald-800/70">
            <Sparkles className="w-3 h-3 text-brand-accent" />
            <span>Haziniy Ilm Maskani Strategiyasi</span>
          </div> */}
        </div>

      </div>
    </div>
  );
}
