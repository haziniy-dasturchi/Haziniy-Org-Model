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

async function createAdmin() {
  const email = "haziniy998889692313@gmail.com";
  const password = "89692313";

  console.log(`🔑 Foydalanuvchi yaratish/kirish sinab ko'rilmoqda: ${email}...`);

  // 1. Avval signIn qilib ko'ramiz
  const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signData?.user) {
    console.log("✅ Foydalanuvchi allaqachon mavjud va login qila oldi! User ID:", signData.user.id);
    
    // Profiles tekshirish
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", signData.user.id)
      .single();

    console.log("Profile:", prof, "Error:", profErr);
    return;
  }

  console.log("Sign in error:", signErr?.message);
  console.log("🚀 Yangi foydalanuvchi sifatida signUp qilinmoqda...");

  // 2. Agar mavjud bo'lmasa signUp qilamiz
  const { data: upData, error: upErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Muhammad Said Hasan",
        phone: "+998889692313",
      },
    },
  });

  if (upErr) {
    console.error("SignUp error:", upErr);
  } else {
    console.log("✅ SignUp muvaffaqiyatli bo'ldi! User:", upData.user?.id);
    console.log("Session:", upData.session ? "Active" : "Needs email confirm (agar confirm yoqilgan bo'lsa)");
  }
}

createAdmin();
