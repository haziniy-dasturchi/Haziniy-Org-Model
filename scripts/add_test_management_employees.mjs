import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("Xatolik: Supabase URL yoki ANON KEY topilmadi.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function main() {
  console.log("🔍 Boshqaruv bo'limi va lavozimlarini tekshirish...");

  // 1. Get or create Boshqaruv department
  let { data: dept } = await supabase
    .from("departments")
    .select("*")
    .ilike("name", "%Boshqaruv%")
    .maybeSingle();

  if (!dept) {
    console.log("Boshqaruv bo'limi yaratilmoqda...");
    const { data: newDept, error: deptErr } = await supabase
      .from("departments")
      .insert({
        name: "Boshqaruv",
        color_hex: "#0F172A",
        sort_order: 0,
        yqm_text: "Markaz strategiyasi, missiyasi va barcha bo'limlar integratsiyasi",
      })
      .select()
      .single();

    if (deptErr) {
      console.error("Dept insert error:", deptErr);
    }
    dept = newDept;
  }

  const deptId = dept ? dept.id : null;
  console.log("Boshqaruv bo'limi ID:", deptId);

  // 2. Find or create ASOSCHI and MENEJER positions
  let { data: positions } = await supabase
    .from("positions")
    .select("*")
    .eq("department_id", deptId);

  let asoschiPos = positions?.find((p) => p.title.toUpperCase().includes("ASOSCHI"));
  let menejerPos = positions?.find((p) => p.title.toUpperCase().includes("MENEJER") || p.title.toUpperCase().includes("DIREKTOR"));

  if (!asoschiPos && deptId) {
    const { data: newAsoschi } = await supabase
      .from("positions")
      .insert({
        department_id: deptId,
        title: "ASOSCHI",
        yqm_text: "Korxona strategiyasi, missiyasi va yuksalishi",
        status: "mavjud",
        sort_order: 1,
      })
      .select()
      .single();
    asoschiPos = newAsoschi;
  }

  if (!menejerPos && deptId) {
    const { data: newMenejer } = await supabase
      .from("positions")
      .insert({
        department_id: deptId,
        title: "MENEJER",
        yqm_text: "Operatsion boshqaruv va barcha bo'limlar integratsiyasi",
        status: "mavjud",
        sort_order: 2,
      })
      .select()
      .single();
    menejerPos = newMenejer;
  }

  console.log("ASOSCHI lavozimi ID:", asoschiPos?.id);
  console.log("MENEJER lavozimi ID:", menejerPos?.id);

  // 3. Insert 2 employees into employees table
  const testEmployees = [
    {
      position_id: asoschiPos?.id || null,
      full_name: "Vaqtinchalik ma'lumot — admin panel orqali to'ldiriladi",
      phone: "+998 (88) 969-23-13",
      hired_at: new Date().toISOString().split("T")[0],
      personal_yqm: "Korxona strategiyasi, missiyasi va yuksalishi (Vaqtinchalik)",
      resume: "Ushbu profil Asoschi lavozimi uchun vaqtinchalik yaratilgan. Haqiqiy ma'lumotlar Admin panel orqali to'ldiriladi.",
      portfolio_links: [],
    },
    {
      position_id: menejerPos?.id || null,
      full_name: "Vaqtinchalik ma'lumot — admin panel orqali to'ldiriladi",
      phone: "+998 (88) 969-23-13",
      hired_at: new Date().toISOString().split("T")[0],
      personal_yqm: "Operatsion boshqaruv va barcha bo'limlar integratsiyasi (Vaqtinchalik)",
      resume: "Ushbu profil Menejer lavozimi uchun vaqtinchalik yaratilgan. Haqiqiy ma'lumotlar Admin panel orqali to'ldiriladi.",
      portfolio_links: [],
    },
  ];

  const { data: insertedEmployees, error: empErr } = await supabase
    .from("employees")
    .insert(testEmployees)
    .select();

  if (empErr) {
    console.error("Employees insert error:", empErr);
    process.exit(1);
  }

  console.log("\n🎉 Muvaffaqiyatli kiritildi!");
  insertedEmployees.forEach((emp, idx) => {
    const role = idx === 0 ? "ASOSCHI" : "MENEJER";
    console.log(`\n[${role}] xodimi:`);
    console.log(`ID: ${emp.id}`);
    console.log(`URL: http://localhost:3000/xodim/${emp.id}`);
  });
}

main();
