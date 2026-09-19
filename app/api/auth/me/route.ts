import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("haziniy_admin_session");

  if (!sessionCookie?.value) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = JSON.parse(sessionCookie.value);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
