-- ==============================================================================
-- HAZINIY ORG MODEL — PUBLIC READ RLS & TEST ADMIN CREATION
-- Ushbu skriptni Supabase SQL Editor'da ishga tushiring.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. RLS SIYOSATLARINI PUBLIC READ QILIB YANGILASH
-- Profiles
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
CREATE POLICY "Profiles select policy" ON public.profiles FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
CREATE POLICY "Profiles insert policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;
CREATE POLICY "Profiles delete policy" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

-- Branches
DROP POLICY IF EXISTS "Branches select policy" ON public.branches;
CREATE POLICY "Branches select policy" ON public.branches FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Branches insert policy" ON public.branches;
CREATE POLICY "Branches insert policy" ON public.branches FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Branches update policy" ON public.branches;
CREATE POLICY "Branches update policy" ON public.branches FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Branches delete policy" ON public.branches;
CREATE POLICY "Branches delete policy" ON public.branches FOR DELETE TO authenticated USING (public.is_admin());

-- Departments
DROP POLICY IF EXISTS "Departments select policy" ON public.departments;
CREATE POLICY "Departments select policy" ON public.departments FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Departments insert policy" ON public.departments;
CREATE POLICY "Departments insert policy" ON public.departments FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Departments update policy" ON public.departments;
CREATE POLICY "Departments update policy" ON public.departments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Departments delete policy" ON public.departments;
CREATE POLICY "Departments delete policy" ON public.departments FOR DELETE TO authenticated USING (public.is_admin());

-- Positions
DROP POLICY IF EXISTS "Positions select policy" ON public.positions;
CREATE POLICY "Positions select policy" ON public.positions FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Positions insert policy" ON public.positions;
CREATE POLICY "Positions insert policy" ON public.positions FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Positions update policy" ON public.positions;
CREATE POLICY "Positions update policy" ON public.positions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Positions delete policy" ON public.positions;
CREATE POLICY "Positions delete policy" ON public.positions FOR DELETE TO authenticated USING (public.is_admin());

-- Employees
DROP POLICY IF EXISTS "Employees select policy" ON public.employees;
CREATE POLICY "Employees select policy" ON public.employees FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Employees insert policy" ON public.employees;
CREATE POLICY "Employees insert policy" ON public.employees FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Employees update policy" ON public.employees;
CREATE POLICY "Employees update policy" ON public.employees FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Employees delete policy" ON public.employees;
CREATE POLICY "Employees delete policy" ON public.employees FOR DELETE TO authenticated USING (public.is_admin());

-- Finance Snapshot
DROP POLICY IF EXISTS "Finance select policy" ON public.finance_snapshot;
CREATE POLICY "Finance select policy" ON public.finance_snapshot FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Finance insert policy" ON public.finance_snapshot;
CREATE POLICY "Finance insert policy" ON public.finance_snapshot FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Finance update policy" ON public.finance_snapshot;
CREATE POLICY "Finance update policy" ON public.finance_snapshot FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Finance delete policy" ON public.finance_snapshot;
CREATE POLICY "Finance delete policy" ON public.finance_snapshot FOR DELETE TO authenticated USING (public.is_admin());

-- AI Recommendations
DROP POLICY IF EXISTS "AI select policy" ON public.ai_recommendations;
CREATE POLICY "AI select policy" ON public.ai_recommendations FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "AI insert policy" ON public.ai_recommendations;
CREATE POLICY "AI insert policy" ON public.ai_recommendations FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "AI update policy" ON public.ai_recommendations;
CREATE POLICY "AI update policy" ON public.ai_recommendations FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "AI delete policy" ON public.ai_recommendations;
CREATE POLICY "AI delete policy" ON public.ai_recommendations FOR DELETE TO authenticated USING (public.is_admin());


-- 2. TEST ADMINISTRATOR FOYDALANUVCHISINI YARATISH
-- Telefon: +998889692313
-- Parol: 89692313
-- Email: haziniy998889692313@gmail.com
DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'haziniy998889692313@gmail.com';
  target_password TEXT := '89692313';
  encrypted_pw TEXT := crypt(target_password, gen_salt('bf'));
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NULL THEN
    target_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      target_user_id,
      'authenticated',
      'authenticated',
      target_email,
      encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Muhammad Said Hasan","phone":"+998889692313"}',
      now(),
      now(),
      '',
      ''
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_user_meta_data = '{"full_name":"Muhammad Said Hasan","phone":"+998889692313"}'
    WHERE id = target_user_id;
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (target_user_id, 'Muhammad Said Hasan', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Muhammad Said Hasan';

END $$;
