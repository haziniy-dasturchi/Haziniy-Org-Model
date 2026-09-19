import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { getPositions, savePosition, ensureStoreSyncedFromSupabase, syncCurrentStoreToCloud } from "@/lib/dataStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET() {
  try {
    await ensureStoreSyncedFromSupabase(true);
    const positions = getPositions();
    return NextResponse.json({ positions }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403, headers: NO_CACHE_HEADERS });
    }

    const body = await request.json();
    const { department_id, title, yqm_text, status, sort_order, branch_id, estimated_salary } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Lavozim nomi kiritilishi shart" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    await ensureStoreSyncedFromSupabase(true);

    const pos = savePosition({
      department_id,
      branch_id: branch_id || null,
      title: title.trim(),
      yqm_text: yqm_text ? yqm_text.trim() : null,
      status: status === "rejalashtirilgan" ? "rejalashtirilgan" : "mavjud",
      sort_order: typeof sort_order === "number" ? sort_order : 0,
      estimated_salary: estimated_salary ? Number(estimated_salary) : undefined,
    });

    await syncCurrentStoreToCloud();

    return NextResponse.json({ success: true, position: pos }, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
