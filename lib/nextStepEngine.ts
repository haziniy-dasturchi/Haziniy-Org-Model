// Haziniy ORG Model — "Keyingi qadam" ko'p qoidali tahlil va tavsiya dvigateli
// To'liq spetsifikatsiya:
// 1. Xavf qoidalari (Yagona nuqta, Yuklama nomutanosibligi >80 -> P1, 50-80 -> P2)
// 2. "Avval yaxshilang, keyin oling" mantiqi (Tarixni tekshirish, 30 kunlik sinov, improve -> hire evolyutsiyasi)
// 3. 6 ta o'sish qoidasi (Filial sig'imi >=90%, Marketolog, Sotuv, Buxgalter, Texnik, Barqarorlik)
// 4. Moliyaviy trend (Oxirgi 3 ta snapshot, Upward/Downward/Flat, <2 bo'lsa cheklangan tarix)
// 5. Affordability (Average Net Profit >= Salary * 1.25 VA Worst Net Profit >= Salary)
// 6. Konservativ Value Reasoning (Min/Max oraliq, faqat min qiymatdan foydalanish)
// 7. Bosqich mosligi (1-4 bosqichlar) va TOP-3 ustuvor ro'yxat

import {
  Department,
  Position,
  Employee,
  FinanceSnapshot,
  Branch,
  RecommendationItem,
  EngineAnalysisResult,
  AIRecommendation,
  SuggestedActionType,
} from "@/types";

export interface EngineConfigAssumptions {
  studentsPerGroup?: number;
  minBufferMultiplier?: number; // default 1.25 (25% xavfsizlik zaxirasi)
  defaultAverageSalary?: number;
}

export interface EngineInputData {
  departments: (Department & { positions?: (Position & { employees?: Employee[] })[] })[];
  positions: Position[];
  employees: Employee[];
  financeSnapshots: FinanceSnapshot[];
  branches?: Branch[];
  recommendationHistory?: AIRecommendation[];
  config?: EngineConfigAssumptions;
}

/**
 * 1. Filial va O'quvchilar soni bo'yicha Bosqichni aniqlash (Stage Alignment)
 * 1-bosqich: 1 ta filial, < 500 o'quvchi
 * 2-bosqich: 1 ta filial, 500 – 750 o'quvchi (bandlik > 60%)
 * 3-bosqich: 1 ta filial, 750 – 960 o'quvchi (maksimal sig'im)
 * 4-bosqich: 2+ filial yoki > 1000 o'quvchi (tarmoq modeli)
 */
export function determineGrowthStage(
  totalStudents: number,
  branchCount: number
): {
  stage: number;
  name: string;
  description: string;
  targetCapacity: number;
  occupancyRatePct: number;
} {
  let targetCapacity = 500;
  let stage = 1;
  let name = "1-bosqich: Poydevor va asosiy xizmat";
  let description = "Dastlabki 500 o'quvchigacha bo'lgan davr: asosiy e'tibor ta'lim sifati va barqaror o'quv jarayoniga qaratiladi.";

  if (branchCount >= 2 || totalStudents >= 1000) {
    stage = 4;
    targetCapacity = Math.max(1500, Math.round(totalStudents * 1.3));
    name = "4-bosqich: Filiallar tarmog'i va korporativ boshqaruv";
    description = "Bir nechta filiallar bo'yicha markazlashgan standartlar, filial direktorlari va sifat nazorati.";
  } else if (totalStudents >= 750) {
    stage = 3;
    targetCapacity = 960;
    name = "3-bosqich: Maksimal sig'im va tizimli nazorat";
    description = "Filialning 960 tagacha maksimal sig'imiga chiqish, o'quv bo'limi boshlig'i va buxgalteriya nazorati.";
  } else if (totalStudents >= 500) {
    stage = 2;
    targetCapacity = 750;
    name = "2-bosqich: Jarayonlarni standartlashtirish va marketing";
    description = "500-750 o'quvchi oralig'i: kuchli marketing, sotuv bo'limi va metodistni shakllantirish.";
  }

  const occupancyRatePct = targetCapacity > 0 ? Math.min(100, Math.round((totalStudents / targetCapacity) * 100)) : 0;

  return {
    stage,
    name,
    description,
    targetCapacity,
    occupancyRatePct,
  };
}

