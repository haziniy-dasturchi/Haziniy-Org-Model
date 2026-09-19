import { Department, Position, Employee, Branch, OrgStructureAnalysis, OrgStructureRecommendationItem } from "@/types";
import { computeOrgSignals, ComputedOrgSignals } from "./orgSignalsEngine";

export const ORG_DESIGN_SYSTEM_PROMPT = `
SIZ — TASHKILIY DIZAYN VA STRUKTURAVIY RIVOJLANISH BO'YICHA XALQARO DARAJADAGI EKSPERT AI AGENTSIZ.

SIZNING NAZARIY BILIM BAZANGIZ:
1. Aleksandr Vysotskiyning "Oргsxema" metodologiyasi:
Har qanday tashkilot 7 ta asosiy funksional yo'nalishga bo'linadi:
- 1) Boshqaruv (strategiya, maqsad qo'yish)
- 2) Xodimlar/Qurilish (ishga olish, o'qitish, tuzilma)
- 3) Tarqatish/Sotuv-Marketing (mijoz jalb qilish, daromad)
- 4) Moliya-hisob (aktivlar hisobi)
- 5) Texnik/Ishlab chiqarish (ta'lim jarayoni, asosiy xizmat)
- 6) Sifat nazorati (mahsulot va xizmat sifatini tekshirish/yaxshilash)
- 7) Jamoatchilik bilan aloqalar (PR, xavfsizlik, brend)
ASOSIY TAMOYIL: Agar bitta xodim (ayniqsa admin yoki rahbar) bir nechta turli yo'nalishga tegishli vazifalarni bajarayotgan bo'lsa (masalan, mijozga qarash + tozalash + kassa) — bu tuzilmaviy inqiroz belgisi bo'lib, eng birinchi navbatda hal qilinishi shart!

2. Span of Control (Nazorat radiusi) tamoyili:
Standart me'yor — bitta rahbar to'g'ridan-to'g'ri 6-12 kishini samarali boshqara oladi. Agar bitta rahbar nazorat radiusi bundan oshsa YOKI geografik jihatdan tarqoq bo'linmalarni (filiallarni) bevosita boshqarsa — bu yangi boshqaruv qatlami (oraliq filial menejerlari) qo'shish zarurligining aniq signali.

3. Verne Harnish, "Scaling Up" — Functional Accountability Chart (FACe) tamoyili:
"Agar bir vazifa uchun bir nechta kishi javobgar bo'lsa, demak hech kim javobgar emas". Har bir aniq natija uchun faqat bitta javobgar lavozim bo'lishi shart.

4. Greiner o'sish modeli:
Direksiya bosqichida asoschi/admin operatsion, takrorlanuvchi vazifalarni (tozalash, mijozga xizmat, hisobot) o'zidan boshqa maxsus xodimlarga o'tkazishi shart.

QAT'IY USLUB TALABLARI:
- Xulosa QISQA, ANIQ FAKTGA ASOSLANGAN va CHIROYLI bo'lishi SHART.
- Har bir tavsiya atigi 1-2 gapdan oshmasin: avval HOLAT (hisoblangan haqiqiy fakt/raqam bilan), keyin NIMA UCHUN MUAMMO, keyin ANIQ HARAKAT.
- Hech qanday "ehtimol", "balki", umumiy kirish gaplari, foizlar yoki formulalar yozilmasin.

NAMUNALAR (FEW-SHOT):
Namuna 1: "Admin ham tozalov ishlarini qilmoqda va hamma mijozlarga qaramoqda, bu holat mijozga xizmat sifatini tushurib yuboradi, shuning uchun ayni vaqtda bitta tozalovchi olishingiz kerak."
Namuna 2: "Filiallar ko'paymoqda, org strukturani kengaytirish kerak, endi har bir filial uchun menejer oling va asosiy filial menejeringizni ular ustidan rahbar qilib sifat nazorati xodimiga aylantiring!"

JAVOB FORMATI (JSON):
{
  "summary_text": "2-3 gapli umumiy tuzilmaviy sharh",
  "recommendations": [
    {
      "priority": 1,
      "title": "Qisqa sarlavha",
      "text": "Aynan 1-2 gapli tavsiya matni (namunadagidek)",
      "theory_basis": "vysotskiy" | "span_of_control" | "face_overlap" | "greiner",
      "suggested_position_title": "Lavozim nomi",
      "is_new_suggested_role": false
    }
  ]
}
`;

