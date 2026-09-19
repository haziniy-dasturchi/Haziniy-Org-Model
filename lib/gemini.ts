// Haziniy ORG Model — Gemini AI NLP Sintezi va Xulosa Dvigateli

import { EngineAnalysisResult } from "@/types";

/**
 * AI uchun qoidalar dvigateli natijalarini formatlash
 */
export function formatEngineSummaryForPrompt(analysis: EngineAnalysisResult): string {
  const { recommendations, meta } = analysis;
  let text = `HAZINIY O'QUV MARKAZI TASHKILIY VA MOLIYAVIY TAHLILI:\n`;
  text += `- Jami o'quvchilar soni: ${meta.total_students} ta\n`;
  text += `- O'sish bosqichi: ${meta.growth_stage}-bosqich (${meta.growth_stage_name})\n`;
  text += `- Oylik tushum: ${meta.total_revenue.toLocaleString()} so'm, Xarajat: ${meta.total_expenses.toLocaleString()} so'm, Sof foyda: ${meta.net_profit.toLocaleString()} so'm\n`;
  text += `- O'rtacha sof foyda: ${meta.average_net_profit.toLocaleString()} so'm, Eng past sof foyda: ${meta.worst_net_profit.toLocaleString()} so'm\n`;
  text += `- Moliyaviy trend: ${meta.revenue_trend} (O'sish sur'ati: ${meta.growth_rate_pct}%, Tarix yetarlimi: ${meta.has_sufficient_history})\n`;
  text += `- Aniqlangan xavflar: Yagona nuqta: ${meta.single_point_risks_count} ta, Yuklama nomutanosibligi: ${meta.workload_imbalances_count} ta\n\n`;

  text += `TAVSIYALAR RO'YXATI (Bular pastdagi kartalarda alohida ko'rsatiladi):\n`;
  recommendations.forEach((rec, idx) => {
    text += `${idx + 1}. [${rec.rule_type}] ${rec.title} -> ${rec.suggested_action.toUpperCase()}\n`;
  });

  return text;
}

/**
 * Qisqa, o'qishga qulay 2-3 gapli umumiy strategik sharh (kartalardagi raqamlarni takrorlamasdan)
 */
export function synthesizeDeterministicSummary(analysis: EngineAnalysisResult): string {
  const { meta } = analysis;

  const sentences: string[] = [];

  // 1-gap: Kirish va joriy bosqich
  sentences.push(
    `Haziniy o'quv markazi hozirda ${meta.total_students} nafar o'quvchi bilan ${meta.growth_stage}-bosqichda (${meta.growth_stage_name}) faoliyat olib bormoqda hamda oylik sof foyda ${meta.net_profit.toLocaleString()} so'mni tashkil qilmoqda.`
  );

  // 2-gap: Moliyaviy trend holati
  if (!meta.has_sufficient_history) {
    sentences.push(
      "Trend aniqlash uchun hali yetarli moliyaviy tarix mavjud emas (cheklangan tarix), shu sababli barcha tashkiliy o'zgarishlar ehtiyotkorlik bilan rejalashtirilmoqda."
    );
  } else if (meta.revenue_trend === "upward") {
    sentences.push(
      `Oylik daromad o'tgan davrga nisbatan +${meta.growth_rate_pct}% ga o'sib, barqaror ijobiy dinamika va strategik kengayish imkoniyatini ko'rsatmoqda.`
    );
  } else if (meta.revenue_trend === "downward") {
    sentences.push(
      `DIQQAT: Oylik tushum o'tgan davrga nisbatan ${meta.growth_rate_pct}% ga pasaygan. Yangi xarajatlardan oldin tushumni barqarorlashtirish zarur.`
    );
  } else {
    sentences.push(
      "Oylik daromad barqaror saqlanmoqda, bu esa mavjud jarayonlarni optimallashtirish va mustahkamlash uchun qulay imkoniyat yaratadi."
    );
  }

  // 3-gap: Yakuniy yo'naltirish va majburiy ogohlantirish
  sentences.push(
    "Quyidagi TOP-3 amaliy qadamlar tashkiliy xavflarni kamaytirish va tizimli o'sishni jadallashtirish uchun shakllantirildi. Bu hisob-kitob, yakuniy qarorni admin qabul qiladi."
  );

  return sentences.join("\n\n");
}

/**
 * Gemini AI orqali 2-3 gapli qisqa, umumiy strategik xulosa yaratish
 */
export async function generateGeminiRecommendation(analysis: EngineAnalysisResult): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key-here" || apiKey.trim() === "") {
    return synthesizeDeterministicSummary(analysis);
  }

  const promptSummary = formatEngineSummaryForPrompt(analysis);
  const systemInstruction = `Siz "Haziniy ORG Model" o'quv markazining bosh tashkiliy va moliyaviy maslahatchisisiz.
Quyidagi umumiy ko'rsatkichlar asosida O'zbek tilida atigi 2-3 gapdan iborat ixcham, o'qishga juda qulay UMUMIY strategik xulosa yozing.

Qat'iy talablar:
1. Aynan 2 yoki 3 ta gapdan iborat bo'lsin.
2. Pastdagi kartalarda aytilgan tafsilotlarni, har bir xodim maoshini va kichik hisob-kitoblarni bu yerda TAKRORLAMA. Faqat umumiy bosqich, joriy moliyaviy trend va markazning holatini bayon qiling.
3. Har bir gapni bitta bo'sh qator tashlab (yangi xatboshi qilib) ajrating.
4. Oxirgi gap DOIMO aynan shunday tugasin: "Bu hisob-kitob, yakuniy qarorni admin qabul qiladi."
5. Hech qanday sarlavhalarsiz, toza va professional o'zbek tilida taqdim eting.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction}\n\nMA'LUMOTLAR:\n${promptSummary}` }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 350,
          },
        }),
      }
    );

    if (!res.ok) {
      console.warn("Gemini API request failed, using deterministic fallback:", res.statusText);
      return synthesizeDeterministicSummary(analysis);
    }

    const json = await res.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText && candidateText.trim().length > 30) {
      let finalStr = candidateText.trim();
      const disclaimer = "Bu hisob-kitob, yakuniy qarorni admin qabul qiladi.";
      if (!finalStr.includes(disclaimer)) {
        finalStr += "\n\n" + disclaimer;
      }
      return finalStr;
    }
    return synthesizeDeterministicSummary(analysis);
  } catch (err) {
    console.error("Gemini API error, using deterministic fallback:", err);
    return synthesizeDeterministicSummary(analysis);
  }
}
