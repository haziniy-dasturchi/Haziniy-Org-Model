import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { getPositions, savePosition } from "@/lib/dataStore";

export async function GET() {
  try {
    const positions = getPositions();
    return NextResponse.json({ positions });
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
    const { department_id, title, yqm_text, status, sort_order } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Lavozim nomi kiritilishi shart" }, { status: 400 });
    }

    const pos = savePosition({
      department_id,
      title: title.trim(),
      yqm_text: yqm_text ? yqm_text.trim() : null,
      status: status === "rejalashtirilgan" ? "rejalashtirilgan" : "mavjud",
      sort_order: typeof sort_order === "number" ? sort_order : 0,
    });

    return NextResponse.json({ success: true, position: pos }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
