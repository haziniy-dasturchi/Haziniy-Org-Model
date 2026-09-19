import { createBrowserClient as ssrCreateBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return ssrCreateBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const createBrowserClient = createClient;

