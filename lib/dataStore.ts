import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Department, Position, Employee, Branch, OrgStructureAnalysis, OrgStructureRecommendationItem } from "@/types";
import {
  DEFAULT_SHEETS_DEPARTMENTS,
  DEFAULT_TEST_EMPLOYEES,
  HAZINIY_MAIN_MISSION,
} from "./defaultOrgData";
import { analyzeOrgStructureWithGemini } from "./geminiOrgAgent";

const isVercel = Boolean(process.env.VERCEL);
const localDataDir = path.join(process.cwd(), "data");
const localStoreFilePath = path.join(localDataDir, "org_store.json");

const vercelDataDir = "/tmp";
const vercelStoreFilePath = path.join(vercelDataDir, "org_store.json");

const dataDir = isVercel ? vercelDataDir : localDataDir;
const storeFilePath = isVercel ? vercelStoreFilePath : localStoreFilePath;

export const DEFAULT_BRANCHES: Branch[] = [
  {
    id: "branch-1",
    name: "Asosiy filial",
    student_count: 358,
    room_count: 6,
    capacity_estimate: 960,
    created_at: new Date().toISOString(),
  },
  {
    id: "branch-2",
    name: "Xazina filial",
    student_count: 88,
    room_count: 0,
    capacity_estimate: 0,
    created_at: new Date().toISOString(),
  },
];

interface OrgStoreSchema {
  departments: Department[];
  positions: (Position & { department_id?: string; branch_id?: string | null })[];
  employees: Employee[];
  branches: Branch[];
  mission: string;
  orgAnalysis?: OrgStructureAnalysis;
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not ensure data directory:", err);
  }
}

function getInitialStore(): OrgStoreSchema {
  const departments: Department[] = DEFAULT_SHEETS_DEPARTMENTS.map((d) => ({
    id: d.id,
    name: d.name,
    color_hex: d.color_hex,
    sort_order: d.sort_order,
    yqm_text: d.yqm_text,
    created_at: d.created_at || new Date().toISOString(),
  }));

  const positions: Position[] = DEFAULT_SHEETS_DEPARTMENTS.flatMap((d) =>
    d.positions.map((p) => ({
      id: p.id,
      department_id: d.id,
      title: p.title,
      yqm_text: p.yqm_text,
      status: p.status,
      sort_order: p.sort_order,
      branch_id: null,
      created_at: p.created_at || new Date().toISOString(),
    }))
  );

  const employees: Employee[] = [
    ...DEFAULT_TEST_EMPLOYEES.map((e) => ({
      id: e.id,
      position_id: e.position_id,
      full_name: e.full_name,
      phone: e.phone,
      photo_url: e.photo_url,
      hired_at: e.hired_at,
      personal_yqm: e.personal_yqm,
      resume: e.resume,
      portfolio_links: e.portfolio_links || [],
      created_at: e.created_at || new Date().toISOString(),
    })),
  ];

  return {
    departments,
    positions,
    employees,
    branches: DEFAULT_BRANCHES,
    mission: HAZINIY_MAIN_MISSION,
  };
}

