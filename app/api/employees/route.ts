import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { getEmployees, saveEmployee } from "@/lib/dataStore";

export async function GET() {
  try {
    const employees = getEmployees();
    return NextResponse.json({ employees });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403 });
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
      return NextResponse.json({ error: "Xodim F.I.Sh kiritilishi shart" }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, employee: emp }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
