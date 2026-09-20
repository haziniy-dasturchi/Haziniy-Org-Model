import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { getEmployeeById, saveEmployee, deleteEmployee, ensureStoreSyncedFromSupabase, syncCurrentStoreToCloud } from "@/lib/dataStore";

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
  try {
    await ensureStoreSyncedFromSupabase(true);
    const emp = getEmployeeById(params.id);
    if (!emp) {
      return NextResponse.json({ error: "Xodim topilmadi" }, { status: 404, headers: NO_CACHE_HEADERS });
    }
    return NextResponse.json({ employee: emp }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
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
    const {
      full_name,
      position_id,
      phone,
      photo_url,
      hired_at,
      personal_yqm,
      resume,
      portfolio_links,
      certificates,
    } = body;

    await ensureStoreSyncedFromSupabase(true);

    const emp = saveEmployee({
      id: params.id,
      full_name,
      position_id,
      phone,
      photo_url,
      hired_at,
      personal_yqm,
      resume,
      portfolio_links,
      certificates,
    });

    await syncCurrentStoreToCloud();

    return NextResponse.json({ success: true, employee: emp }, { headers: NO_CACHE_HEADERS });
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
    deleteEmployee(params.id);
    await syncCurrentStoreToCloud();
    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
