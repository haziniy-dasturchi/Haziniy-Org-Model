import { NextRequest, NextResponse } from 'next/server';
import { checkAdminSession } from '@/lib/adminAuth';
import { getLatestOrgAIAnalysis, resolveOrgRecommendation, updateOrgRecommendation, getFullOrgStructure, ensureStoreSyncedFromSupabase, syncCurrentStoreToCloud } from '@/lib/dataStore';

export async function GET(request: NextRequest) {
  try {
    await ensureStoreSyncedFromSupabase();
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const analysis = await getLatestOrgAIAnalysis(force);
    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (err: any) {
    console.error('Org AI Analysis GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: 'Faqat admin uchun ruxsat berilgan' }, { status: 403 });
    }

    const analysis = await getLatestOrgAIAnalysis(true);
    await syncCurrentStoreToCloud();

    return NextResponse.json(
      {
        success: true,
        analysis,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Org AI Analysis POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: 'Faqat admin uchun ruxsat berilgan' }, { status: 403 });
    }

    const body = await request.json();
    const { item_id } = body;

    if (!item_id) {
      return NextResponse.json({ error: 'item_id talab qilinadi' }, { status: 400 });
    }

    const result = await resolveOrgRecommendation(item_id);
    if (!result) {
      return NextResponse.json({ error: 'Tavsiya topilmadi' }, { status: 404 });
    }

    await syncCurrentStoreToCloud();
    const fullDepts = getFullOrgStructure();

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      affectedPosition: result.affectedPosition,
      departments: fullDepts,
      message: result.affectedPosition
        ? `"${result.affectedPosition.title}" lavozimi Hozirgi Org Modelga qo'shildi (mavjud holatga o'tdi)! Endi unga xodim axtarib biriktirishingiz mumkin.`
        : 'Tavsiya bajarilgan deb belgilandi!',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: 'Faqat admin uchun ruxsat berilgan' }, { status: 403 });
    }

    const body = await request.json();
    const { item_id, updates } = body;

    if (!item_id || !updates) {
      return NextResponse.json({ error: 'item_id va updates talab qilinadi' }, { status: 400 });
    }

    const updated = await updateOrgRecommendation(item_id, updates);
    await syncCurrentStoreToCloud();

    return NextResponse.json({
      success: true,
      analysis: updated,
      message: 'AI tavsiyasi muvaffaqiyatli tahrirlandi va saqlandi!',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