/**
 * 2. Moliyaviy trend va ko'p snapshotli ko'rsatkichlar
 * - Oxirgi 3 ta snapshot tahlili
 * - Average va Worst Net Profit hisobi (Affordability uchun)
 * - 2 tadan kam yozuv bo'lsa trend filtri o'tkazib yuboriladi
 */
export function analyzeFinanceMultiSnapshot(snapshots: FinanceSnapshot[]): {
  trend: "upward" | "downward" | "flat";
  growthRatePct: number;
  latestRevenue: number;
  latestExpenses: number;
  latestNetProfit: number;
  averageNetProfit: number;
  worstNetProfit: number;
  averageCoursePrice: number;
  hasSufficientHistory: boolean;
  trendNote: string;
} {
  if (!snapshots || snapshots.length === 0) {
    return {
      trend: "flat",
      growthRatePct: 0,
      latestRevenue: 0,
      latestExpenses: 0,
      latestNetProfit: 0,
      averageNetProfit: 0,
      worstNetProfit: 0,
      averageCoursePrice: 250000,
      hasSufficientHistory: false,
      trendNote: "Trend aniqlash uchun hali yetarli moliyaviy tarix yo'q (cheklangan tarix).",
    };
  }

  // Sanasi bo'yicha eskidan yangiga saralaymiz
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
  );

  // Oxirgi 3 tagacha snapshot
  const recentSnapshots = sorted.slice(-3);
  const latest = recentSnapshots[recentSnapshots.length - 1];
  const latestRevenue = Number(latest.monthly_revenue) || 0;
  const latestExpenses = Number(latest.monthly_expenses) || 0;
  const latestNetProfit = latestRevenue - latestExpenses;

  // Net profitlar ro'yxati
  const netProfits = recentSnapshots.map((s) => (Number(s.monthly_revenue) || 0) - (Number(s.monthly_expenses) || 0));
  const averageNetProfit = Math.round(netProfits.reduce((a, b) => a + b, 0) / netProfits.length);
  const worstNetProfit = Math.min(...netProfits);

  // O'rtacha kurs narxi
  let avgPrice = 250000;
  if (latest.course_prices && typeof latest.course_prices === "object") {
    const prices = Object.values(latest.course_prices)
      .map(Number)
      .filter((p) => p > 0);
    if (prices.length > 0) {
      avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    }
  }

  // 2 tadan kam yozuv bo'lsa
  if (sorted.length < 2) {
    return {
      trend: "flat",
      growthRatePct: 0,
      latestRevenue,
      latestExpenses,
      latestNetProfit,
      averageNetProfit,
      worstNetProfit,
      averageCoursePrice: avgPrice,
      hasSufficientHistory: false,
      trendNote: "Trend aniqlash uchun hali yetarli moliyaviy tarix yo'q (cheklangan tarix).",
    };
  }

  // 2 yoki 3 ta yozuv dinamikasi
  const prev = sorted[sorted.length - 2];
  const prevRevenue = Number(prev.monthly_revenue) || 0;

  let growthRatePct = 0;
  if (prevRevenue > 0) {
    growthRatePct = Math.round(((latestRevenue - prevRevenue) / prevRevenue) * 100);
  }

  let trend: "upward" | "downward" | "flat" = "flat";
  let trendNote = "";

  if (growthRatePct >= 3) {
    trend = "upward";
    trendNote = `Oylik tushum o'tgan davrga nisbatan +${growthRatePct}% ga o'sdi (O'suvchi trend).`;
  } else if (growthRatePct <= -3) {
    trend = "downward";
    trendNote = `Oylik tushum o'tgan davrga nisbatan ${growthRatePct}% ga pasaydi (Pasayuvchi trend). Yangi xarajatlardan oldin tushumni barqarorlashtirish zarur.`;
  } else {
    trend = "flat";
    trendNote = `Oylik tushum deyarli o'zgarishsiz (${growthRatePct}%). Barqaror dinamika kuzatilmoqda.`;
  }

  return {
    trend,
    growthRatePct,
    latestRevenue,
    latestExpenses,
    latestNetProfit,
    averageNetProfit,
    worstNetProfit,
    averageCoursePrice: avgPrice,
    hasSufficientHistory: true,
    trendNote,
  };
}

/**
 * 3. Asosiy Qoidaviy Tahlil Dvigateli
 */
