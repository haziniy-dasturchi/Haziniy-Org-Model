import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { getEmployees, saveEmployee, ensureStoreSyncedFromSupabase, syncCurrentStoreToCloud } from "@/lib/dataStore";

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
    const employees = getEmployees();
    return NextResponse.json({ employees }, { headers: NO_CACHE_HEADERS });
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
    const {
      full_name,
      position_id,
      phone,
      photo_url,
      hired_at,
      personal_yqm,
      resume,
      portfolio_links,
    } = body;

    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ error: "Xodim F.I.Sh kiritilishi shart" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    await ensureStoreSyncedFromSupabase(true);

    const emp = saveEmployee({
      full_name: full_name.trim(),
      position_id: position_id || null,
      phone: phone ? phone.trim() : null,
      photo_url: photo_url ? photo_url.trim() : null,
      hired_at: hired_at || null,
      personal_yqm: personal_yqm ? personal_yqm.trim() : null,
      resume: resume ? resume.trim() : null,
      portfolio_links: Array.isArray(portfolio_links) ? portfolio_links : [],
    });

    await syncCurrentStoreToCloud();

    return NextResponse.json({ success: true, employee: emp }, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
