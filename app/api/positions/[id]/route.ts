import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { savePosition, deletePosition, getPositionById } from "@/lib/dataStore";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pos = getPositionById(params.id);
  if (!pos) return NextResponse.json({ error: "Lavozim topilmadi" }, { status: 404 });
  return NextResponse.json({ position: pos });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403 });
    }

    const body = await request.json();
    const { department_id, title, yqm_text, status, sort_order } = body;

    const pos = savePosition({
      id: params.id,
      department_id,
      title,
      yqm_text,
      status,
      sort_order,
    });

    return NextResponse.json({ success: true, position: pos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403 });
    }

    deletePosition(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
