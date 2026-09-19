import { Department, Position, Employee, Branch, TheoryBasisType } from "@/types";

export interface VysotskiyDivisionInfo {
  id: number;
  code: string;
  name: string;
  description: string;
  matchingDepts: string[];
  activePositionsCount: number;
  plannedPositionsCount: number;
  activeEmployeesCount: number;
  isCovered: boolean;
}

export interface TaskOverlapSignal {
  positionId: string;
  positionTitle: string;
  departmentName: string;
  employeeName?: string;
  yqmText: string;
  detectedDivisions: string[];
  severity: "high" | "medium";
  recommendedAction: string;
  neededRoleTitle: string;
}

export interface SpanOfControlSignal {
  branchCount: number;
  managerCount: number;
  branchesWithoutDedicatedManager: string[];
  directReportsCount: number;
  isOverloaded: boolean;
  recommendationNote: string;
}

export interface TargetRolePriority {
  positionId: string;
  positionTitle: string;
  departmentId: string;
  departmentName: string;
  priorityScore: number;
  theoryBasis: TheoryBasisType;
  reason: string;
}

export interface ComputedOrgSignals {
  vysotskiyDivisions: VysotskiyDivisionInfo[];
  uncoveredDivisions: VysotskiyDivisionInfo[];
  taskOverlaps: TaskOverlapSignal[];
  spanOfControl: SpanOfControlSignal;
  prioritizedTargetRoles: TargetRolePriority[];
  missingEssentialRoles: {
    title: string;
    departmentName: string;
    reason: string;
    theoryBasis: TheoryBasisType;
  }[];
  activeEmployeesCount: number;
  existingPositionsCount: number;
  plannedPositionsCount: number;
  branchCount: number;
}

// 7 Vysotskiy Functional Divisions Definition
export const VYSOTSKIY_DIVISIONS = [
  {
    id: 1,
    code: "Boshqaruv",
    name: "1. Boshqaruv (Strategiya va Maqsad)",
    description: "Korxona strategiyasi, missiyasi va umumiy yo'nalishini belgilash",
    keywords: ["boshqaruv", "asoschi", "direktor", "strategiya", "boshliq", "menejer"],
  },
  {
    id: 2,
    code: "Xodimlar",
    name: "2. Xodimlar va Qurilish (HR)",
    description: "Kadrlarni topish, ishga olish, o'qitish, moslashtirish va tuzilmani saqlash",
    keywords: ["hr", "kadr", "yollash", "tarbiyalash", "xodim"],
  },
  {
    id: 3,
    code: "Tarqatish_Sotuv",
    name: "3. Tarqatish va Sotuv-Marketing",
    description: "Mijozlarni jalb qilish, reklama, lidlar va sotuvni amalga oshirish",
    keywords: ["marketing", "sotuv", "smm", "dizayn", "video", "admin", "chiquvchi", "kiruvchi", "lid"],
  },
  {
    id: 4,
    code: "Moliya",
    name: "4. Moliya va Hisob",
    description: "Pul oqimi, kassa, buxgalteriya va korxona aktivlari hisobi",
    keywords: ["moliya", "buxgalter", "kassa", "hisobchi", "moliyachi"],
  },
  {
    id: 5,
    code: "Ishlab_Chiqarish",
    name: "5. Texnik va Ishlab Chiqarish (Ta'lim)",
    description: "Asosiy xizmat ko'rsatish — darslar berish, o'quv dasturlari va ta'lim jarayoni",
    keywords: ["o'quv", "oquv", "ustoz", "support", "assistent", "metodika", "ta'lim"],
  },
  {
    id: 6,
    code: "Sifat_Nazorati",
    name: "6. Sifat Nazorati (Quality Control)",
    description: "Ta'lim va xizmat sifatini tekshirish, nazorat qilish, standartlarni yaxshilash",
    keywords: ["sifat", "nazorat", "katta ustoz", "metodist", "audit", "inspeksiya"],
  },
  {
    id: 7,
    code: "PR_Aloqalar",
    name: "7. Jamoatchilik bilan Aloqalar (PR & Xavfsizlik)",
    description: "Brend nufuzi, yuridik xavfsizlik va binolar tartib-intizomi",
    keywords: ["yuridik", "yurist", "texnik", "qorovul", "farrosh", "tozalash", "xavfsizlik", "pr"],
  },
];

