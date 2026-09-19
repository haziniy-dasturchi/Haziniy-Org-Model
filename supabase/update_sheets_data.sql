-- ==============================================================================
-- HAZINIY ORG MODEL — GOOGLE SHEETS ASOSIDAGI ANIQ STRUKTURA VA YQM
-- ==============================================================================

-- 1. Avvalgi pozitsiya va bo'limlarni yangilash
DELETE FROM public.positions WHERE true;
DELETE FROM public.departments WHERE true;

-- 2. 8 ta Bo'limlar (Boshqaruv + 7 ta asosiy bo'lim)
INSERT INTO public.departments (name, color_hex, sort_order, yqm_text)
VALUES
  ('Boshqaruv', '#1E293B', 0, 'Markaz strategiyasi, missiyasi va barcha bo''limlar integratsiyasi'),
  ('Moliya', '#EAB308', 1, 'KORXONANI KERAKLI VAQTDA YETARLI PUL MIQDORI BILAN TA''MINLASH'),
  ('Marketing', '#2563EB', 2, 'KORXONANI SIFATLI LIDLAR BILAN TA''MINLASH VA BOZORDA O''RNINI SAQLAB QOLISH'),
  ('Sotuv', '#EA580C', 3, 'KORXONADA SOTUVLARNI AMALGA OSHIRISH ORQALI DAROMADNI KO''PAYTIRISH'),
  ('O''quv', '#059669', 4, 'MIJOZLARGA XIZMAT KO''RSATISH VA SARAFAN ORQALI MIJOZLAR SONINI YANADA OSHIRISH'),
  ('HR', '#7C3AED', 5, 'KORXONADA KADRLAR BILAN MUAMMO BO''LMASLIGINI TA''MINLASH'),
  ('Texnik', '#C2410C', 6, 'KORXONANI MIJOZ VA XODIMLAR UCHUN QULAY VA XAVFSIZ JOY BO''LISHINI TA''MINLASH'),
  ('Yuridik', '#991B1B', 7, 'KORXONANI FAOLIYATI YURIDIK JIHATDAN XAVFSIZ BO''LISHINI TA''MINLASH')
ON CONFLICT (name) DO UPDATE SET
  color_hex = EXCLUDED.color_hex,
  sort_order = EXCLUDED.sort_order,
  yqm_text = EXCLUDED.yqm_text;

-- 3. Lavozimlar (Hozirgi mavjud va Namunaviy rejalashtirilgan)
DO $$
DECLARE
  dept_boshqaruv UUID;
  dept_moliya UUID;
  dept_marketing UUID;
  dept_sotuv UUID;
  dept_oquv UUID;
  dept_hr UUID;
  dept_texnik UUID;
  dept_yuridik UUID;
