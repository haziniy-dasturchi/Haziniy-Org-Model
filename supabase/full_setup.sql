-- ==============================================================================
-- HAZINIY ORG MODEL — TO'LIQ MA'LUMOTLAR BAZASI VA SEED
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
  name TEXT NOT NULL UNIQUE,
  student_count INT NOT NULL DEFAULT 0,
  room_count INT NOT NULL DEFAULT 0,
  capacity_estimate INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. DEPARTMENTS (Bo'limlar)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
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
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_positions_department_id ON public.positions(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position_id ON public.employees(position_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_snapshot_id ON public.ai_recommendations(based_on_snapshot_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & HELPER FUNCTION
-- ==============================================================================
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
CREATE POLICY "Profiles select policy" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
CREATE POLICY "Profiles insert policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;
CREATE POLICY "Profiles delete policy" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

-- Branches Policies
DROP POLICY IF EXISTS "Branches select policy" ON public.branches;
CREATE POLICY "Branches select policy" ON public.branches FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Branches insert policy" ON public.branches;
CREATE POLICY "Branches insert policy" ON public.branches FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Branches update policy" ON public.branches;
CREATE POLICY "Branches update policy" ON public.branches FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Branches delete policy" ON public.branches;
CREATE POLICY "Branches delete policy" ON public.branches FOR DELETE TO authenticated USING (public.is_admin());

-- Departments Policies
DROP POLICY IF EXISTS "Departments select policy" ON public.departments;
CREATE POLICY "Departments select policy" ON public.departments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Departments insert policy" ON public.departments;
CREATE POLICY "Departments insert policy" ON public.departments FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Departments update policy" ON public.departments;
CREATE POLICY "Departments update policy" ON public.departments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Departments delete policy" ON public.departments;
CREATE POLICY "Departments delete policy" ON public.departments FOR DELETE TO authenticated USING (public.is_admin());

-- Positions Policies
DROP POLICY IF EXISTS "Positions select policy" ON public.positions;
CREATE POLICY "Positions select policy" ON public.positions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Positions insert policy" ON public.positions;
CREATE POLICY "Positions insert policy" ON public.positions FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Positions update policy" ON public.positions;
CREATE POLICY "Positions update policy" ON public.positions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Positions delete policy" ON public.positions;
CREATE POLICY "Positions delete policy" ON public.positions FOR DELETE TO authenticated USING (public.is_admin());

-- Employees Policies
DROP POLICY IF EXISTS "Employees select policy" ON public.employees;
CREATE POLICY "Employees select policy" ON public.employees FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Employees insert policy" ON public.employees;
CREATE POLICY "Employees insert policy" ON public.employees FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Employees update policy" ON public.employees;
CREATE POLICY "Employees update policy" ON public.employees FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Employees delete policy" ON public.employees;
CREATE POLICY "Employees delete policy" ON public.employees FOR DELETE TO authenticated USING (public.is_admin());

-- Finance Snapshot Policies
DROP POLICY IF EXISTS "Finance select policy" ON public.finance_snapshot;
CREATE POLICY "Finance select policy" ON public.finance_snapshot FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Finance insert policy" ON public.finance_snapshot;
CREATE POLICY "Finance insert policy" ON public.finance_snapshot FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Finance update policy" ON public.finance_snapshot;
CREATE POLICY "Finance update policy" ON public.finance_snapshot FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Finance delete policy" ON public.finance_snapshot;
CREATE POLICY "Finance delete policy" ON public.finance_snapshot FOR DELETE TO authenticated USING (public.is_admin());

-- AI Recommendations Policies
DROP POLICY IF EXISTS "AI select policy" ON public.ai_recommendations;
CREATE POLICY "AI select policy" ON public.ai_recommendations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "AI insert policy" ON public.ai_recommendations;
CREATE POLICY "AI insert policy" ON public.ai_recommendations FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "AI update policy" ON public.ai_recommendations;
CREATE POLICY "AI update policy" ON public.ai_recommendations FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "AI delete policy" ON public.ai_recommendations;
CREATE POLICY "AI delete policy" ON public.ai_recommendations FOR DELETE TO authenticated USING (public.is_admin());

-- ==============================================================================
-- AUTH TRIGGER (Yangi foydalanuvchi kirganda profile yaratish)
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

-- ==============================================================================
-- REAL INITIAL SEED DATA
-- ==============================================================================

-- 1. FILIALLAR (2 ta)
INSERT INTO public.branches (name, student_count, room_count, capacity_estimate)
VALUES
  ('Asosiy filial', 358, 6, 960),
  ('Xazina filial', 88, 0, 0)
ON CONFLICT (name) DO UPDATE SET
  student_count = EXCLUDED.student_count,
  room_count = EXCLUDED.room_count,
  capacity_estimate = EXCLUDED.capacity_estimate;

-- 2. BO'LIMLAR (8 ta)
INSERT INTO public.departments (name, color_hex, sort_order, yqm_text)
VALUES
  ('Boshqaruv', '#1E293B', 0, 'Markazning umumiy strategik rivoji, barqarorligi va yuksak natijalari'),
  ('Moliya', '#10B981', 1, 'O''z vaqtida to''liq va aniq moliyaviy hisobotlar va mablag''lar nazorati'),
  ('Marketing', '#F59E0B', 2, 'Markazga jalb qilingan maqsadli va sifatli lidlar oqimi'),
  ('Sotuv', '#3B82F6', 3, 'Kurslarga yozilgan va to''lov qilgan mamnun mijozlar'),
  ('O''quv', '#8B5CF6', 4, 'Sifatli bilim olgan va natija ko''rsatgan muvaffaqiyatli bitiruvchilar'),
  ('HR', '#EC4899', 5, 'O''z o''rnida samarali ishlayotgan malakali jamoa'),
  ('Texnik', '#64748B', 6, 'Toza, xavfsiz va uzluksiz ishlaydigan bino infratuzilmasi'),
  ('Yuridik', '#06B6D4', 7, 'Qonuniy himoyalangan va tartibga solingan faoliyat')
ON CONFLICT (name) DO UPDATE SET
  color_hex = EXCLUDED.color_hex,
  sort_order = EXCLUDED.sort_order,
  yqm_text = EXCLUDED.yqm_text;

-- 3. LAVOZIMLAR
-- Boshqaruv
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Asoschi / Bosh rahbar', 'Markaz strategiyasi, missiyasi va barcha bo''limlar samaradorligi', 'mavjud', 1
FROM public.departments WHERE name = 'Boshqaruv';

-- Sotuv
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Administrator', 'Mijozlarni kutib olish va tashkiliy tartibni saqlash', 'mavjud', 1
FROM public.departments WHERE name = 'Sotuv';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Sotuv bo''lim boshlig''i', 'Bo''limning sotuv rejalarini bajarilishi', 'rejalashtirilgan', 2
FROM public.departments WHERE name = 'Sotuv';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Sotuv menejeri', 'Mijozlarga kurslarni sotish va to''lovlarni qabul qilish', 'rejalashtirilgan', 3
FROM public.departments WHERE name = 'Sotuv';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Kiruvchi admin', 'Kiruvchi qo''ng''iroq va arizalarni qayta ishlash', 'rejalashtirilgan', 4
FROM public.departments WHERE name = 'Sotuv';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Chiquvchi admin', 'Mijozlarga qayta qo''ng''iroq va takliflar yuborish', 'rejalashtirilgan', 5
FROM public.departments WHERE name = 'Sotuv';

-- O'quv
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Bo''lim boshlig''i', 'Ta''lim sifatini va o''quv dasturlari ijrosini ta''minlash', 'rejalashtirilgan', 1
FROM public.departments WHERE name = 'O''quv';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Ustoz', 'Darslarni yuqori sifatda o''tish va o''quvchilar natijasi', 'mavjud', 2
FROM public.departments WHERE name = 'O''quv';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Support', 'O''quvchilarga qo''shimcha dars va savollarda ko''maklashish', 'mavjud', 3
FROM public.departments WHERE name = 'O''quv';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Metodist', 'O''quv metodikasi va dars rejalarini ishlab chiqish', 'rejalashtirilgan', 4
FROM public.departments WHERE name = 'O''quv';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Katta ustoz', 'Ustozlar malakasini oshirish va dars kuzatuvlari', 'rejalashtirilgan', 5
FROM public.departments WHERE name = 'O''quv';

-- Texnik
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Qorovul', 'Bino va mulk xavfsizligini ta''minlash', 'rejalashtirilgan', 1
FROM public.departments WHERE name = 'Texnik';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Farrosh', 'Bino va xonalar tozaligini ta''minlash', 'rejalashtirilgan', 2
FROM public.departments WHERE name = 'Texnik';

-- Moliya
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Bo''lim boshlig''i', 'Moliyaviy strategiya va resurslar taqsimoti', 'rejalashtirilgan', 1
FROM public.departments WHERE name = 'Moliya';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Moliyachi', 'Daromad va xarajatlar tahlili hamda byudjet nazorati', 'rejalashtirilgan', 2
FROM public.departments WHERE name = 'Moliya';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Buxgalter', 'Buxgalteriya hisob-kitoblari va soliq hisobotlari', 'rejalashtirilgan', 3
FROM public.departments WHERE name = 'Moliya';

-- Marketing
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Marketolog', 'Marketing strategiyasi va reklama kampaniyalarini boshqarish', 'rejalashtirilgan', 1
FROM public.departments WHERE name = 'Marketing';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'SMM menejer', 'Ijtimoiy tarmoqlarda kontent yuritish va auditoriyani jalb qilish', 'rejalashtirilgan', 2
FROM public.departments WHERE name = 'Marketing';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Dizayner', 'Brend uslubidagi sifatli grafik materiallar', 'rejalashtirilgan', 3
FROM public.departments WHERE name = 'Marketing';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Video montajchi', 'Yuqori sifatli video roliklar va reklama videolari', 'rejalashtirilgan', 4
FROM public.departments WHERE name = 'Marketing';

-- HR
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Bo''lim boshlig''i', 'Kadrlar siyosati va jamoani shakllantirish', 'rejalashtirilgan', 1
FROM public.departments WHERE name = 'HR';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'HR menejer', 'Xodimlarni saralash, suhbat o''tkazish va adaptatsiya', 'rejalashtirilgan', 2
FROM public.departments WHERE name = 'HR';

-- Yuridik
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Bo''lim boshlig''i', 'Shartnomalar va huquqiy xavfsizlik nazorati', 'rejalashtirilgan', 1
FROM public.departments WHERE name = 'Yuridik';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Yurist', 'Hujjatlar ekspertizasi va huquqiy maslahatlar', 'rejalashtirilgan', 2
FROM public.departments WHERE name = 'Yuridik';

-- 4. MOLIYA SNAPSHOT
INSERT INTO public.finance_snapshot (
  snapshot_date,
  course_prices,
  monthly_revenue,
  monthly_expenses,
  notes
) VALUES (
  CURRENT_DATE,
  '{"standart_kurs": 200000, "maxsus_kurs": 250000}'::jsonb,
  0,
  0,
  'Boshlang''ich moliyaviy holat (admin panel orqali to''ldiriladi)'
);
