import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { getMission, saveMission, ensureStoreSyncedFromSupabase, syncCurrentStoreToCloud } from "@/lib/dataStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET() {
  await ensureStoreSyncedFromSupabase(true);
  const mission = getMission();
  return NextResponse.json({ mission }, { headers: NO_CACHE_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403, headers: NO_CACHE_HEADERS });
    }

    const body = await request.json();
    const { mission } = body;

    if (!mission || !mission.trim()) {
      return NextResponse.json({ error: "Korxona maqsadi bo'sh bo'lishi mumkin emas" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    await ensureStoreSyncedFromSupabase(true);
    const saved = saveMission(mission);
    await syncCurrentStoreToCloud();
    return NextResponse.json({ success: true, mission: saved }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
