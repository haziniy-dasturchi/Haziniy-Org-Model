import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { getDepartments, saveDepartment, ensureStoreSyncedFromSupabase, syncCurrentStoreToCloud } from "@/lib/dataStore";

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
    await ensureStoreSyncedFromSupabase(false);
    const departments = getDepartments();
    return NextResponse.json({ departments }, { headers: NO_CACHE_HEADERS });
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
    const { name, color_hex, sort_order, yqm_text } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Bo'lim nomi kiritilishi shart" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    await ensureStoreSyncedFromSupabase(false);

    const dept = saveDepartment({
      name: name.trim(),
      color_hex: color_hex || "#1D4ED8",
      sort_order: typeof sort_order === "number" ? sort_order : 0,
      yqm_text: yqm_text ? yqm_text.trim() : null,
    });

    syncCurrentStoreToCloud();

    return NextResponse.json({ success: true, department: dept }, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
