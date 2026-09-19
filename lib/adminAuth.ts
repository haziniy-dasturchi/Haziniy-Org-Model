import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function checkAdminSession(): boolean {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("haziniy_admin_session");
    if (!sessionCookie || !sessionCookie.value) return false;
    
    let raw = sessionCookie.value;
    try {
      raw = decodeURIComponent(raw);
    } catch {}

    const session = JSON.parse(raw);
    return session && (session.role === "admin" || session.role === "superadmin" || session.id === "admin-muhammad-said-hasan");
  } catch {
    return false;
  }
}

export function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