export function readStore(): OrgStoreSchema {
  ensureDataDir();
  try {
    // 1. On Vercel: initialize /tmp/org_store.json from bundled local file if not present yet
    if (isVercel && !fs.existsSync(storeFilePath) && fs.existsSync(localStoreFilePath)) {
      try {
        const bundled = fs.readFileSync(localStoreFilePath, "utf8");
        fs.writeFileSync(storeFilePath, bundled, "utf8");
      } catch (copyErr) {
        console.warn("Could not copy bundled store to /tmp, will read direct:", copyErr);
      }
    }

    const targetFileToRead = fs.existsSync(storeFilePath)
      ? storeFilePath
      : (fs.existsSync(localStoreFilePath) ? localStoreFilePath : null);

    if (targetFileToRead) {
      const content = fs.readFileSync(targetFileToRead, "utf8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.departments)) {
        if (!Array.isArray(parsed.branches)) {
          parsed.branches = DEFAULT_BRANCHES;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading org_store.json:", err);
  }

  const initial = getInitialStore();
  writeStore(initial);
  return initial;
}

export function writeStore(store: OrgStoreSchema) {
  ensureDataDir();
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing org_store.json:", err);
  }
}

// ==========================================
// 1. DEPARTMENTS CRUD
// ==========================================

export function getDepartments(): Department[] {
  const store = readStore();
  return [...store.departments].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function getDepartmentById(id: string): Department | null {
  const store = readStore();
  return store.departments.find((d) => d.id === id) || null;
}

export function saveDepartment(data: Partial<Department>): Department {
  const store = readStore();
  let updatedDept: Department;

  if (data.id) {
    const idx = store.departments.findIndex((d) => d.id === data.id);
    if (idx >= 0) {
      updatedDept = {
        ...store.departments[idx],
        ...data,
        name: (data.name || store.departments[idx].name).trim(),
      };
      store.departments[idx] = updatedDept;
    } else {
      updatedDept = {
        id: data.id,
        name: (data.name || "Yangi bo'lim").trim(),
        color_hex: data.color_hex || "#003933",
        sort_order: Number(data.sort_order) || 0,
        yqm_text: data.yqm_text?.trim() || null,
        created_at: new Date().toISOString(),
      };
      store.departments.push(updatedDept);
    }
  } else {
    updatedDept = {
      id: "dept-" + Date.now(),
      name: (data.name || "Yangi bo'lim").trim(),
      color_hex: data.color_hex || "#003933",
      sort_order: Number(data.sort_order) || 0,
      yqm_text: data.yqm_text?.trim() || null,
      created_at: new Date().toISOString(),
    };
    store.departments.push(updatedDept);
  }

  delete store.orgAnalysis;
  writeStore(store);
  return updatedDept;
}

export function deleteDepartment(id: string): boolean {
  const store = readStore();
  store.departments = store.departments.filter((d) => d.id !== id);
  delete store.orgAnalysis;
  writeStore(store);
  return true;
}

// ==========================================
// 2. POSITIONS CRUD
// ==========================================

export function getPositions(): (Position & { department?: Department; branch?: Branch | null })[] {
  const store = readStore();
  const deptMap = new Map(store.departments.map((d) => [d.id, d]));
  const branchMap = new Map((store.branches || []).map((b) => [b.id, b]));

  return store.positions
    .map((p) => ({
      ...p,
      department: p.department_id ? deptMap.get(p.department_id) : undefined,
      branch: p.branch_id ? branchMap.get(p.branch_id) || null : null,
    }))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function getPositionById(id: string): (Position & { department?: Department; branch?: Branch | null }) | null {
  const store = readStore();
  const pos = store.positions.find((p) => p.id === id);
  if (!pos) return null;

  const dept = pos.department_id
    ? store.departments.find((d) => d.id === pos.department_id)
    : undefined;
  const branch = pos.branch_id
    ? (store.branches || []).find((b) => b.id === pos.branch_id) || null
    : null;

  return { ...pos, department: dept, branch };
}

export function savePosition(data: Partial<Position>): Position {
  const store = readStore();
  let updatedPos: Position;

  if (data.id) {
    const idx = store.positions.findIndex((p) => p.id === data.id);
    if (idx >= 0) {
      const prev = store.positions[idx];
      updatedPos = {
        ...prev,
        ...data,
        title: (data.title || prev.title).trim(),
        branch_id: data.branch_id !== undefined ? (data.branch_id || null) : (prev.branch_id || null),
      };
      store.positions[idx] = updatedPos;
    } else {
      updatedPos = {
        id: data.id,
        department_id: data.department_id || store.departments[0]?.id || "dept-boshqaruv",
        title: (data.title || "Yangi lavozim").trim(),
        yqm_text: data.yqm_text?.trim() || null,
        status: data.status === "rejalashtirilgan" ? "rejalashtirilgan" : "mavjud",
        sort_order: Number(data.sort_order) || 0,
        branch_id: data.branch_id || null,
        created_at: new Date().toISOString(),
      };
      store.positions.push(updatedPos);
    }
  } else {
    updatedPos = {
      id: "pos-" + Date.now(),
      department_id: data.department_id || store.departments[0]?.id || "dept-boshqaruv",
      title: (data.title || "Yangi lavozim").trim(),
      yqm_text: data.yqm_text?.trim() || null,
      status: data.status === "rejalashtirilgan" ? "rejalashtirilgan" : "mavjud",
      sort_order: Number(data.sort_order) || 0,
      branch_id: data.branch_id || null,
      created_at: new Date().toISOString(),
    };
    store.positions.push(updatedPos);
  }

  delete store.orgAnalysis;
  writeStore(store);
  return updatedPos;
}

export function deletePosition(id: string): boolean {
  const store = readStore();
  store.positions = store.positions.filter((p) => p.id !== id);
  delete store.orgAnalysis;
  writeStore(store);
  return true;
}

// ==========================================
// 3. EMPLOYEES CRUD
// ==========================================

export function getEmployees(): (Employee & {
  position?: Position & { department?: Department };
})[] {
  const store = readStore();
  const deptMap = new Map(store.departments.map((d) => [d.id, d]));
  const posMap = new Map(
    store.positions.map((p) => [
      p.id,
      { ...p, department: p.department_id ? deptMap.get(p.department_id) : undefined },
    ])
  );

  return store.employees.map((e) => ({
    ...e,
    position: e.position_id ? posMap.get(e.position_id) : undefined,
  }));
}

export function getEmployeeById(id: string): (Employee & {
  position?: Position & { department?: Department };
}) | null {
  const store = readStore();
  const emp = store.employees.find((e) => e.id === id);
  if (!emp) return null;

  const deptMap = new Map(store.departments.map((d) => [d.id, d]));
  const pos = emp.position_id
    ? store.positions.find((p) => p.id === emp.position_id)
    : null;

  const positionWithDept = pos
    ? { ...pos, department: pos.department_id ? deptMap.get(pos.department_id) : undefined }
    : undefined;

  return { ...emp, position: positionWithDept };
}

export function saveEmployee(data: Partial<Employee>): Employee {
  const store = readStore();
  let updatedEmp: Employee;

  if (data.id) {
    const idx = store.employees.findIndex((e) => e.id === data.id);
    if (idx >= 0) {
      const current = store.employees[idx];
      updatedEmp = {
        ...current,
        ...data,
        full_name: (data.full_name || current.full_name).trim(),
        position_id: data.position_id !== undefined ? (data.position_id || null) : current.position_id,
        phone: data.phone !== undefined ? (data.phone || null) : current.phone,
        photo_url: data.photo_url !== undefined ? (data.photo_url || null) : current.photo_url,
        hired_at: data.hired_at !== undefined ? (data.hired_at || null) : current.hired_at,
        personal_yqm: data.personal_yqm !== undefined ? (data.personal_yqm || null) : current.personal_yqm,
        resume: data.resume !== undefined ? (data.resume || null) : current.resume,
        portfolio_links: Array.isArray(data.portfolio_links)
          ? data.portfolio_links
          : current.portfolio_links || [],
      };
      store.employees[idx] = updatedEmp;
    } else {
      updatedEmp = {
        id: data.id,
        position_id: data.position_id || null,
        full_name: (data.full_name || "Yangi xodim").trim(),
        phone: data.phone || null,
        photo_url: data.photo_url || null,
        hired_at: data.hired_at || null,
        personal_yqm: data.personal_yqm || null,
        resume: data.resume || null,
        portfolio_links: Array.isArray(data.portfolio_links) ? data.portfolio_links : [],
        created_at: new Date().toISOString(),
      };
      store.employees.push(updatedEmp);
    }
  } else {
    updatedEmp = {
      id: "emp-" + Date.now(),
      position_id: data.position_id || null,
      full_name: (data.full_name || "Yangi xodim").trim(),
      phone: data.phone || null,
      photo_url: data.photo_url || null,
      hired_at: data.hired_at || null,
      personal_yqm: data.personal_yqm || null,
      resume: data.resume || null,
      portfolio_links: Array.isArray(data.portfolio_links) ? data.portfolio_links : [],
      created_at: new Date().toISOString(),
    };
    store.employees.push(updatedEmp);
  }

  // If employee is assigned to a position, ensure that position's status is 'mavjud'
  if (updatedEmp.position_id) {
    const posIdx = store.positions.findIndex((p) => p.id === updatedEmp.position_id);
    if (posIdx >= 0 && store.positions[posIdx].status === "rejalashtirilgan") {
      store.positions[posIdx].status = "mavjud";
    }
  }

  delete store.orgAnalysis;
  writeStore(store);
  return updatedEmp;
}

export function deleteEmployee(id: string): boolean {
  const store = readStore();
  store.employees = store.employees.filter((e) => e.id !== id);
  delete store.orgAnalysis;
  writeStore(store);
  return true;
}

// ==========================================
// 4. BRANCHES CRUD
// ==========================================

export function getBranches(): Branch[] {
  const store = readStore();
  if (Array.isArray(store.branches) && store.branches.length > 0) {
    return store.branches;
  }
  return DEFAULT_BRANCHES;
}

export function saveBranch(data: Partial<Branch>): Branch {
  const store = readStore();
  if (!Array.isArray(store.branches)) {
    store.branches = [...DEFAULT_BRANCHES];
  }

  let updatedBranch: Branch;

  if (data.id) {
    const idx = store.branches.findIndex((b) => b.id === data.id);
    if (idx >= 0) {
      updatedBranch = {
        ...store.branches[idx],
        name: (data.name || store.branches[idx].name).trim(),
        student_count:
          data.student_count !== undefined
            ? Number(data.student_count) || 0
            : store.branches[idx].student_count,
        room_count:
          data.room_count !== undefined
            ? Number(data.room_count) || 0
            : store.branches[idx].room_count,
        capacity_estimate:
          data.capacity_estimate !== undefined
            ? Number(data.capacity_estimate) || 0
            : store.branches[idx].capacity_estimate,
      };
      store.branches[idx] = updatedBranch;
    } else {
      updatedBranch = {
        id: data.id,
        name: (data.name || "Yangi filial").trim(),
        student_count: Number(data.student_count) || 0,
        room_count: Number(data.room_count) || 0,
        capacity_estimate: Number(data.capacity_estimate) || 0,
        created_at: new Date().toISOString(),
      };
      store.branches.push(updatedBranch);
    }
  } else {
    updatedBranch = {
      id: "branch-" + Date.now(),
      name: (data.name || "Yangi filial").trim(),
      student_count: Number(data.student_count) || 0,
      room_count: Number(data.room_count) || 0,
      capacity_estimate: Number(data.capacity_estimate) || 0,
      created_at: new Date().toISOString(),
    };
    store.branches.push(updatedBranch);
  }

  delete store.orgAnalysis;
  writeStore(store);
  return updatedBranch;
}

export function deleteBranch(id: string): boolean {
  const store = readStore();
  if (Array.isArray(store.branches)) {
    store.branches = store.branches.filter((b) => b.id !== id);
    delete store.orgAnalysis;
    writeStore(store);
  }
  return true;
}

// ==========================================
// 5. MISSION SETTINGS
// ==========================================

export function getMission(): string {
  const store = readStore();
  return store.mission || HAZINIY_MAIN_MISSION;
}

export function saveMission(mission: string): string {
  const store = readStore();
  store.mission = mission.trim();
  writeStore(store);
  return store.mission;
}

// ==========================================
// 6. FULL ORG CHART STRUCTURE (Used by / and /admin)
// ==========================================

export function getFullOrgStructure(): any[] {
  const store = readStore();
  const employees = getEmployees();
  const branchMap = new Map((store.branches || []).map((b) => [b.id, b]));

  return store.departments
    .map((dept) => {
      const deptPositions = store.positions
        .filter((p) => p.department_id === dept.id)
        .map((pos) => {
          const posEmployees = employees.filter((e) => e.position_id === pos.id);
          const effectiveStatus = posEmployees.length > 0 ? "mavjud" : pos.status;
          return {
            ...pos,
            status: effectiveStatus,
            branch: pos.branch_id ? branchMap.get(pos.branch_id) || null : null,
            employees: posEmployees,
          };
        })
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      return {
        ...dept,
        positions: deptPositions,
      };
    })
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

// ==========================================
// 7. ORG STRUCTURE HASH & AI ANALYSIS
// ==========================================

export function getOrgStructureHash(
  departments: Department[],
  positions: Position[],
  employees: Employee[],
  branches: Branch[]
): string {
  const normalizedData = {
    departments: departments.map((d) => ({
      id: d.id,
      name: d.name,
      sort_order: d.sort_order,
      yqm_text: d.yqm_text,
    })),
    positions: positions.map((p) => ({
      id: p.id,
      department_id: p.department_id,
      title: p.title,
      status: p.status,
      branch_id: p.branch_id,
      yqm_text: p.yqm_text,
    })),
    employees: employees.map((e) => ({
      id: e.id,
      position_id: e.position_id,
      full_name: e.full_name,
      personal_yqm: e.personal_yqm,
    })),
    branches: branches.map((b) => ({
      id: b.id,
      name: b.name,
      student_count: b.student_count,
      room_count: b.room_count,
    })),
  };

  return crypto.createHash("md5").update(JSON.stringify(normalizedData)).digest("hex");
}

export async function getLatestOrgAIAnalysis(forceRefresh: boolean = false): Promise<OrgStructureAnalysis> {
  const store = readStore();
  const departments = store.departments;
  const positions = store.positions;
  const employees = store.employees;
  const branches = store.branches || DEFAULT_BRANCHES;

  const currentHash = getOrgStructureHash(departments, positions, employees, branches);

  // Return saved store.orgAnalysis ONLY IF forceRefresh is false AND structure_hash matches the current state
  if (
    !forceRefresh &&
    store.orgAnalysis &&
    store.orgAnalysis.structure_hash === currentHash &&
    Array.isArray(store.orgAnalysis.recommendations) &&
    store.orgAnalysis.recommendations.length > 0
  ) {
    return store.orgAnalysis;
  }

  const fullDepartments = getFullOrgStructure();
  const analysis = await analyzeOrgStructureWithGemini({
    departments: fullDepartments,
    positions,
    employees,
    branches,
    structureHash: currentHash,
  });

  store.orgAnalysis = analysis;
  writeStore(store);
  return analysis;
}

export async function resolveOrgRecommendation(
  itemId: string
): Promise<{ analysis: OrgStructureAnalysis; affectedPosition: Position | null } | null> {
  const store = readStore();
  if (!store.orgAnalysis || !store.orgAnalysis.recommendations) {
    return null;
  }

  // Find item by id or prefix
  let item = store.orgAnalysis.recommendations.find((r) => r.id === itemId);
  if (!item && itemId) {
    const prefix = itemId.split("-").slice(0, 2).join("-");
    if (prefix && prefix !== "rec") {
      item = store.orgAnalysis.recommendations.find((r) => r.id.startsWith(prefix) && !r.is_resolved);
    }
  }
  if (!item) return null;

  item.is_resolved = true;
  let affectedPosition: Position | null = null;

  // 1. Agar suggested_position_id mavjud bo'lsa, lavozimni topib statusini 'mavjud'ga o'tkazamiz
  if (item.suggested_position_id) {
    const pos = store.positions.find((p) => p.id === item.suggested_position_id);
    if (pos) {
      pos.status = "mavjud";
      if (item.target_department_id) pos.department_id = item.target_department_id;
      affectedPosition = pos;
    }
  }

  // 2. Agar id orqali topilmagan bo'lsa, lekin tavsiya etilayotgan lavozim nomi bo'lsa
  if (!affectedPosition && item.suggested_position_title) {
    const cleanTitle = item.suggested_position_title.trim().toLowerCase();
    const existingPos =
      store.positions.find(
        (p) =>
          p.title.trim().toLowerCase() === cleanTitle &&
          (!item.target_department_id || p.department_id === item.target_department_id)
      ) || store.positions.find((p) => p.title.trim().toLowerCase() === cleanTitle);

    if (existingPos) {
      existingPos.status = "mavjud";
      if (item.target_department_id) existingPos.department_id = item.target_department_id;
      item.suggested_position_id = existingPos.id;
      affectedPosition = existingPos;
    } else {
      // Yangi lavozim sifatida qo'shamiz (status: 'mavjud')
      let targetDeptId = item.target_department_id;
      if (!targetDeptId && item.target_department_name) {
        const matched = store.departments.find(
          (d) =>
            d.name.toLowerCase() === item.target_department_name?.toLowerCase() ||
            item.target_department_name?.toLowerCase().includes(d.name.toLowerCase())
        );
        if (matched) targetDeptId = matched.id;
      }
      if (!targetDeptId) {
        targetDeptId = store.departments[0]?.id || "dept-boshqaruv";
      }

      const newPos: Position = {
        id: "pos-" + Date.now(),
        department_id: targetDeptId,
        title: item.suggested_position_title.trim(),
        yqm_text: null,
        status: "mavjud",
        sort_order: 99,
        branch_id: null,
        created_at: new Date().toISOString(),
      };
      store.positions.push(newPos);
      item.suggested_position_id = newPos.id;
      affectedPosition = newPos;
    }
  }

  // Lavozim mavjud holatga o'tgan yangilangan tuzilma bo'yicha to'liq yangi Top-3 tavsiyalar avtomatik hisoblanadi!
  const fullDepartments = getFullOrgStructure();
  const branches = store.branches || DEFAULT_BRANCHES;
  const currentHash = getOrgStructureHash(store.departments, store.positions, store.employees, branches);

  const freshAnalysis = await analyzeOrgStructureWithGemini({
    departments: fullDepartments,
    positions: store.positions,
    employees: store.employees,
    branches,
    structureHash: currentHash,
  });

  store.orgAnalysis = freshAnalysis;
  writeStore(store);

  return { analysis: freshAnalysis, affectedPosition };
}

export async function updateOrgRecommendation(
  itemId: string,
  updates: Partial<OrgStructureRecommendationItem>
): Promise<OrgStructureAnalysis> {
  const store = readStore();
  
  if (!store.orgAnalysis || !Array.isArray(store.orgAnalysis.recommendations) || store.orgAnalysis.recommendations.length === 0) {
    const fullDepartments = getFullOrgStructure();
    const branches = store.branches || DEFAULT_BRANCHES;
    store.orgAnalysis = await analyzeOrgStructureWithGemini({
      departments: fullDepartments,
      positions: store.positions,
      employees: store.employees,
      branches,
    });
  }

  // 1. Find item by exact id
  let idx = store.orgAnalysis.recommendations.findIndex((r) => r.id === itemId);

  // 2. If not found by exact id, try matching by suggested_position_id
  if (idx < 0 && updates.suggested_position_id) {
    idx = store.orgAnalysis.recommendations.findIndex(
      (r) => r.suggested_position_id && r.suggested_position_id === updates.suggested_position_id
    );
  }

  // 3. If not found, try matching by id prefix (e.g. rec-span, rec-overlap, rec-target)
  if (idx < 0 && itemId) {
    const prefix = itemId.split("-").slice(0, 2).join("-"); // e.g. "rec-span"
    if (prefix && prefix !== "rec") {
      idx = store.orgAnalysis.recommendations.findIndex((r) => r.id.startsWith(prefix));
    }
  }

  // 4. If still not found, fallback to the item matching the updated priority or index
  if (idx < 0 && store.orgAnalysis.recommendations.length > 0) {
    const targetPriority = Number(updates.priority) || 1;
    idx = store.orgAnalysis.recommendations.findIndex((r) => r.priority === targetPriority);
    if (idx < 0) {
      idx = Math.min(Math.max(0, targetPriority - 1), store.orgAnalysis.recommendations.length - 1);
    }
  }

  let targetDeptName = updates.target_department_name;
  if (updates.target_department_id) {
    const dept = store.departments.find((d) => d.id === updates.target_department_id);
    if (dept) {
      targetDeptName = dept.name;
    }
  }

  if (idx >= 0) {
    const current = store.orgAnalysis.recommendations[idx];
    const oldPriority = current.priority || 1;
    const newPriority = updates.priority !== undefined ? Number(updates.priority) : oldPriority;

    // Agar prioritet o'zgartirilgan bo'lsa, boshqa tavsiyaning prioritetini almashtiramiz
    if (newPriority !== oldPriority) {
      store.orgAnalysis.recommendations.forEach((r, i) => {
        if (i !== idx && r.priority === newPriority) {
          r.priority = oldPriority;
        }
      });
    }

    // Itemni to'liq joyida yangilaymiz (is_resolved = false bo'lib ro'yxatda tahrirlangan holatda turadi)
    store.orgAnalysis.recommendations[idx] = {
      ...current,
      ...updates,
      id: current.id || itemId,
      priority: newPriority,
      target_department_name: targetDeptName || current.target_department_name,
      is_resolved: false, // Foydalanuvchi faqat tahrirlab saqladi, hali Bajarildi deb belgilamadi
      is_custom: true,
    };
  } else {
    // Agar ro'yxat bo'sh bo'lgan bo'lsagina yangi element qo'shiladi
    const newItem: OrgStructureRecommendationItem = {
      id: itemId || "rec-custom-" + Date.now(),
      priority: updates.priority || 1,
      title: updates.title || "Tashkiliy tavsiya",
      text: updates.text || "",
      theory_basis: updates.theory_basis || "vysotskiy",
      suggested_position_title: updates.suggested_position_title || null,
      target_department_id: updates.target_department_id || null,
      target_department_name: targetDeptName || null,
      is_resolved: false,
      is_custom: true,
    };
    store.orgAnalysis.recommendations.push(newItem);
  }

  // Doimo prioritet bo'yicha tartiblaymiz (1, 2, 3...)
  store.orgAnalysis.recommendations.sort((a, b) => (a.priority || 1) - (b.priority || 1));

  // Agar dublikatlar bo'lib qolgan bo'lsa, faqat noyob id lar bo'yicha tozalaymiz
  const seenIds = new Set<string>();
  store.orgAnalysis.recommendations = store.orgAnalysis.recommendations.filter((r) => {
    if (seenIds.has(r.id)) return false;
    seenIds.add(r.id);
    return true;
  });

  // Update structure_hash to current hash so it won't be considered stale on page refresh
  const currentHash = getOrgStructureHash(
    store.departments,
    store.positions,
    store.employees,
    store.branches || DEFAULT_BRANCHES
  );
  store.orgAnalysis.structure_hash = currentHash;

  writeStore(store);
  return store.orgAnalysis;
}



