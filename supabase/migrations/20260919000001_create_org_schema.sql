-- ==============================================================================
-- HAZINIY ORG MODEL — SUPABASE DATABASE MIGRATION
-- ==============================================================================

-- 1. PROFILES (auth.users kengaytmasi)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. BRANCHES (Filiallar)
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  student_count INT NOT NULL DEFAULT 0,
  room_count INT NOT NULL DEFAULT 0,
  capacity_estimate INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. DEPARTMENTS (Bo'limlar)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color_hex TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  yqm_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. POSITIONS (Lavozimlar)
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  yqm_text TEXT,
  status TEXT NOT NULL DEFAULT 'mavjud' CHECK (status IN ('mavjud', 'rejalashtirilgan')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. EMPLOYEES (Xodimlar)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  photo_url TEXT,
  phone TEXT,
  hired_at DATE,
  resume TEXT,
  portfolio_links TEXT[] DEFAULT '{}'::TEXT[],
  personal_yqm TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. FINANCE_SNAPSHOT (Moliya ko'rsatkichlari)
CREATE TABLE IF NOT EXISTS public.finance_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  course_prices JSONB NOT NULL DEFAULT '{}'::JSONB,
  monthly_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0,
  monthly_expenses NUMERIC(15, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. AI_RECOMMENDATIONS (Sun'iy intellekt tahlili va tavsiyalari)
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recommendation_text TEXT NOT NULL,
  based_on_snapshot_id UUID REFERENCES public.finance_snapshot(id) ON DELETE SET NULL
);

-- ==============================================================================
-- INDEXES (Tezkor qidiruv va bog'lanishlar uchun)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_positions_department_id ON public.positions(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position_id ON public.employees(position_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_snapshot_id ON public.ai_recommendations(based_on_snapshot_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
-- ==============================================================================

-- Admin ekanligini xavfsiz va rekursiyasiz tekshiruvchi funksiya
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- RLS ni barcha jadvallar uchun yoqish
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
CREATE POLICY "Profiles select policy"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
CREATE POLICY "Profiles insert policy"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;
CREATE POLICY "Profiles delete policy"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- BRANCHES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Branches select for authenticated" ON public.branches;
CREATE POLICY "Branches select for authenticated"
  ON public.branches FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Branches insert for admin" ON public.branches;
CREATE POLICY "Branches insert for admin"
  ON public.branches FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Branches update for admin" ON public.branches;
CREATE POLICY "Branches update for admin"
  ON public.branches FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Branches delete for admin" ON public.branches;
CREATE POLICY "Branches delete for admin"
  ON public.branches FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- DEPARTMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Departments select for authenticated" ON public.departments;
CREATE POLICY "Departments select for authenticated"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Departments insert for admin" ON public.departments;
CREATE POLICY "Departments insert for admin"
  ON public.departments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Departments update for admin" ON public.departments;
CREATE POLICY "Departments update for admin"
  ON public.departments FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Departments delete for admin" ON public.departments;
CREATE POLICY "Departments delete for admin"
  ON public.departments FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- POSITIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Positions select for authenticated" ON public.positions;
CREATE POLICY "Positions select for authenticated"
  ON public.positions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Positions insert for admin" ON public.positions;
CREATE POLICY "Positions insert for admin"
  ON public.positions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Positions update for admin" ON public.positions;
CREATE POLICY "Positions update for admin"
  ON public.positions FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Positions delete for admin" ON public.positions;
CREATE POLICY "Positions delete for admin"
  ON public.positions FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- EMPLOYEES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Employees select for authenticated" ON public.employees;
CREATE POLICY "Employees select for authenticated"
  ON public.employees FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Employees insert for admin" ON public.employees;
CREATE POLICY "Employees insert for admin"
  ON public.employees FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Employees update for admin" ON public.employees;
CREATE POLICY "Employees update for admin"
  ON public.employees FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Employees delete for admin" ON public.employees;
CREATE POLICY "Employees delete for admin"
  ON public.employees FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- FINANCE_SNAPSHOT POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Finance select for authenticated" ON public.finance_snapshot;
CREATE POLICY "Finance select for authenticated"
  ON public.finance_snapshot FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Finance insert for admin" ON public.finance_snapshot;
CREATE POLICY "Finance insert for admin"
  ON public.finance_snapshot FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Finance update for admin" ON public.finance_snapshot;
CREATE POLICY "Finance update for admin"
  ON public.finance_snapshot FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Finance delete for admin" ON public.finance_snapshot;
CREATE POLICY "Finance delete for admin"
  ON public.finance_snapshot FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- AI_RECOMMENDATIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "AI recommendations select for authenticated" ON public.ai_recommendations;
CREATE POLICY "AI recommendations select for authenticated"
  ON public.ai_recommendations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "AI recommendations insert for admin" ON public.ai_recommendations;
CREATE POLICY "AI recommendations insert for admin"
  ON public.ai_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "AI recommendations update for admin" ON public.ai_recommendations;
CREATE POLICY "AI recommendations update for admin"
  ON public.ai_recommendations FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "AI recommendations delete for admin" ON public.ai_recommendations;
CREATE POLICY "AI recommendations delete for admin"
  ON public.ai_recommendations FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- AUTH TRIGGER (Yangi foydalanuvchi ro'yxatdan o'tganda avtomatik profile yaratish)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
