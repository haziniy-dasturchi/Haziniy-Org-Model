import { createClient as createBrowserClient } from "./supabase/client";
import { createClient as createServerClient } from "./supabase/server";

export { createBrowserClient, createServerClient };

// Service Role Admin Client (Faqat xavfsiz Server Actions yoki Route Handlers uchun)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY aniqlanmagan");
  }

  const { createClient } = require("@supabase/supabase-js");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
