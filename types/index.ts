// Haziniy ORG Model — TypeScript ma'lumotlar bazasi turlari

export type UserRole = 'admin' | 'user';
export type PositionStatus = 'mavjud' | 'rejalashtirilgan';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  student_count: number;
  room_count: number;
  capacity_estimate: number;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  color_hex: string | null;
  sort_order: number;
  yqm_text: string | null;
  created_at: string;
  // Bog'langan lavozimlar (join qilinganda)
  positions?: Position[];
}

export interface Position {
  id: string;
  department_id: string;
  title: string;
  yqm_text: string | null;
  status: PositionStatus;
  sort_order: number;
  branch_id?: string | null; // Ixtiyoriy: filialga xos lavozimlar uchun
  estimated_salary?: number | null;
  created_at: string;
  // Bog'langan bo'lim, filial va xodimlar (join qilinganda)
  department?: Department;
  branch?: Branch | null;
  employees?: Employee[];
}

export interface CertificateItem {
  id: string;
  title: string;
  image_url: string;
  issued_date?: string | null;
}

export interface Employee {
  id: string;
  position_id: string | null;
  full_name: string;
  photo_url: string | null;
  phone: string | null;
  hired_at: string | null;
  resume: string | null;
  portfolio_links: string[];
  personal_yqm: string | null;
  certificates?: CertificateItem[];
  subject?: string | null; // O'qitadigan fani (masalan: Arab tili, Ingliz tili, Matematika)
  created_at: string;
  // Bog'langan lavozim (join qilinganda)
  position?: Position;
}

// ==================== YANGI TUZILMAVIY AI TAVSIYA TURLARI ====================

export type TheoryBasisType =
  | "vysotskiy"       // Aleksandr Vysotskiy: 7 ta funksional yo'nalish qamrovi
  | "span_of_control" // Nazorat radiusi (menejerga 6-12 kishi, filiallar oraliq boshqaruvi)
  | "face_overlap"    // Verne Harnish FACe: vazifalar chatishmasi (bitta odamda bir nechta yo'nalish)
  | "greiner";        // Greiner o'sish modeli: bosqichma-bosqich delegatsiya

export interface OrgStructureRecommendationItem {
  id: string;
  priority: number; // 1, 2, 3
  title: string;
  text?: string; // 1-2 gap: Holat/Fakt -> Muammo -> Aniq Harakat
  theory_basis?: TheoryBasisType;
  suggested_position_id?: string | null;
  suggested_position_title?: string | null;
  target_department_id?: string | null;
  target_department_name?: string | null;
  is_new_suggested_role?: boolean;
  is_resolved?: boolean;
  is_custom?: boolean;
  [key: string]: any;
}

export interface OrgStructureAnalysis {
  id: string;
  structure_hash: string;
  recommendations: OrgStructureRecommendationItem[];
  structured_items?: any[];
  summary_text?: string;
  generated_at: string;
  created_at?: string;
  is_resolved?: boolean;
}

// Backward-compatibility alias
export type RecommendationItem = OrgStructureRecommendationItem;
export type AIRecommendation = OrgStructureAnalysis;

export type SuggestedActionType = 'hire' | 'promote' | 'reorganize' | 'improve' | 'wait';

export interface FinanceSnapshot {
  id: string;
  snapshot_date: string;
  monthly_revenue: number;
  monthly_expenses: number;
  course_prices?: Record<string, number>;
  max_teacher_load?: number;
  min_teacher_load?: number;
  main_branch_students?: number;
  xazina_branch_students?: number;
  notes?: string;
  created_at?: string;
}

export interface EngineAnalysisResult {
  recommendations: any[];
  meta: {
    total_students: number;
    growth_stage: number;
    growth_stage_name: string;
    total_revenue: number;
    total_expenses: number;
    net_profit: number;
    average_net_profit: number;
    worst_net_profit: number;
    revenue_trend: string;
    growth_rate_pct: number;
    has_sufficient_history: boolean;
    single_point_risks_count: number;
    workload_imbalances_count: number;
  };
}

// Supabase Database Generic Schema Type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      branches: {
        Row: Branch;
        Insert: Omit<Branch, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Branch, 'id'>>;
      };
      departments: {
        Row: Department;
        Insert: Omit<Department, 'id' | 'created_at' | 'positions'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Department, 'id' | 'positions'>>;
      };
      positions: {
        Row: Position;
        Insert: Omit<Position, 'id' | 'created_at' | 'department' | 'employees' | 'branch'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Position, 'id' | 'department' | 'employees' | 'branch'>>;
      };
      employees: {
        Row: Employee;
        Insert: Omit<Employee, 'id' | 'created_at' | 'position'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Employee, 'id' | 'position'>>;
      };
      ai_recommendations: {
        Row: OrgStructureAnalysis;
        Insert: Omit<OrgStructureAnalysis, 'id' | 'generated_at'> & {
          id?: string;
          generated_at?: string;
        };
        Update: Partial<Omit<OrgStructureAnalysis, 'id'>>;
      };
    };
  };
}
