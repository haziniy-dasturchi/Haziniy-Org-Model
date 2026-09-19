import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey || supabaseUrl.includes("your-project")) {
  console.log("------------------------------------------------------------------");
  console.log("DIQQAT: .env.local faylida haqiqiy SUPABASE_URL topilmadi.");
  console.log("------------------------------------------------------------------");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runSeed() {
  console.log("🚀 Haziniy ORG Model — Real Google Sheets ma'lumotlari yuklanmoqda...");

  try {
    // 1. Clear old positions & departments to have a clean exact structure
    await supabase.from("positions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("departments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 2. Departments
    const deptList = [
      {
        name: "Boshqaruv",
        color_hex: "#1E293B",
        sort_order: 0,
        yqm_text: "Markaz strategiyasi, missiyasi va barcha bo'limlar samaradorligi",
      },
      {
        name: "Moliya",
        color_hex: "#EAB308",
        sort_order: 1,
        yqm_text: "KORXONANI KERAKLI VAQTDA YETARLI PUL MIQDORI BILAN TA'MINLASH",
      },
      {
        name: "Marketing",
        color_hex: "#2563EB",
        sort_order: 2,
        yqm_text: "KORXONANI SIFATLI LIDLAR BILAN TA'MINLASH VA BOZORDA O'RNINI SAQLAB QOLISH",
      },
      {
        name: "Sotuv",
        color_hex: "#EA580C",
        sort_order: 3,
        yqm_text: "KORXONADA SOTUVLARNI AMALGA OSHIRISH ORQALI DAROMADNI KO'PAYTIRISH",
      },
      {
        name: "O'quv",
        color_hex: "#059669",
        sort_order: 4,
        yqm_text: "MIJOZLARGA XIZMAT KO'RSATISH VA SARAFAN ORQALI MIJOZLAR SONINI YANADA OSHIRISH",
      },
      {
        name: "HR",
        color_hex: "#7C3AED",
        sort_order: 5,
        yqm_text: "KORXONADA KADRLAR BILAN MUAMMO BO'LMASLIGINI TA'MINLASH",
      },
      {
        name: "Texnik",
        color_hex: "#C2410C",
        sort_order: 6,
        yqm_text: "KORXONANI MIJOZ VA XODIMLAR UCHUN QULAY VA XAVFSIZ JOY BO'LISHINI TA'MINLASH",
      },
      {
        name: "Yuridik",
        color_hex: "#991B1B",
        sort_order: 7,
        yqm_text: "KORXONANI FAOLIYATI YURIDIK JIHATDAN XAVFSIZ BO'LISHINI TA'MINLASH",
      },
    ];

    const { data: depts, error: dErr } = await supabase.from("departments").insert(deptList).select();
    if (dErr) throw dErr;
    console.log("✅ Bo'limlar:", depts.length);

    const deptMap = Object.fromEntries(depts.map((d) => [d.name, d.id]));

    // 3. Positions (Mavjud va Rejalashtirilgan)
    const posList = [
      // 0. Boshqaruv
      {
        department_id: deptMap["Boshqaruv"],
        title: "ASOSCHI",
        yqm_text: "Korxona strategiyasi, missiyasi va yuksalishi",
        status: "mavjud",
        sort_order: 1,
      },
      {
        department_id: deptMap["Boshqaruv"],
        title: "MENEJER",
        yqm_text: "Operatsion boshqaruv va barcha bo'limlar integratsiyasi",
        status: "mavjud",
        sort_order: 2,
      },

      // 1. Moliya bo'limi
      {
        department_id: deptMap["Moliya"],
        title: "Bo'lim boshlig'i",
        yqm_text: "Moliya bo'limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 1,
      },
      {
        department_id: deptMap["Moliya"],
        title: "Moliyachi",
        yqm_text: "Korxonada pul oqimini to'g'ri bo'lishini ta'minlash va eng kerakli bo'lgan sohaga pul sarflanishini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 2,
      },
      {
        department_id: deptMap["Moliya"],
        title: "Buxgalter",
        yqm_text: "Korxonadagi barcha pulga doir ishlar hisobotini jamlab borish",
        status: "rejalashtirilgan",
        sort_order: 3,
      },

      // 2. Marketing bo'limi
      {
        department_id: deptMap["Marketing"],
        title: "Bo'lim boshlig'i",
        yqm_text: "Marketing bo'limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 1,
      },
      {
        department_id: deptMap["Marketing"],
        title: "Marketolog",
        yqm_text: "Korxonani o'z vaqtida rejali ravishda lidlar bilan ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 2,
      },
      {
        department_id: deptMap["Marketing"],
        title: "SMM menejer",
        yqm_text: "Ijtimoiy tarmoqlarni yurgazish orqali murojaatlar sonini oshirish",
        status: "rejalashtirilgan",
        sort_order: 3,
      },
      {
        department_id: deptMap["Marketing"],
        title: "Dizayner",
        yqm_text: "Marketing uchun kerak bo'ladigan grafik dizaynlarni tayyorlash",
        status: "rejalashtirilgan",
        sort_order: 4,
      },
      {
        department_id: deptMap["Marketing"],
        title: "Video montajor",
        yqm_text: "Marketing uchun kerak bo'ladigan videolarni syomka va montaj bo'lishini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 5,
      },

      // 3. Sotuv bo'limi
      {
        department_id: deptMap["Sotuv"],
        title: "Administrator",
        yqm_text: "1) Menyu olgan mijozlarni sinov darsga kelishini ta'minlash, 2) Sinov darsiga kelgan mijozlarga sotuvni amalga oshirib to'lovni yig'ish, 3) Tartib intizomni ta'minlash, 4) Qaynoq lidlar o'z vaqtida javob berilishini ta'minlash, 5) Qayta sotuvlar amalga oshirilishini ta'minlash",
        status: "mavjud",
        sort_order: 1,
      },
      {
        department_id: deptMap["Sotuv"],
        title: "Sotuv bo'lim boshlig'i",
        yqm_text: "Sotuvlar o'z vaqtida reja asosida bo'lishini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 2,
      },
      {
        department_id: deptMap["Sotuv"],
        title: "Sotuv menejeri",
        yqm_text: "Qayta sotuvlar amalga oshishini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 3,
      },
      {
        department_id: deptMap["Sotuv"],
        title: "Kiruvchi admin",
        yqm_text: "Murojaat qilgan mijozlarni korxonaga sinov darsiga kelishlarini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 4,
      },
      {
        department_id: deptMap["Sotuv"],
        title: "Chiquvchi admin",
        yqm_text: "Sinov darsiga kelgan mijozlarni to'lov qilishlari uchun taqdimot qilib sotuvni amalga oshirish",
        status: "rejalashtirilgan",
        sort_order: 5,
      },

      // 4. O'quv bo'limi
      {
        department_id: deptMap["O'quv"],
        title: "Ustoz",
        yqm_text: "Korxonada belgilangan metodlar asosida mijozlar bilim olishini ta'minlash",
        status: "mavjud",
        sort_order: 1,
      },
      {
        department_id: deptMap["O'quv"],
        title: "Support",
        yqm_text: "Ustozga yordam berish uchun mijozlarni bilim olishiga ko'maklashish",
        status: "mavjud",
        sort_order: 2,
      },
      {
        department_id: deptMap["O'quv"],
        title: "Bo'lim boshlig'i",
        yqm_text: "O'quv bo'limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 3,
      },
      {
        department_id: deptMap["O'quv"],
        title: "Metodist",
        yqm_text: "Darsliklardan foydalanish uchun yangi metodlar tuzib chiqish va ularni amalda qo'llanishini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 4,
      },
      {
        department_id: deptMap["O'quv"],
        title: "Katta ustoz",
        yqm_text: "Metodist tomonidan berilgan metodlarni korxonada joriy qilish va ustozlarni malakasini oshirishga ko'maklashish",
        status: "rejalashtirilgan",
        sort_order: 5,
      },
      {
        department_id: deptMap["O'quv"],
        title: "Assistent",
        yqm_text: "O'quv bo'limi uchun kerakli materiallarni tayyorlash",
        status: "rejalashtirilgan",
        sort_order: 6,
      },

      // 5. HR bo'limi
      {
        department_id: deptMap["HR"],
        title: "Bo'lim boshlig'i",
        yqm_text: "HR bo'limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 1,
      },
      {
        department_id: deptMap["HR"],
        title: "HR menejer",
        yqm_text: "Korxona uchun kerakli bo'lgan kadrlarni topish, tarbiyalash va xodimlarni olib qolish",
        status: "rejalashtirilgan",
        sort_order: 2,
      },

      // 6. Texnik bo'lim
      {
        department_id: deptMap["Texnik"],
        title: "Bo'lim boshlig'i",
        yqm_text: "Texnik bo'limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 1,
      },
      {
        department_id: deptMap["Texnik"],
        title: "Qorovul",
        yqm_text: "Korxona xavfsizligini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 2,
      },
      {
        department_id: deptMap["Texnik"],
        title: "Farrosh",
        yqm_text: "Korxona tozaligini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 3,
      },

      // 7. Yuridik bo'lim
      {
        department_id: deptMap["Yuridik"],
        title: "Bo'lim boshlig'i",
        yqm_text: "Yuridik bo'limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta'minlash",
        status: "rejalashtirilgan",
        sort_order: 1,
      },
      {
        department_id: deptMap["Yuridik"],
        title: "Yurist",
        yqm_text: "Korxonani yuridik jihatdan to'g'ri faoliyat olib borishi uchun barcha ishlarni bajarilishini ta'minlash va xat hujjatlar bilan bog'liq masalalarni bajarish",
        status: "rejalashtirilgan",
        sort_order: 2,
      },
    ];

    const { data: positions, error: pErr } = await supabase.from("positions").insert(posList).select();
    if (pErr) throw pErr;
    console.log("✅ Lavozimlar:", positions.length);

    console.log("\n🎉 Google Sheets asosidagi barcha ma'lumotlar muvaffaqiyatli saqlandi!");
  } catch (err) {
    console.error("Xatolik yuz berdi:", err);
  }
}

runSeed();
