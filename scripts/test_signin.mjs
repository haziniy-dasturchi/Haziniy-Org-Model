import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function testSignIn() {
  const email = "haziniy998889692313@gmail.com";
  const password = "89692313";

  console.log(`🔐 Kirish sinab ko'rilmoqda: ${email}...`);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("❌ Xatolik:", error);
  } else {
    console.log("🎉 MUVAFFAQITYATLI KIRILDI! User ID:", data.user?.id);
    console.log("Email:", data.user?.email);
    console.log("User metadata:", data.user?.user_metadata);

    // Profile tekshirish
    const { data: prof, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    console.log("Profile:", prof, "Profile error:", pErr);
  }
}

testSignIn();