export function computeOrgSignals(params: {
  departments: Department[];
  positions: Position[];
  employees: Employee[];
  branches: Branch[];
}): ComputedOrgSignals {
  const { departments, positions, employees, branches } = params;

  // 1. Map Divisions and Coverage
  const vysotskiyDivisions: VysotskiyDivisionInfo[] = VYSOTSKIY_DIVISIONS.map((div) => {
    // Find matching positions
    const matchingPositions = positions.filter((p) => {
      const dept = departments.find((d) => d.id === p.department_id);
      const textToSearch = `${p.title} ${p.yqm_text || ""}`.toLowerCase();
      return div.keywords.some((kw) => textToSearch.includes(kw));
    });


    const activePositions = matchingPositions.filter((p) => p.status === "mavjud");
    const plannedPositions = matchingPositions.filter((p) => p.status === "rejalashtirilgan");

    const activeEmps = employees.filter((e) =>
      activePositions.some((p) => p.id === e.position_id)
    );

    const matchingDepts = Array.from(
      new Set(
        matchingPositions
          .map((p) => departments.find((d) => d.id === p.department_id)?.name)
          .filter(Boolean) as string[]
      )
    );

    return {
      id: div.id,
      code: div.code,
      name: div.name,
      description: div.description,
      matchingDepts,
      activePositionsCount: activePositions.length,
      plannedPositionsCount: plannedPositions.length,
      activeEmployeesCount: activeEmps.length,
      isCovered: activePositions.length > 0 && activeEmps.length > 0,
    };
  });

  const uncoveredDivisions = vysotskiyDivisions.filter((d) => !d.isCovered);

  // 2. Detect Task Overlaps (Vazifalar chatishmasi)
  const taskOverlaps: TaskOverlapSignal[] = [];

  positions
    .filter((p) => p.status === "mavjud")
    .forEach((pos) => {
      const dept = departments.find((d) => d.id === pos.department_id);
      const assignedEmp = employees.find((e) => e.position_id === pos.id);
      const yqm = (pos.yqm_text || "").toLowerCase();
      const title = pos.title.toLowerCase();

      // Check if Administrator or Front role combines Sales + Cleaning/Facility + Accounting
      const hasClientCare = yqm.includes("mijoz") || yqm.includes("sinov dars") || yqm.includes("lid") || title.includes("admin");
      const hasCleaning = yqm.includes("tozalash") || yqm.includes("farrosh") || yqm.includes("tartib intizom") || yqm.includes("xona");
      const hasFinance = yqm.includes("to'lov") || yqm.includes("pul") || yqm.includes("kassa") || yqm.includes("hisob");

      const detected: string[] = [];
      if (hasClientCare) detected.push("Mijozlarga xizmat va Sotuv");
      if (hasCleaning) detected.push("Tozalash va Texnik ishlar");
      if (hasFinance) detected.push("Kassa va To'lov yig'ish");

      // Check if Farrosh/Cleaner position is missing in active employees
      const hasActiveCleaner = employees.some((e) => {
        const p = positions.find((pos) => pos.id === e.position_id);
        return p && (p.title.toLowerCase().includes("farrosh") || p.title.toLowerCase().includes("tozalovchi"));
      });

      if ((title.includes("admin") || title.includes("menejer")) && !hasActiveCleaner) {

        taskOverlaps.push({
          positionId: pos.id,
          positionTitle: pos.title,
          departmentName: dept?.name || "Sotuv",
          employeeName: assignedEmp?.full_name,
          yqmText: pos.yqm_text || "",
          detectedDivisions: detected,
          severity: "high",
          recommendedAction: "Tozalov va texnik ishlarni admin zimmasidan olib, alohida tozalovchi (farrosh) xodimiga o'tkazish",
          neededRoleTitle: "Farrosh (Tozalovchi)",
        });
      }
    });

  // 3. Span of Control & Branch Analysis
  const branchCount = Math.max(branches.length, 1);
  const managerPositions = positions.filter((p) => {
    const t = p.title.toLowerCase();
    return (t.includes("menejer") || t.includes("direktor") || t.includes("boshliq")) && p.status === "mavjud";
  });
  const managerEmployees = employees.filter((e) =>
    managerPositions.some((p) => p.id === e.position_id)
  );

  const branchesWithoutDedicatedManager = branches
    .filter((b) => !positions.some((p) => p.branch_id === b.id && p.status === "mavjud"))
    .map((b) => b.name);

  const spanOfControl: SpanOfControlSignal = {
    branchCount,
    managerCount: managerEmployees.length,
    branchesWithoutDedicatedManager,
    directReportsCount: employees.length,
    isOverloaded: branchCount > 1 && managerEmployees.length <= 1,
    recommendationNote:
      branchCount > 1 && managerEmployees.length <= 1
        ? "Filiallar soni ko'paymoqda, lekin bitta menejer hammasini bevosita boshqarmoqda. Har bir filial uchun alohida menejer tayinlab, bosh menejerni sifat nazoratiga o'tkazish lozim."
        : "Menejerlar va filiallar nisbati me'yorda.",
  };

  // 4. Prioritize Target Roles
  const plannedPositions = positions.filter((p) => p.status === "rejalashtirilgan");
  const prioritizedTargetRoles: TargetRolePriority[] = plannedPositions.map((pos) => {
    const dept = departments.find((d) => d.id === pos.department_id);
    const title = pos.title.toLowerCase();

    let priorityScore = 3;
    let theoryBasis: TheoryBasisType = "greiner";
    let reason = "Tashkiliy tuzilmani reja asosida bosqichma-bosqich kengaytirish";

    if (title.includes("farrosh") || title.includes("tozalovchi")) {
      priorityScore = 1;
      theoryBasis = "face_overlap";
      reason = "Admin va asosiy xodimlarni takroriy tozalov ishlaridan ozod qilib, xizmat sifatini tiklash (Vysotskiy/FACe)";
    } else if (title.includes("menejer") || title.includes("direktor")) {
      priorityScore = branchCount > 1 ? 1 : 2;
      theoryBasis = "span_of_control";
      reason = "Filiallar boshqaruvini taqsimlash va nazorat radiusini tartibga solish (Span of Control)";
    } else if (title.includes("metodist") || title.includes("katta ustoz") || title.includes("sifat")) {
      priorityScore = 2;
      theoryBasis = "vysotskiy";
      reason = "Ta'lim va xizmat sifatini doimiy nazorat qilish bo'limini shakllantirish (Vysotskiy 6-yo'nalish)";
    } else if (title.includes("hr")) {
      priorityScore = 2;
      theoryBasis = "vysotskiy";
      reason = "Kadrlar oqimi va yangi xodimlarni tizimli qabul qilishni ta'minlash (Vysotskiy 2-yo'nalish)";
    }

    return {
      positionId: pos.id,
      positionTitle: pos.title,
      departmentId: pos.department_id,
      departmentName: dept?.name || "Bo'lim",
      priorityScore,
      theoryBasis,
      reason,
    };
  });

  prioritizedTargetRoles.sort((a, b) => a.priorityScore - b.priorityScore);

  // Missing Essential Roles Check
  const missingEssentialRoles: {
    title: string;
    departmentName: string;
    reason: string;
    theoryBasis: TheoryBasisType;
  }[] = [];

  const hasCleanerPosition = positions.some(
    (p) => p.title.toLowerCase().includes("farrosh") || p.title.toLowerCase().includes("tozalovchi")
  );
  if (!hasCleanerPosition) {
    missingEssentialRoles.push({
      title: "Farrosh (Tozalovchi)",
      departmentName: "Texnik",
      reason: "Admin va boshqa xodimlarni tozalov ishlaridan to'liq ozod qilib, asosiy mijozga xizmat vazifasiga e'tibor qaratish",
      theoryBasis: "face_overlap",
    });
  }

  const existingPositionsCount = positions.filter((p) => p.status === "mavjud").length;
  const plannedPositionsCount = plannedPositions.length;

  return {
    vysotskiyDivisions,
    uncoveredDivisions,
    taskOverlaps,
    spanOfControl,
    prioritizedTargetRoles,
    missingEssentialRoles,
    activeEmployeesCount: employees.length,
    existingPositionsCount,
    plannedPositionsCount,
    branchCount,
  };
}
