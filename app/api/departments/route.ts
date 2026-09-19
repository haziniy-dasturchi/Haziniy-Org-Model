import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { getDepartments, saveDepartment } from "@/lib/dataStore";

export async function GET() {
  try {
    const departments = getDepartments();
    return NextResponse.json({ departments });
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
    const { name, color_hex, sort_order, yqm_text } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Bo'lim nomi kiritilishi shart" }, { status: 400 });
    }

    const dept = saveDepartment({
      name: name.trim(),
      color_hex: color_hex || "#1D4ED8",
      sort_order: typeof sort_order === "number" ? sort_order : 0,
      yqm_text: yqm_text ? yqm_text.trim() : null,
    });

    return NextResponse.json({ success: true, department: dept }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
