import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { savePosition, deletePosition, getPositionById, ensureStoreSyncedFromSupabase, syncCurrentStoreToCloud } from "@/lib/dataStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await ensureStoreSyncedFromSupabase(true);
  const pos = getPositionById(params.id);
  if (!pos) return NextResponse.json({ error: "Lavozim topilmadi" }, { status: 404, headers: NO_CACHE_HEADERS });
  return NextResponse.json({ position: pos }, { headers: NO_CACHE_HEADERS });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403, headers: NO_CACHE_HEADERS });
    }

    const body = await request.json();
    const { department_id, title, yqm_text, status, sort_order, branch_id, estimated_salary } = body;

    // 1. Force fresh sync from Supabase cloud first
    await ensureStoreSyncedFromSupabase(true);

    // 2. Save in store
    const pos = savePosition({
      id: params.id,
      department_id,
      branch_id: branch_id !== undefined ? (branch_id || null) : undefined,
      title: title ? title.trim() : undefined,
      yqm_text: yqm_text !== undefined ? (yqm_text ? yqm_text.trim() : null) : undefined,
      status: status === "rejalashtirilgan" ? "rejalashtirilgan" : "mavjud",
      sort_order: sort_order !== undefined ? Number(sort_order) : undefined,
      estimated_salary: estimated_salary !== undefined ? (estimated_salary ? Number(estimated_salary) : null) : undefined,
    });

    // 3. Immediately persist to Supabase cloud
    await syncCurrentStoreToCloud();

    return NextResponse.json({ success: true, position: pos }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403, headers: NO_CACHE_HEADERS });
    }

    await ensureStoreSyncedFromSupabase(true);
    deletePosition(params.id);
    await syncCurrentStoreToCloud();

    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
