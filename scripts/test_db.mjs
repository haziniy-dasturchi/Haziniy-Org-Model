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

async function testFetch() {
  console.log("🔍 Supabase bazasi tekshirilmoqda...");

  const { data: branches, error: bErr } = await supabase.from("branches").select("*");
  if (bErr) console.error("Branches error:", bErr);
  else console.log(`✅ Filiallar: ${branches.length} ta`, branches.map(b => b.name));

  const { data: depts, error: dErr } = await supabase.from("departments").select("*").order("sort_order");
  if (dErr) console.error("Departments error:", dErr);
  else console.log(`✅ Bo'limlar: ${depts.length} ta`, depts.map(d => d.name));

  const { data: positions, error: pErr } = await supabase.from("positions").select("*");
  if (pErr) console.error("Positions error:", pErr);
  else console.log(`✅ Lavozimlar: ${positions.length} ta`);

  const { data: fin, error: fErr } = await supabase.from("finance_snapshot").select("*");
  if (fErr) console.error("Finance error:", fErr);
  else console.log(`✅ Moliya snapshot: ${fin.length} ta`);
}

testFetch();
