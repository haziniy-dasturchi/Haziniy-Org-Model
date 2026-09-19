import { readStore, writeStore, getLatestOrgAIAnalysis } from "../lib/dataStore";


async function runVerification() {
  console.log("=== TEST 1: INITIAL STATE ANALYSIS ===");
  const initAnalysis = await getLatestOrgAIAnalysis(true);
  console.log("Total recommendations:", initAnalysis.recommendations.length);
  initAnalysis.recommendations.forEach((r, i) => {
    console.log(`[#${r.priority}] (${r.theory_basis}) ${r.title}`);
    console.log(`  -> Text: "${r.text}"`);
  });

  console.log("\n=== TEST 2: REACTIVITY PROOF (RESOLVING CLEANER ROLE) ===");
  // Change Farrosh (pos-tex-3) to 'mavjud' and assign a cleaner employee
  const store = readStore();
  const farroshPos = store.positions.find((p) => p.id === "pos-tex-3");
  if (farroshPos) {
    farroshPos.status = "mavjud";
  }
  store.employees.push({
    id: "emp-cleaner-test",
    position_id: "pos-tex-3",
    full_name: "Dildora Tozalovchi",
    phone: "+998901234567",
    photo_url: null,
    hired_at: new Date().toISOString().split("T")[0],
    resume: null,
    portfolio_links: [],
    personal_yqm: "Binolar va oquv xonalari tozaligi",
    created_at: new Date().toISOString(),
  });
  writeStore(store);

  // Now run getLatestOrgAIAnalysis
  const updatedAnalysis = await getLatestOrgAIAnalysis();
  console.log("Updated recommendations count after adding Farrosh:", updatedAnalysis.recommendations.length);
  updatedAnalysis.recommendations.forEach((r, i) => {
    console.log(`[#${r.priority}] (${r.theory_basis}) ${r.title}`);
    console.log(`  -> Text: "${r.text}"`);
  });

  const hasCleanerRec = updatedAnalysis.recommendations.some(
    (r) =>
      r.suggested_position_title?.toLowerCase().includes("farrosh") ||
      r.title.toLowerCase().includes("farrosh") ||
      r.title.toLowerCase().includes("tozalovchi")
  );
  console.log(
    "\nHas cleaner recommendation after role was filled?:",
    hasCleanerRec ? "FAIL (still present)" : "PASS (successfully resolved and removed!)"
  );

  // Restore store
  const freshStore = readStore();
  const fPos = freshStore.positions.find((p) => p.id === "pos-tex-3");
  if (fPos) fPos.status = "rejalashtirilgan";
  freshStore.employees = freshStore.employees.filter((e) => e.id !== "emp-cleaner-test");
  writeStore(freshStore);
  console.log("\nStore restored to initial state.");
}

runVerification().catch(console.error);
