-- ==============================================================================
-- HAZINIY ORG MODEL — REAL INITIAL SEED DATA
-- ==============================================================================

-- 1. FILIALLAR (BRANCHES)
INSERT INTO public.branches (name, student_count, room_count, capacity_estimate)
VALUES
  ('Asosiy filial', 358, 6, 960),
  ('Xazina filial', 88, 0, 0);

-- 2. BO'LIMLAR (DEPARTMENTS)
INSERT INTO public.departments (name, color_hex, sort_order, yqm_text)
VALUES
  ('Boshqaruv', '#1E293B', 0, 'Markazning umumiy strategik rivoji, barqarorligi va yuksak natijalari'),
  ('Moliya', '#10B981', 1, 'O''z vaqtida to''liq va aniq moliyaviy hisobotlar va mablag''lar nazorati'),
  ('Marketing', '#F59E0B', 2, 'Markazga jalb qilingan maqsadli va sifatli lidlar oqimi'),
  ('Sotuv', '#3B82F6', 3, 'Kurslarga yozilgan va to''lov qilgan mamnun mijozlar'),
  ('O''quv', '#8B5CF6', 4, 'Sifatli bilim olgan va natija ko''rsatgan muvaffaqiyatli bitiruvchilar'),
  ('HR', '#EC4899', 5, 'O''z o''rnida samarali ishlayotgan malakali jamoa'),
  ('Texnik', '#64748B', 6, 'Toza, xavfsiz va uzluksiz ishlaydigan bino infratuzilmasi'),
  ('Yuridik', '#06B6D4', 7, 'Qonuniy himoyalangan va tartibga solingan faoliyat');

-- 3. LAVOZIMLAR (POSITIONS)
-- Boshqaruv lavozimi (Asoschi)
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Asoschi / Bosh rahbar', 'Markaz strategiyasi, missiyasi va barcha bo''limlar samaradorligi', 'mavjud', 1
FROM public.departments WHERE name = 'Boshqaruv';

-- Sotuv bo'limi lavozimlari
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

-- O'quv bo'limi lavozimlari
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

-- Texnik bo'lim lavozimlari (hozircha rejalashtirilgan)
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Qorovul', 'Bino va mulk xavfsizligini ta''minlash', 'rejalashtirilgan', 1
FROM public.departments WHERE name = 'Texnik';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Farrosh', 'Bino va xonalar tozaligini ta''minlash', 'rejalashtirilgan', 2
FROM public.departments WHERE name = 'Texnik';

-- Moliya bo'limi lavozimlari (rejalashtirilgan)
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Bo''lim boshlig''i', 'Moliyaviy strategiya va resurslar taqsimoti', 'rejalashtirilgan', 1
FROM public.departments WHERE name = 'Moliya';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Moliyachi', 'Daromad va xarajatlar tahlili hamda byudjet nazorati', 'rejalashtirilgan', 2
FROM public.departments WHERE name = 'Moliya';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Buxgalter', 'Buxgalteriya hisob-kitoblari va soliq hisobotlari', 'rejalashtirilgan', 3
FROM public.departments WHERE name = 'Moliya';

-- Marketing bo'limi lavozimlari (rejalashtirilgan)
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

-- HR bo'limi lavozimlari (rejalashtirilgan)
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Bo''lim boshlig''i', 'Kadrlar siyosati va jamoani shakllantirish', 'rejalashtirilgan', 1
FROM public.departments WHERE name = 'HR';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'HR menejer', 'Xodimlarni saralash, suhbat o''tkazish va adaptatsiya', 'rejalashtirilgan', 2
FROM public.departments WHERE name = 'HR';

-- Yuridik bo'limi lavozimlari (rejalashtirilgan)
INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Bo''lim boshlig''i', 'Shartnomalar va huquqiy xavfsizlik nazorati', 'rejalashtirilgan', 1
FROM public.departments WHERE name = 'Yuridik';

INSERT INTO public.positions (department_id, title, yqm_text, status, sort_order)
SELECT id, 'Yurist', 'Hujjatlar ekspertizasi va huquqiy maslahatlar', 'rejalashtirilgan', 2
FROM public.departments WHERE name = 'Yuridik';

-- 4. XODIMLAR (EMPLOYEES)
-- Eslatma: Xodimlar ro'yxati admin panel orqali to'g'ridan-to'g'ri kiritiladi va saqlanadi.


-- 5. MOLIYA SNAPSHOT (FINANCE_SNAPSHOT)
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
