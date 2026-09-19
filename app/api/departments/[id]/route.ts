import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { saveDepartment, deleteDepartment, getDepartmentById } from "@/lib/dataStore";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const dept = getDepartmentById(params.id);
  if (!dept) return NextResponse.json({ error: "Bo'lim topilmadi" }, { status: 404 });
  return NextResponse.json({ department: dept });
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
    const { name, color_hex, sort_order, yqm_text } = body;

    const dept = saveDepartment({
      id: params.id,
      name,
      color_hex,
      sort_order,
      yqm_text,
    });

    return NextResponse.json({ success: true, department: dept });
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

    deleteDepartment(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