export function analyzeNextSteps(data: EngineInputData): EngineAnalysisResult {
  const {
    departments,
    positions,
    employees,
    financeSnapshots,
    branches = [],
    recommendationHistory = [],
    config = {},
  } = data;

  const candidates: RecommendationItem[] = [];
  const studentsPerGroup = config.studentsPerGroup || 16;
  const bufferMultiplier = config.minBufferMultiplier || 1.25;

  // 1. Moliya tahlili
  const fin = analyzeFinanceMultiSnapshot(financeSnapshots);

  // 2. O'quvchilar sonini aniqlash
  const latestSnapshot =
    financeSnapshots && financeSnapshots.length > 0
      ? [...financeSnapshots]
          .sort((a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime())
          .pop()
      : null;

  let totalStudents = 0;
  if (
    latestSnapshot &&
    (latestSnapshot.main_branch_students != null || latestSnapshot.xazina_branch_students != null)
  ) {
    totalStudents =
      (Number(latestSnapshot.main_branch_students) || 0) +
      (Number(latestSnapshot.xazina_branch_students) || 0);
  } else if (branches.length > 0) {
    totalStudents = branches.reduce((sum, b) => sum + (Number(b.student_count) || 0), 0);
  } else if (fin.latestRevenue > 0 && fin.averageCoursePrice > 0) {
    totalStudents = Math.round(fin.latestRevenue / fin.averageCoursePrice);
  } else {
    totalStudents = 320;
  }

  const branchCount = Math.max(1, branches.length);
  const stageInfo = determineGrowthStage(totalStudents, branchCount);

  // Bo'sh sig'im
  const availableCapacity = Math.max(0, stageInfo.targetCapacity - totalStudents);
  const potentialGroups = Math.max(1, Math.floor(availableCapacity / studentsPerGroup));

  // Konservativ va optimistik talabalar chegarasi
  const conservativeMinStudents = Math.max(
    12,
    Math.min(availableCapacity > 0 ? availableCapacity : 24, potentialGroups * 12)
  );
  const optimisticMaxStudents = Math.max(
    24,
    Math.min(availableCapacity > 0 ? availableCapacity : 48, potentialGroups * 16)
  );

  // Bo'limlar bo'yicha xodimlarni xaritalash
  const deptEmployeesMap = new Map<string, Employee[]>();
  departments.forEach((d) => deptEmployeesMap.set(d.id, []));

  employees.forEach((emp) => {
    if (!emp.position_id) return;
    const pos = positions.find((p) => p.id === emp.position_id);
    if (pos && pos.department_id) {
      const list = deptEmployeesMap.get(pos.department_id) || [];
      list.push(emp);
      deptEmployeesMap.set(pos.department_id, list);
    }
  });

  // Affordability tekshiruv yordamchisi:
  // is_affordable = (average_net_profit >= salary * 1.25) AND (worst_net_profit >= salary)
  function evaluateAffordability(estSalary: number) {
    const requiredThreshold = Math.round(estSalary * bufferMultiplier);
    const avgPass = fin.averageNetProfit >= requiredThreshold;
    const worstPass = fin.worstNetProfit >= estSalary;
    const isAffordable = avgPass && worstPass;

    const deficit = isAffordable ? 0 : Math.max(0, requiredThreshold - fin.averageNetProfit);

    return {
      is_affordable: isAffordable,
      average_net_profit: fin.averageNetProfit,
      worst_net_profit: fin.worstNetProfit,
      estimated_salary: estSalary,
      required_threshold: requiredThreshold,
      deficit: deficit,
    };
  }

  // Tarixdan avvalgi "improve" tavsiyasi berilganligini tekshirish yordamchisi
  function hasPriorImprovementAttempt(deptId?: string, ruleType?: string): {
    attempted: boolean;
    attemptDate?: string;
    daysAgo?: number;
  } {
    if (!recommendationHistory || recommendationHistory.length === 0) {
      return { attempted: false };
    }

    for (const rec of recommendationHistory) {
      const items = rec.recommendations || rec.structured_items || [];
      const match = items.find(
        (it) => (deptId && it.department_id === deptId) || (ruleType && it.rule_type === ruleType)
      );

      if (match && match.suggested_action === "improve") {
        const dateVal = rec.created_at || rec.generated_at || new Date().toISOString();
        const createdTime = new Date(dateVal).getTime();
        const daysAgo = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
        return {
          attempted: true,
          attemptDate: dateVal,
          daysAgo: daysAgo,
        };
      }
    }
    return { attempted: false };
  }

  let singlePointCount = 0;
  let workloadImbalanceCount = 0;

  // =========================================================================
  // XAVF QOIDASI 1: Yagona nuqta (Single Point of Failure)
  // =========================================================================
  departments.forEach((dept) => {
    const deptEmps = deptEmployeesMap.get(dept.id) || [];
    if (deptEmps.length === 1) {
      singlePointCount++;
      const soleEmp = deptEmps[0];
      candidates.push({
        id: `rec-risk-single-${dept.id}`,
        rule_type: "risk_single_point",
        priority: 1,
        department_id: dept.id,
        title: `Xavf: "${dept.name}" bo'limida yagona nuqta (Single Point of Failure)`,
        short_reason: `Bo'limda faqat 1 nafar xodim (${soleEmp.full_name}) ishlamoqda. Xodim kutilmaganda ketib qolsa, butun bo'lim faoliyati to'xtaydi.`,
        suggested_action: "rebalance",
        action_description: `Bo'limdagi jarayonlarni reglamentlashtirish va zudlik bilan assistent yoki dublyor tayyorlash.`,
        suggested_position: `${dept.name} assistenti / dublyori`,
        related_risk: `Bo'lim uzluksizligining bitta xodimga 100% bog'lanib qolishi.`,
        trend_note: fin.trendNote,
      });
    }
  });

  // =========================================================================
  // XAVF QOIDASI 2: Yuklama nomutanosibligi (Workload Imbalance)
  // finance_snapshot.max_teacher_load va min_teacher_load farqi: >80 -> P1, 50-80 -> P2
  // =========================================================================
  const maxLoad =
    latestSnapshot?.max_teacher_load != null ? Number(latestSnapshot.max_teacher_load) : null;
  const minLoad =
    latestSnapshot?.min_teacher_load != null ? Number(latestSnapshot.min_teacher_load) : null;

  if (maxLoad !== null && minLoad !== null && maxLoad > 0 && minLoad >= 0) {
    const diff = maxLoad - minLoad;
    if (diff > 50) {
      workloadImbalanceCount++;
      const isCritical = diff > 80;

      candidates.push({
        id: `rec-risk-workload-${Date.now()}`,
        rule_type: "risk_workload",
        priority: isCritical ? 1 : 2,
        title: `Xavf: Ustozlar yuklamasida nomutanosiblik (${diff} ta o'quvchi farqi)`,
        short_reason: `Eng band ustozda ${maxLoad} ta, eng bo'sh faol ustozda esa ${minLoad} ta o'quvchi qayd etilgan (farq: ${diff} ta).`,
        suggested_action: "rebalance",
        action_description: `Guruhlarni qayta taqsimlash yoki yuklamasi yuqori ustozga yordamchi biriktirish orqali o'quv sifatini tenglashtirish.`,
        suggested_position: "Yordamchi ustoz / Support",
        related_risk: "Haddan tashqari yuklangan ustozda charchash (burnout) va dars sifatining keskin pasayishi.",
        trend_note: fin.trendNote,
      });
    }
  }

  // =========================================================================
  // O'SISH QOIDALARI: "AVVAL YAXSHILANG, KEYIN OLING" MANTIQI BILAN
  // =========================================================================

  // 1. Marketing Bo'limi:
  // Bo'sh (0 xodim) -> To'g'ridan-to'g'ri "hire"
  const marketingDept = departments.find((d) => d.name.toLowerCase().includes("marketing"));
  const marketingEmps = marketingDept ? deptEmployeesMap.get(marketingDept.id) || [] : [];
  if (marketingDept && marketingEmps.length === 0) {
    const estSalary = 6000000;
    const afford = evaluateAffordability(estSalary);
    const minRev = conservativeMinStudents * fin.averageCoursePrice;
    const maxRev = optimisticMaxStudents * fin.averageCoursePrice;
    const roi = (minRev / estSalary).toFixed(1);

    candidates.push({
      id: "rec-growth-marketolog",
      rule_type: "growth_missing_role",
      priority: fin.hasSufficientHistory && fin.trend === "upward" ? 1 : 2,
      department_id: marketingDept.id,
      title: "O'sish: Marketing bo'limiga mutaxassis jalb qilish",
      short_reason: "Marketing bo'limida birorta ham faol xodim yo'q. Yangi o'quvchilar oqimi to'xtab qolish xavfi mavjud.",
      suggested_action: "hire",
      action_description: "Sotuv voronkasi va muntazam reklama oqimini yo'lga qo'yish uchun Marketolog / Targetolog qabul qilish.",
      suggested_position: "Targetolog / Raqamli marketolog",
      affordability: afford,
      value_reasoning: {
        conservative_min_students: conservativeMinStudents,
        optimistic_max_students: optimisticMaxStudents,
        min_added_revenue: minRev,
        max_added_revenue: maxRev,
        roi_multiple: roi,
        explanation: `Taxminiy maosh: ${estSalary.toLocaleString()} so'm (25% zaxira bilan talab: ${afford.required_threshold.toLocaleString()} so'm). Bo'sh sig'im bo'yicha konservativ taxmin: +${conservativeMinStudents} ta o'quvchi (tushum: +${minRev.toLocaleString()} so'm), optimistik taxmin: +${optimisticMaxStudents} ta o'quvchi (tushum: +${maxRev.toLocaleString()} so'm). ROI ~${roi}x barobar.`,
      },
      trend_note: fin.trendNote,
      stage_context: {
        stage: stageInfo.stage,
        stage_name: stageInfo.name,
        student_count: totalStudents,
        capacity_estimate: stageInfo.targetCapacity,
        occupancy_rate_pct: stageInfo.occupancyRatePct,
      },
    });
  }

  // 2. Sotuv Bo'limi:
  // Agar xodim bor (1 xodim) va o'quvchilar >= 400 bo'lsa:
  // "AVVAL YAXSHILANG, KEYIN OLING":
  // 1-marta bo'lsa -> "improve" (KPI, trening, vazifalar taqsimoti, 30 kunlik sinov)
  // Agar oldingi "improve" tavsiyasidan keyin ham muammo davom etsa -> "hire"
  const sotuvDept = departments.find((d) => d.name.toLowerCase().includes("sotuv"));
  const sotuvEmps = sotuvDept ? deptEmployeesMap.get(sotuvDept.id) || [] : [];
  if (totalStudents >= 400 && sotuvDept && sotuvEmps.length === 1) {
    const prior = hasPriorImprovementAttempt(sotuvDept.id, "growth_expansion");
    const estSalary = 4500000;
    const afford = evaluateAffordability(estSalary);
    const minRev = conservativeMinStudents * fin.averageCoursePrice;
    const maxRev = optimisticMaxStudents * fin.averageCoursePrice;

    if (!prior.attempted || (prior.daysAgo && prior.daysAgo < 30)) {
      // 1-bosqich: YAXSHILASH
      candidates.push({
        id: "rec-growth-sales-improve",
        rule_type: "growth_process_improvement",
        priority: 2,
        department_id: sotuvDept.id,
        title: "Jarayonni yaxshilash: Sotuv administratori samaradorligini oshirish",
        short_reason: `O'quvchilar soni ${totalStudents} ta, bitta sotuv xodimi faoliyat yuritmoqda. Yangi shtat ochishdan oldin mavjud xodimning konversiyasini oshirish maqsadga muvofiq.`,
        suggested_action: "improve",
        review_period_days: 30,
        action_description: `Avval mavjud Administratorning ish sifatini va konversiyasini yaxshilang: qo'ng'iroqlar skriptini joriy qiling, lidlarga javob berish vaqtini 15 daqiqaga tushiring va natijani 4–6 hafta (30 kun) kuzating.`,
        suggested_position: "Administrator (Mavjud xodimni kuchaytirish)",
        trend_note: fin.trendNote,
        stage_context: {
          stage: stageInfo.stage,
          stage_name: stageInfo.name,
          student_count: totalStudents,
          capacity_estimate: stageInfo.targetCapacity,
          occupancy_rate_pct: stageInfo.occupancyRatePct,
        },
      });
    } else {
      // 2-bosqich: OLISH (Avvalgi yaxshilash yetarli bo'lmagan)
      candidates.push({
        id: "rec-growth-sales-hire",
        rule_type: "growth_expansion",
        priority: 2,
        department_id: sotuvDept.id,
        title: "Sotuvni kengaytirish: Ikkinchi sotuv menejeri",
        short_reason: `Avvalgi jarayonni yaxshilash va 30 kunlik sinov davri o'tdi, biroq yuklama yuqoriligicha qolmoqda. Endi sotuvni ixtisoslashtirish uchun yangi xodim zarur.`,
        suggested_action: "hire",
        action_description: `Kiruvchi va chiquvchi qo'ng'iroqlarni 2 ta mutaxassisga ajratib, yangi sotuv menejerini jalb qilish.`,
        suggested_position: "Lidlar bo'yicha sotuv menejeri",
        affordability: afford,
        value_reasoning: {
          conservative_min_students: conservativeMinStudents,
          optimistic_max_students: optimisticMaxStudents,
          min_added_revenue: minRev,
          max_added_revenue: maxRev,
          roi_multiple: (minRev / estSalary).toFixed(1),
          explanation: `Yangi menejer oylik kamida +${conservativeMinStudents} ta yangi o'quvchi yozdirsa, tushum +${minRev.toLocaleString()} so'mga oshadi (Maosh xarajati: ${estSalary.toLocaleString()} so'm).`,
        },
        trend_note: fin.trendNote,
        stage_context: {
          stage: stageInfo.stage,
          stage_name: stageInfo.name,
          student_count: totalStudents,
          capacity_estimate: stageInfo.targetCapacity,
          occupancy_rate_pct: stageInfo.occupancyRatePct,
        },
      });
    }
  }

  // 3. Moliya Bo'limi (Buxgalteriya):
  // O'quvchilar >= 300 va xodim 0 ta bo'lsa -> Direct "hire"
  const moliyaDept = departments.find(
    (d) => d.name.toLowerCase().includes("moliya") || d.name.toLowerCase().includes("buxg")
  );
  const moliyaEmps = moliyaDept ? deptEmployeesMap.get(moliyaDept.id) || [] : [];
  if (totalStudents >= 300 && moliyaDept && moliyaEmps.length === 0) {
    const estSalary = 5000000;
    const afford = evaluateAffordability(estSalary);
    const estimatedSavings = Math.round(fin.latestRevenue * 0.05);

    candidates.push({
      id: "rec-growth-buxgalter",
      rule_type: "growth_missing_role",
      priority: 2,
      department_id: moliyaDept.id,
      title: "Moliyaviy intizom: Buxgalter / Moliyachi qabul qilish",
      short_reason: `O'quvchilar soni ${totalStudents} nafarga yetdi, biroq alohida buxgalter yo'q. Pul oqimi va hisob-kitoblar xavf ostida.`,
      suggested_action: "hire",
      action_description: `Tushum, xarajatlar va qarzdorliklar auditini qat'iy nazoratga oluvchi buxgalter shtatini joriy qilish.`,
      suggested_position: "Bosh buxgalter / Moliyachi",
      affordability: afford,
      value_reasoning: {
        conservative_min_students: 0,
        optimistic_max_students: 0,
        min_added_revenue: estimatedSavings,
        max_added_revenue: estimatedSavings * 1.5,
        roi_multiple: (estimatedSavings / estSalary).toFixed(1),
        explanation: `Qarzdorliklarni kamaytirish va moliyaviy audit orqali oylik kamida ~${estimatedSavings.toLocaleString()} so'm yo'qotishlarning oldi olinadi.`,
      },
      trend_note: fin.trendNote,
      stage_context: {
        stage: stageInfo.stage,
        stage_name: stageInfo.name,
        student_count: totalStudents,
        capacity_estimate: stageInfo.targetCapacity,
        occupancy_rate_pct: stageInfo.occupancyRatePct,
      },
    });
  }

  // 4. Filial Bandligi >= 90% (Kengayish qoidasi)
  if (stageInfo.occupancyRatePct >= 90) {
    candidates.push({
      id: "rec-growth-expansion-branch",
      rule_type: "growth_expansion",
      priority: 1,
      title: `Kengayish: Filial sig'imi to'ldi (${stageInfo.occupancyRatePct}% bandlik)`,
      short_reason: `Mavjud filial sig'imi deyarli maksimal chegarada (${totalStudents}/${stageInfo.targetCapacity} ta o'quvchi). Yangi talabalarni qabul qilish uchun qo'shimcha xonalar yoki 2-filial kerak.`,
      suggested_action: "hire",
      action_description: `2-smena guruhlarini ochish, qo'shimcha xonalarni ijaraga olish yoki yangi filial loyihasini boshlash.`,
      suggested_position: "Filial koordinatori / Boshqaruvchi",
      trend_note: fin.trendNote,
      stage_context: {
        stage: stageInfo.stage,
        stage_name: stageInfo.name,
        student_count: totalStudents,
        capacity_estimate: stageInfo.targetCapacity,
        occupancy_rate_pct: stageInfo.occupancyRatePct,
      },
    });
  }

  // 5. Texnik bo'lim / Xavfsizlik qoidasi: Agar 0 ta bo'lsa
  const texnikDept = departments.find((d) => d.name.toLowerCase().includes("texnik"));
  const texnikEmps = texnikDept ? deptEmployeesMap.get(texnikDept.id) || [] : [];
  if (totalStudents >= 250 && texnikDept && texnikEmps.length === 0) {
    candidates.push({
      id: "rec-growth-texnik-safety",
      rule_type: "growth_missing_role",
      priority: 3,
      department_id: texnikDept.id,
      title: "Texnik ta'minot: Bino tozaligi va xavfsizligini ta'minlash",
      short_reason: `${totalStudents} nafar o'quvchi uchun binoning tozaligi, texnik jihozlari va xavfsizligini muntazam nazorat qiluvchi xodim zarur.`,
      suggested_action: "hire",
      action_description: `Farrosh / Qorovul shtatlarini to'ldirish yoki texnik xizmatni autsorsing qilish.`,
      suggested_position: "Texnik xodim / Farrosh",
      trend_note: fin.trendNote,
    });
  }

  // 6. Bosqichga mos strategik monitoring (Agar 1-prioritetdagi xavflar bo'lmasa)
  if (candidates.filter((c) => c.priority === 1).length === 0) {
    candidates.push({
      id: `rec-stage-alignment-${stageInfo.stage}`,
      rule_type: "stage_alignment",
      priority: 3,
      title: `${stageInfo.name}: Strategik mustahkamlash`,
      short_reason: `Markaz hozirda ${totalStudents} nafar o'quvchi bilan ${stageInfo.stage}-bosqichda barqaror ishlamoqda (Sig'im: ${stageInfo.targetCapacity} ta, Bandlik: ${stageInfo.occupancyRatePct}%).`,
      suggested_action: "monitor",
      action_description: stageInfo.description,
      trend_note: fin.trendNote,
      stage_context: {
        stage: stageInfo.stage,
        stage_name: stageInfo.name,
        student_count: totalStudents,
        capacity_estimate: stageInfo.targetCapacity,
        occupancy_rate_pct: stageInfo.occupancyRatePct,
      },
    });
  }

  // =========================================================================
  // TREND FILTRI: Agar tushum pasayayotgan bo'lsa, o'sish xarajatlari ustuvorligi pasaytiriladi
  // =========================================================================
  if (fin.hasSufficientHistory && fin.trend === "downward") {
    candidates.forEach((c) => {
      if (c.suggested_action === "hire" && c.rule_type !== "risk_single_point") {
        c.priority = 3;
        c.short_reason = `[DIQQAT: Daromad pasaymoqda] ` + c.short_reason;
      }
    });
  }

  // Saralash: 1) Priority (1 -> 2 -> 3), 2) Xavflar birinchi, 3) Action: "improve" oldin "hire"
  candidates.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    const isRiskA = a.rule_type.startsWith("risk_");
    const isRiskB = b.rule_type.startsWith("risk_");
    if (isRiskA && !isRiskB) return -1;
    if (!isRiskA && isRiskB) return 1;

    if (a.suggested_action === "improve" && b.suggested_action === "hire") return -1;
    if (a.suggested_action === "hire" && b.suggested_action === "improve") return 1;

    return 0;
  });

  // TOP-3 tavsiyani tanlash
  const topRecommendations = candidates.slice(0, 3);

  return {
    recommendations: topRecommendations,
    meta: {
      total_students: totalStudents,
      total_revenue: fin.latestRevenue,
      total_expenses: fin.latestExpenses,
      average_net_profit: fin.averageNetProfit,
      worst_net_profit: fin.worstNetProfit,
      net_profit: fin.latestNetProfit,
      revenue_trend: fin.trend,
      growth_rate_pct: fin.growthRatePct,
      has_sufficient_history: fin.hasSufficientHistory,
      growth_stage: stageInfo.stage,
      growth_stage_name: stageInfo.name,
      single_point_risks_count: singlePointCount,
      workload_imbalances_count: workloadImbalanceCount,
    },
  };
}
