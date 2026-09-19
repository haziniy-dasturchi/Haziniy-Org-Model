import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Faqat /admin va uning ichki sahifalari himoyalangan
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // 1. Admin sessiya cookie'sini tekshirish
  const sessionCookie = request.cookies.get("haziniy_admin_session");

  if (sessionCookie?.value) {
    try {
      const user = JSON.parse(sessionCookie.value);
      if (user && user.role === "admin") {
        return NextResponse.next();
      }
    } catch {
      // JSON parse error bo'lsa login ga yo'naltirish
    }
  }

  // Agar admin sessiyasi bo'lmasa -> /login ga yo'naltirish
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
