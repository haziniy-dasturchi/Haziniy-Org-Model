import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { getMission, saveMission, ensureStoreSyncedFromSupabase, syncCurrentStoreToCloud } from "@/lib/dataStore";

export async function GET() {
  await ensureStoreSyncedFromSupabase();
  const mission = getMission();
  return NextResponse.json({ mission });
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403 });
    }

    const body = await request.json();
    const { mission } = body;

    if (!mission || !mission.trim()) {
      return NextResponse.json({ error: "Korxona maqsadi bo'sh bo'lishi mumkin emas" }, { status: 400 });
    }

    const saved = saveMission(mission);
    await syncCurrentStoreToCloud();
    return NextResponse.json({ success: true, mission: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
