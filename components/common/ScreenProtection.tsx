"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth";
import { ShieldAlert, Lock } from "lucide-react";

export function ScreenProtection() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isBlurred, setIsBlurred] = useState(false);

  // Check user role on mount and route changes
  useEffect(() => {
    let mounted = true;
    async function checkRole() {
      try {
        const user = await getCurrentUserProfile();
        if (mounted) {
          setIsAdmin(user?.role === "admin");
        }
      } catch {
        if (mounted) setIsAdmin(false);
      }
    }
    checkRole();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    // If admin or role check in progress, do not restrict
    if (isAdmin === true || isAdmin === null) {
      document.body.classList.remove("protected-user");
      setIsBlurred(false);
      return;
    }

    // Apply protected-user class to body
    document.body.classList.add("protected-user");

    // 1. Block right click (context menu) for regular users
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Block drag & drop on all elements / images
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // 3. Block keyboard shortcuts (PrintScreen, Ctrl+S, Ctrl+P, Ctrl+U, DevTools)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("");
        }
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 2500);
      }

      // Save page (Ctrl+S / Cmd+S), Print (Ctrl+P / Cmd+P), View Source (Ctrl+U / Cmd+U)
      if ((e.ctrlKey || e.metaKey) && ["s", "S", "p", "P", "u", "U"].includes(e.key)) {
        e.preventDefault();
        return false;
      }

      // DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 4. Anti-screen capture: when window loses focus (e.g. Snipping tool Win+Shift+S)
    const handleBlur = () => {
      // Don't blur if focus moved into an internal iframe (e.g. PDF viewer)
      if (document.activeElement?.tagName === "IFRAME") {
        return;
      }
      setIsBlurred(true);
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    // Also handle visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu, { capture: true });
    document.addEventListener("dragstart", handleDragStart, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.body.classList.remove("protected-user");
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      document.removeEventListener("dragstart", handleDragStart, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAdmin]);

  // If user is admin or screen is not blurred, render nothing
  if (isAdmin === true || !isBlurred) {
    return null;
  }

  // Protective overlay when external screenshot tool or snippet is triggered
  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl text-white select-none pointer-events-auto transition-all duration-150"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="text-center p-8 max-w-md mx-4 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
          Haziniy ORG Model
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-emerald-400 mt-1">
          Mualliflik huquqi bilan himoyalangan
        </p>
        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          Tizim xavfsizligi maqsadida ushbu sahifada skrinshot olish va rasmlarni ko&apos;chirib olish cheklangan.
        </p>
        <p className="text-[11px] text-slate-500 mt-4 italic">
          Sahifani ko&apos;rishda davom etish uchun ekranga bosing
        </p>
      </div>
    </div>
  );
}
