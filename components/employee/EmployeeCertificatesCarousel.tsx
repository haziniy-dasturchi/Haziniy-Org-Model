"use client";

import React, { useState, useEffect, useRef } from "react";
import { CertificateItem } from "@/types";
import { isPdf } from "@/lib/imageUtils";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Calendar,
  ExternalLink,
  FileText,
  Download,
  Eye,
} from "lucide-react";

interface EmployeeCertificatesCarouselProps {
  certificates?: CertificateItem[];
  employeeName: string;
  isAdmin?: boolean;
}

export function EmployeeCertificatesCarousel({
  certificates = [],
  employeeName,
  isAdmin = false,
}: EmployeeCertificatesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const total = certificates.length;

  // Auto-slide every 5 seconds if more than 1 certificate and not paused
  useEffect(() => {
    if (total <= 1 || isPaused || selectedCert !== null) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [total, isPaused, selectedCert]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCert(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!certificates || certificates.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const current = certificates[currentIndex] || certificates[0];
  const isCurrentPdf = isPdf(current?.image_url);

  return (
    <div className="mt-8 pt-6 border-t border-emerald-900/10 space-y-4">
      {/* Header section with badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
              <span>Sertifikatlar va Diplomlar</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {total} ta hujjat
              </span>
            </h3>
          </div>
        </div>

        {/* Navigation arrows (shown when > 1 item) */}
        {total > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-xl border border-emerald-900/10 bg-white hover:bg-emerald-50 text-brand-dark transition shadow-2xs cursor-pointer active:scale-95"
              title="Oldingi"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-800" />
            </button>
            <span className="text-[11px] font-bold text-slate-500 px-1 select-none">
              {currentIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-xl border border-emerald-900/10 bg-white hover:bg-emerald-50 text-brand-dark transition shadow-2xs cursor-pointer active:scale-95"
              title="Keyingi"
            >
              <ChevronRight className="w-4 h-4 text-emerald-800" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel Main Stage Container */}
      <div
        className="relative rounded-3xl overflow-hidden border border-emerald-900/10 bg-gradient-to-b from-slate-900/5 via-white to-emerald-50/20 p-4 sm:p-6 shadow-sm"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Certificate Display Frame (Image or PDF Preview) */}
          <div className="md:col-span-7 relative group">
            {isCurrentPdf ? (
              <div
                onClick={() => setSelectedCert(current)}
                className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50/80 via-white to-slate-100 border-2 border-amber-500/30 shadow-md hover:shadow-xl hover:border-brand-accent transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-6 text-center select-none"
              >
                {/* Embedded PDF background preview iframe */}
                <iframe
                  src={`${current.image_url}#toolbar=0&navpanes=0&view=Fit`}
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity"
                  title={current.title}
                />

                {/* Top Ribbon Tag */}
                <div className="absolute top-3 left-3 bg-brand-dark/90 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[10px] font-bold px-3 py-1 rounded-xl shadow-xs z-10">
                  <span>Tasdiqlangan</span>
                </div>

                {/* Big PDF Document Card Presentation */}
                <div className="relative z-10 flex flex-col items-center group-hover:scale-105 transition-transform duration-300">
                  <div className="w-18 h-22 sm:w-20 sm:h-24 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-rose-300 shadow-xl flex flex-col items-center justify-between p-2.5 mb-3">
                    <span className="text-[11px] font-black text-rose-600 tracking-wider">PDF</span>
                    <FileText className="w-9 h-9 text-rose-500" />
                    <div className="w-full h-1.5 rounded-full bg-rose-100" />
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 max-w-[90%] mb-1 px-2 drop-shadow-2xs">
                    {current.title || "PDF Sertifikat"}
                  </h5>
                  <span className="text-[11px] text-rose-600 font-bold bg-white/85 px-2.5 py-0.5 rounded-full border border-rose-200">
                    PDF Hujjat &bull; Kattalashtirish uchun bosing
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-200 flex flex-col items-center justify-center text-white gap-2 z-20">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
                    <Maximize2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold tracking-wide">PDFni to&apos;liq ochish</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setSelectedCert(current)}
                className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-950/5 border-2 border-amber-500/30 shadow-md hover:shadow-xl hover:border-brand-accent transition-all duration-300 cursor-pointer flex items-center justify-center"
              >
                <img
                  src={current.image_url}
                  alt={current.title}
                  draggable={false}
                  onContextMenu={(e) => {
                    if (!isAdmin) e.preventDefault();
                  }}
                  className={`w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-300 select-none ${!isAdmin ? "pointer-events-none" : ""}`}
                />

                {/* Hover Overlay with Zoom Icon */}
                <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-200 flex flex-col items-center justify-center text-white gap-2">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
                    <Maximize2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold tracking-wide">Kattalashtirib ko&apos;rish</span>
                </div>

                {/* Top Ribbon Tag */}
                <div className="absolute top-3 left-3 bg-brand-dark/85 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[10px] font-bold px-3 py-1 rounded-xl shadow-xs">
                  <span>Tasdiqlangan</span>
                </div>

                {!isAdmin && (
                  <div
                    className="absolute inset-0 z-10 select-none bg-transparent cursor-pointer"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                )}
              </div>
            )}
          </div>

          {/* Certificate Info Details */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70 block">
                  Sertifikat nomi
                </span>
                {isCurrentPdf && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                    PDF hujjat
                  </span>
                )}
              </div>
              <h4 className="text-base sm:text-lg font-serif font-bold text-brand-dark leading-snug">
                {current.title || "Malaka sertifikati"}
              </h4>
            </div>

            {current.issued_date && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/80 border border-emerald-900/10 px-3.5 py-2 rounded-xl inline-flex shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                <span>Berilgan vaqti: <strong className="text-slate-800">{current.issued_date}</strong></span>
              </div>
            )}

            <p className="text-xs text-slate-500 leading-relaxed">
              Ushbu hujjat <strong>{employeeName}</strong>ning kasbiy malakasi va yutuqlarini tasdiqlovchi rasmiy {isCurrentPdf ? "PDF formatidagi" : ""} sertifikat/diplom hisoblanadi.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedCert(current)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-dark hover:bg-[#002824] text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer border border-brand-accent/30"
              >
                <Maximize2 className="w-3.5 h-3.5 text-brand-accent" />
                <span>{isCurrentPdf ? "PDFni to'liq ochish" : "To'liq hajmda ko'rish"}</span>
              </button>

              {isCurrentPdf && isAdmin && (
                <a
                  href={current.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-brand-dark border border-slate-200 text-xs font-bold shadow-2xs transition active:scale-95"
                  title="Yangi oynada ochish"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Yangi oynada</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail Dots Navigation (when > 1 items) */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-emerald-900/5">
            {certificates.map((c, idx) => (
              <button
                key={c.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                  currentIndex === idx
                    ? "w-8 bg-brand-accent"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                title={c.title}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox / Document Viewer Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-5xl w-full max-h-[94vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-emerald-900/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/30">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${isPdf(selectedCert.image_url) ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                  {isPdf(selectedCert.image_url) ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Award className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-dark truncate max-w-md">
                    {selectedCert.title || "Sertifikat"}
                  </h4>
                  {selectedCert.issued_date && (
                    <p className="text-[11px] text-slate-500">
                      Berilgan sana: {selectedCert.issued_date}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <a
                      href={selectedCert.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-brand-dark hover:border-brand-accent transition"
                      title="Yangi oynada ochish"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">Yangi oynada</span>
                    </a>

                    <a
                      href={selectedCert.image_url}
                      download={`${(selectedCert.title || "Sertifikat").replace(/\s+/g, "_")}${isPdf(selectedCert.image_url) ? ".pdf" : ".jpg"}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-dark text-white text-xs font-semibold hover:bg-emerald-950 transition"
                      title="Faylni yuklab olish"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Yuklab olish</span>
                    </a>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: PDF iframe viewer or Image */}
            <div className="p-3 sm:p-6 overflow-y-auto flex-1 flex items-center justify-center bg-slate-900/5 min-h-[350px]">
              {isPdf(selectedCert.image_url) ? (
                <div className="w-full h-[75vh] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md flex flex-col">
                  <iframe
                    src={`${selectedCert.image_url}#toolbar=${isAdmin ? 1 : 0}&navpanes=0`}
                    className="w-full h-full border-0"
                    title={selectedCert.title}
                  />
                </div>
              ) : (
                <div className="relative inline-block select-none max-w-full">
                  <img
                    src={selectedCert.image_url}
                    alt={selectedCert.title}
                    draggable={false}
                    className={`max-h-[72vh] w-auto max-w-full rounded-xl object-contain shadow-md border border-slate-200 bg-white ${
                      !isAdmin ? "pointer-events-none select-none" : ""
                    }`}
                  />
                  {!isAdmin && (
                    <div
                      className="absolute inset-0 z-10 bg-transparent select-none cursor-default"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
