import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

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
    
    let mimeType = file.type;
    const lowerName = (file.name || "").toLowerCase();
    if (!mimeType || mimeType === "application/octet-stream") {
      if (lowerName.endsWith(".pdf")) mimeType = "application/pdf";
      else if (lowerName.endsWith(".png")) mimeType = "image/png";
      else if (lowerName.endsWith(".webp")) mimeType = "image/webp";
      else mimeType = "image/jpeg";
    }

    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Try saving to local public/uploads directory if filesystem is writable (e.g. Localhost)
    let publicUrl = dataUrl;
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const ext = path.extname(file.name) || (mimeType === "application/pdf" ? ".pdf" : ".jpg");
      const fileName = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, buffer);
      
      // On local dev server, can use relative path, but dataUrl is also permanently stored in store
      if (!process.env.VERCEL) {
        publicUrl = `/uploads/${fileName}`;
      }
    } catch {
      // Ephemeral or read-only filesystem (e.g. Vercel serverless /var/task):
      // dataUrl is used directly, which permanently persists in Supabase Cloud snapshot without 404
      publicUrl = dataUrl;
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
