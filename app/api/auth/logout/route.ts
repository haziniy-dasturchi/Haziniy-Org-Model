import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete("haziniy_admin_session");

  return NextResponse.json({ success: true });
}