BEGIN
  SELECT id INTO dept_boshqaruv FROM public.departments WHERE name = 'Boshqaruv';
  SELECT id INTO dept_moliya FROM public.departments WHERE name = 'Moliya';
  SELECT id INTO dept_marketing FROM public.departments WHERE name = 'Marketing';
  SELECT id INTO dept_sotuv FROM public.departments WHERE name = 'Sotuv';
  SELECT id INTO dept_oquv FROM public.departments WHERE name = 'O''quv';
  SELECT id INTO dept_hr FROM public.departments WHERE name = 'HR';
  SELECT id INTO dept_texnik FROM public.departments WHERE name = 'Texnik';
  SELECT id INTO dept_yuridik FROM public.departments WHERE name = 'Yuridik';

  -- 0. Boshqaruv (Hozirgi mavjud)
  INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order) VALUES
    (dept_boshqaruv, 'ASOSCHI', 'Korxona strategiyasi, missiyasi va yuksalishi', 'mavjud', 1),
    (dept_boshqaruv, 'MENEJER', 'Operatsion boshqaruv va barcha bo''limlar integratsiyasi', 'mavjud', 2);

  -- 1. Moliya bo'limi (Namuna / Reja)
  INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order) VALUES
    (dept_moliya, 'Bo''lim boshlig''i', 'Moliya bo''limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta''minlash', 'rejalashtirilgan', 1),
    (dept_moliya, 'Moliyachi', 'Korxonada pul oqimini to''g''ri bo''lishini ta''minlash va eng kerakli bo''lgan sohaga pul sarflanishini ta''minlash', 'rejalashtirilgan', 2),
    (dept_moliya, 'Buxgalter', 'Korxonadagi barcha pulga doir ishlar hisobotini jamlab borish', 'rejalashtirilgan', 3);

  -- 2. Marketing bo'limi (Namuna / Reja)
  INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order) VALUES
    (dept_marketing, 'Bo''lim boshlig''i', 'Marketing bo''limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta''minlash', 'rejalashtirilgan', 1),
    (dept_marketing, 'Marketolog', 'Korxonani o''z vaqtida rejali ravishda lidlar bilan ta''minlash', 'rejalashtirilgan', 2),
    (dept_marketing, 'SMM menejer', 'Ijtimoiy tarmoqlarni yurgazish orqali murojaatlar sonini oshirish', 'rejalashtirilgan', 3),
    (dept_marketing, 'Dizayner', 'Marketing uchun kerak bo''ladigan grafik dizaynlarni tayyorlash', 'rejalashtirilgan', 4),
    (dept_marketing, 'Video montajor', 'Marketing uchun kerak bo''ladigan videolarni syomka va montaj bo''lishini ta''minlash', 'rejalashtirilgan', 5);

  -- 3. Sotuv bo'limi (Hozirgi mavjud: Administrator; Reja: boshliq, sotuv menejeri, kiruvchi/chiquvchi admin)
  INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order) VALUES
    (dept_sotuv, 'Administrator', '1) Menyu olgan mijozlarni sinov darsga kelishini ta''minlash, 2) Sinov darsiga kelgan mijozlarga sotuvni amalga oshirib to''lovni yig''ish, 3) Tartib intizomni ta''minlash, 4) Qaynoq lidlar o''z vaqtida javob berilishini ta''minlash, 5) Qayta sotuvlar amalga oshirilishini ta''minlash', 'mavjud', 1),
    (dept_sotuv, 'Sotuv bo''lim boshlig''i', 'Sotuvlar o''z vaqtida reja asosida bo''lishini ta''minlash', 'rejalashtirilgan', 2),
    (dept_sotuv, 'Sotuv menejeri', 'Qayta sotuvlar amalga oshishini ta''minlash', 'rejalashtirilgan', 3),
    (dept_sotuv, 'Kiruvchi admin', 'Murojaat qilgan mijozlarni korxonaga sinov darsiga kelishlarini ta''minlash', 'rejalashtirilgan', 4),
    (dept_sotuv, 'Chiquvchi admin', 'Sinov darsiga kelgan mijozlarni to''lov qilishlari uchun taqdimot qilib sotuvni amalga oshirish', 'rejalashtirilgan', 5);

  -- 4. O'quv bo'limi (Hozirgi mavjud: Ustoz, Support; Reja: boshliq, metodist, katta ustoz, assistent)
  INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order) VALUES
    (dept_oquv, 'Ustoz', 'Korxonada belgilangan metodlar asosida mijozlar bilim olishini ta''minlash', 'mavjud', 1),
    (dept_oquv, 'Support', 'Ustozga yordam berish uchun mijozlarni bilim olishiga ko''maklashish', 'mavjud', 2),
    (dept_oquv, 'Bo''lim boshlig''i', 'O''quv bo''limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta''minlash', 'rejalashtirilgan', 3),
    (dept_oquv, 'Metodist', 'Darsliklardan foydalanish uchun yangi metodlar tuzib chiqish va ularni amalda qo''llanishini ta''minlash', 'rejalashtirilgan', 4),
    (dept_oquv, 'Katta ustoz', 'Metodist tomonidan berilgan metodlarni korxonada joriy qilish va ustozlarni malakasini oshirishga ko''maklashish', 'rejalashtirilgan', 5),
    (dept_oquv, 'Assistent', 'O''quv bo''limi uchun kerakli materiallarni tayyorlash', 'rejalashtirilgan', 6);

  -- 5. HR bo'limi (Namuna / Reja)
  INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order) VALUES
    (dept_hr, 'Bo''lim boshlig''i', 'HR bo''limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta''minlash', 'rejalashtirilgan', 1),
    (dept_hr, 'HR menejer', 'Korxona uchun kerakli bo''lgan kadrlarni topish, tarbiyalash va xodimlarni olib qolish', 'rejalashtirilgan', 2);

  -- 6. Texnik bo'lim (Namuna / Reja)
  INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order) VALUES
    (dept_texnik, 'Bo''lim boshlig''i', 'Texnik bo''limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta''minlash', 'rejalashtirilgan', 1),
    (dept_texnik, 'Qorovul', 'Korxona xavfsizligini ta''minlash', 'rejalashtirilgan', 2),
    (dept_texnik, 'Farrosh', 'Korxona tozaligini ta''minlash', 'rejalashtirilgan', 3);

  -- 7. Yuridik bo'lim (Namuna / Reja)
  INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order) VALUES
    (dept_yuridik, 'Bo''lim boshlig''i', 'Yuridik bo''limiga yuklatilgan vazifalarni har qanday holatda ham bajarilishini ta''minlash', 'rejalashtirilgan', 1),
    (dept_yuridik, 'Yurist', 'Korxonani yuridik jihatdan to''g''ri faoliyat olib borishi uchun barcha ishlarni bajarilishini ta''minlash va xat hujjatlar bilan bog''liq masalalarni bajarish', 'rejalashtirilgan', 2);

END $$;
