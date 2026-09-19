import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { getEmployeeById, saveEmployee, deleteEmployee } from "@/lib/dataStore";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emp = getEmployeeById(params.id);
    if (!emp) {
      return NextResponse.json({ error: "Xodim topilmadi" }, { status: 404 });
    }
    return NextResponse.json({ employee: emp });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
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
    });

    return NextResponse.json({ success: true, employee: emp });
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

    deleteEmployee(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
