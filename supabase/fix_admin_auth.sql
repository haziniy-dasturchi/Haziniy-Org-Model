-- ==============================================================================
-- HAZINIY ORG MODEL — ADMIN FOYDALANUVCHISINI AUTH.IDENTITIES BILAN TO'G'IRLASH
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'haziniy998889692313@gmail.com';
  target_password TEXT := '89692313';
  encrypted_pw TEXT := crypt(target_password, gen_salt('bf'));
BEGIN
  -- Avval mavjud bo'lsa ID sini olamiz yoki yangi yaratamiz
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
      recovery_token,
      is_super_admin,
      is_sso_user,
      is_anonymous
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      target_user_id,
      'authenticated',
      'authenticated',
      target_email,
      encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Muhammad Said Hasan","phone":"+998889692313"}'::jsonb,
      now(),
      now(),
      '',
      '',
      false,
      false,
      false
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = encrypted_pw,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
        raw_user_meta_data = '{"full_name":"Muhammad Said Hasan","phone":"+998889692313"}'::jsonb,
        updated_at = now()
    WHERE id = target_user_id;
  END IF;

  -- 2. AUTH.IDENTITIES (Supabase GoTrue uchun majburiy)
  DELETE FROM auth.identities WHERE user_id = target_user_id OR (provider = 'email' AND provider_id = target_email);
  
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    target_user_id,
    json_build_object('sub', target_user_id::text, 'email', target_email)::jsonb,
    'email',
    target_email,
    now(),
    now(),
    now()
  );

  -- 3. PROFILES
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (target_user_id, 'Muhammad Said Hasan', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Muhammad Said Hasan';

END $$;
