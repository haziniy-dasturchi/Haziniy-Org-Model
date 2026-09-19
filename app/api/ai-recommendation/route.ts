import { NextRequest, NextResponse } from "next/server";
import { checkAdminSession } from "@/lib/adminAuth";
import { getLatestOrgAIAnalysis, resolveOrgRecommendation } from "@/lib/dataStore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";
    const analysis = await getLatestOrgAIAnalysis(force);
    return NextResponse.json({
      success: true,
      analysis,
      recommendation: analysis, // backward compatibility
    });
  } catch (err: any) {
    console.error("Org AI Analysis GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403 });
    }

    const analysis = await getLatestOrgAIAnalysis(true);

    return NextResponse.json(
      {
        success: true,
        analysis,
        recommendation: analysis,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Org AI Analysis POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403 });
    }

    const body = await request.json();
    const { item_id } = body;

    if (!item_id) {
      return NextResponse.json({ error: "item_id talab qilinadi" }, { status: 400 });
    }

    const updated = resolveOrgRecommendation(item_id);

    return NextResponse.json({
      success: true,
      analysis: updated,
      recommendation: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

