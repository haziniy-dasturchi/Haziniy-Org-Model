import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkAdminSession } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminSession()) {
      return NextResponse.json({ error: "Faqat admin uchun ruxsat berilgan" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fayl yuborilmadi" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Clean file extension & safe unique name
    const ext = path.extname(file.name) || ".jpg";
    const fileName = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