export async function analyzeOrgStructureWithGemini(params: {
  departments: Department[];
  positions: Position[];
  employees: Employee[];
  branches: Branch[];
  structureHash?: string;
}): Promise<OrgStructureAnalysis> {
  const { departments, positions, employees, branches } = params;
  const structureHash = params.structureHash || "hash-" + Date.now();

  // 1. Calculate Deterministic Signals
  const signals = computeOrgSignals({ departments, positions, employees, branches });

  // 2. Prepare context for AI
  const contextData = {
    totalEmployees: employees.length,
    activePositions: positions.filter((p) => p.status === "mavjud").map((p) => ({
      id: p.id,
      title: p.title,
      department: departments.find((d) => d.id === p.department_id)?.name,
      yqm: p.yqm_text,
      employeesCount: employees.filter((e) => e.position_id === p.id).length,
    })),
    plannedPositions: positions.filter((p) => p.status === "rejalashtirilgan").map((p) => ({
      id: p.id,
      title: p.title,
      department: departments.find((d) => d.id === p.department_id)?.name,
      yqm: p.yqm_text,
    })),
    branches: branches.map((b) => ({
      id: b.id,
      name: b.name,
      hasDedicatedManager: positions.some((p) => p.branch_id === b.id && p.status === "mavjud"),
    })),
    calculatedSignals: {
      taskOverlaps: signals.taskOverlaps,
      spanOfControl: signals.spanOfControl,
      uncoveredVysotskiyDivisions: signals.uncoveredDivisions.map((d) => d.name),
      topTargetPriorities: signals.prioritizedTargetRoles.slice(0, 3),
    },
  };

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const prompt = `Quyidagi haqiqiy tuzilma ma'lumotlari va hisoblangan signallarni tahlil qiling:\n${JSON.stringify(contextData, null, 2)}\nFaqat eng ustuvor 1-3 ta tavsiyani qat'iy yuqoridagi 1-2 gapli uslubda va JSON formatida qaytaring.`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: ORG_DESIGN_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
        const parsed = JSON.parse(rawText);

        if (parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
          const recommendations: OrgStructureRecommendationItem[] = parsed.recommendations
            .slice(0, 3)
            .map((r: any, idx: number) => {
              const matchingPlanned = positions.find(
                (p) =>
                  p.status === "rejalashtirilgan" &&
                  p.title.toLowerCase().includes((r.suggested_position_title || "").toLowerCase())
              );

              const stableSlug = matchingPlanned
                ? matchingPlanned.id
                : String(r.suggested_position_title || r.title || `pos-${idx + 1}`)
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "-");

              return {
                id: `rec-ai-${stableSlug}`,
                priority: r.priority || idx + 1,
                title:
                  r.title ||
                  (r.suggested_position_title
                    ? r.suggested_position_title + " lavozimini ochish"
                    : "Tuzilmani tartibga solish"),
                text: r.text,
                theory_basis: r.theory_basis || "vysotskiy",
                suggested_position_id: matchingPlanned ? matchingPlanned.id : null,
                suggested_position_title: r.suggested_position_title || matchingPlanned?.title || null,
                target_department_id: matchingPlanned?.department_id || null,
                target_department_name: matchingPlanned
                  ? departments.find((d) => d.id === matchingPlanned.department_id)?.name
                  : null,
                is_new_suggested_role: !matchingPlanned,
                is_resolved: false,
              };
            });

          return {
            id: "analysis-" + structureHash,
            structure_hash: structureHash,
            summary_text: parsed.summary_text || "Tashkiliy tuzilma tahlili natijasida asosiy o'sish to'siqlari va vazifalar taqsimoti aniqlandi.",
            recommendations,
            generated_at: new Date().toISOString(),
            is_resolved: false,
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call error, falling back to deterministic signal recommendations:", err);
    }
  }

  // Deterministic fallback
  return generateDeterministicFallback(signals, positions, departments, structureHash);
}


