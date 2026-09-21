import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { saveDepartment, deleteDepartment, getDepartmentById, ensureStoreSyncedFromSupabase, syncCurrentStoreToCloud } from "@/lib/dataStore";

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
  await ensureStoreSyncedFromSupabase(false);
  const dept = getDepartmentById(params.id);
  if (!dept) return NextResponse.json({ error: "Bo'lim topilmadi" }, { status: 404, headers: NO_CACHE_HEADERS });
  return NextResponse.json({ department: dept }, { headers: NO_CACHE_HEADERS });
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
    const { name, color_hex, sort_order, yqm_text } = body;

    await ensureStoreSyncedFromSupabase(false);

    const dept = saveDepartment({
      id: params.id,
      name,
      color_hex,
      sort_order,
      yqm_text,
    });

    syncCurrentStoreToCloud();

    return NextResponse.json({ success: true, department: dept }, { headers: NO_CACHE_HEADERS });
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

    await ensureStoreSyncedFromSupabase(false);
    deleteDepartment(params.id);
    syncCurrentStoreToCloud();

    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
