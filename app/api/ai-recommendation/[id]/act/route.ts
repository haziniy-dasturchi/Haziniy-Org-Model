import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { resolveOrgRecommendation } from "@/lib/dataStore";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403 });
    }

    const { id: recId } = params;
    const body = await request.json();
    const targetId = body.item_id || recId;

    if (!targetId) {
      return NextResponse.json({ error: "item_id (tavsiya bandi identifikatori) ko'rsatilishi shart" }, { status: 400 });
    }

    const result = await resolveOrgRecommendation(targetId);

    if (!result) {
      return NextResponse.json({ error: "Tavsiya topilmadi" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      affectedPosition: result.affectedPosition,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