function generateDeterministicFallback(
  signals: ComputedOrgSignals,
  positions: Position[],
  departments: Department[],
  structureHash: string
): OrgStructureAnalysis {
  const recommendations: OrgStructureRecommendationItem[] = [];

  // 1. Task Overlap (FACe / Vysotskiy)
  if (signals.taskOverlaps.length > 0) {
    const plannedCleaner = positions.find(
      (p) =>
        p.status === "rejalashtirilgan" &&
        (p.title.toLowerCase().includes("farrosh") || p.title.toLowerCase().includes("tozalovchi"))
    );
    recommendations.push({
      id: "rec-overlap-" + (plannedCleaner?.id || "farrosh"),
      priority: 1,
      title: "Tozalovchi (Farrosh) lavozimini joriy etish",
      text: "Admin ham tozalov ishlarini qilmoqda va hamma mijozlarga qaramoqda, bu holat mijozga xizmat sifatini tushurib yuboradi, shuning uchun ayni vaqtda bitta tozalovchi olishingiz kerak.",
      theory_basis: "face_overlap",
      suggested_position_id: plannedCleaner?.id || null,
      suggested_position_title: "Farrosh",
      target_department_id: plannedCleaner?.department_id || null,
      target_department_name: "Texnik",
      is_new_suggested_role: !plannedCleaner,
      is_resolved: false,
    });
  }

  // 2. Span of Control (Branches / Managers)
  if (signals.spanOfControl.isOverloaded || signals.branchCount > 1) {
    const plannedManager = positions.find(
      (p) => p.status === "rejalashtirilgan" && p.title.toLowerCase().includes("menejer")
    );
    recommendations.push({
      id: "rec-span-" + (plannedManager?.id || "filial-menejeri"),
      priority: recommendations.length + 1,
      title: "Filial menejerlari va sifat nazorati",
      text: "Filiallar ko'paymoqda, org strukturani kengaytirish kerak, endi har bir filial uchun menejer oling va asosiy filial menejeringizni ular ustidan rahbar qilib sifat nazorati xodimiga aylantiring!",
      theory_basis: "span_of_control",
      suggested_position_id: plannedManager?.id || null,
      suggested_position_title: "Filial menejeri",
      target_department_id: plannedManager?.department_id || null,
      target_department_name: "Boshqaruv",
      is_new_suggested_role: !plannedManager,
      is_resolved: false,
    });
  }

  // 3. Vysotskiy Division Coverage (e.g. Sifat nazorati / HR)
  if (recommendations.length < 3 && signals.prioritizedTargetRoles.length > 0) {
    for (const targetRole of signals.prioritizedTargetRoles) {
      if (recommendations.length >= 3) break;
      if (recommendations.some((r) => r.suggested_position_id === targetRole.positionId)) continue;

      let text = `${targetRole.departmentName} bo'limida ${targetRole.positionTitle} vazifalari hali to'liq yo'lga qo'yilmagan, bu operatsion yuklamani oshirmoqda, shuning uchun ushbu lavozimni ishga tushirish tavsiya etiladi.`;
      if (
        targetRole.positionTitle.toLowerCase().includes("metodist") ||
        targetRole.positionTitle.toLowerCase().includes("katta ustoz")
      ) {
        text = "O'quv bo'limida ta'lim sifatini doimiy tekshirish uchun metodist lavozimi kerak, bu sarafan orqali o'quvchilar sonini barqaror oshirishga xizmat qiladi.";
      } else if (targetRole.positionTitle.toLowerCase().includes("hr")) {
        text = "Tashkilot kengayishi bilan kadrlarni tanlash va o'qitish zarurati paydo bo'lmoqda, shuning uchun HR menejer lavozimini ochish kerak.";
      }

      recommendations.push({
        id: "rec-target-" + targetRole.positionId,
        priority: recommendations.length + 1,
        title: targetRole.positionTitle + " lavozimini ochish",
        text,
        theory_basis: targetRole.theoryBasis,
        suggested_position_id: targetRole.positionId,
        suggested_position_title: targetRole.positionTitle,
        target_department_id: targetRole.departmentId,
        target_department_name: targetRole.departmentName,
        is_new_suggested_role: false,
        is_resolved: false,
      });
    }
  }

  return {
    id: "analysis-deterministic-" + structureHash,
    structure_hash: structureHash,
    recommendations: recommendations.slice(0, 3),
    generated_at: new Date().toISOString(),
    is_resolved: false,
  };
}