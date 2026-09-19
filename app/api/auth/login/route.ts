import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Admin ma'lumotlari
const ADMIN_PHONE = "998889692313";
const ADMIN_PASS = "89692313";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Telefon raqam va parolni kiriting" },
        { status: 400 }
      );
    }

    const digitsOnly = String(phone).replace(/\D/g, "");

    // Admin tekshiruvi (+998889692313 / 89692313)
    if (digitsOnly === ADMIN_PHONE && String(password) === ADMIN_PASS) {
      const sessionData = {
        id: "admin-muhammad-said-hasan",
        phone: "+998889692313",
        full_name: "Muhammad Said Hasan",
        role: "admin",
        createdAt: new Date().toISOString(),
      };

      const cookieStore = cookies();
      cookieStore.set("haziniy_admin_session", JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 kun
      });

      return NextResponse.json({
        success: true,
        user: sessionData,
      });
    }

    return NextResponse.json(
      { error: "Telefon raqam yoki parol noto'g'ri kiritildi" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Serverda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
