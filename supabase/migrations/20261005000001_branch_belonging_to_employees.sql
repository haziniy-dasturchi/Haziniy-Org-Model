-- ==============================================================================
-- MIGRATSIYA: Xodimlarni filiallar bo'yicha biriktirish
-- Filial tegishliligi faqat employees.branch_id orqali aniqlanadi
-- ==============================================================================

-- 1. employees jadvaliga branch_id ustunini qo'shish (FK -> branches.id)
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- 2. Tezkor qidiruv va filtrlash uchun indeks
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON public.employees(branch_id);

-- 3. Agar positions jadvalida branch_id mavjud bo'lsa, uni olib tashlash
ALTER TABLE public.positions
DROP COLUMN IF EXISTS branch_id;

-- 4. Mavjud barcha xodimlarga vaqtinchalik default sifatida birinchi (asosiy) filialni biriktirish
UPDATE public.employees
SET branch_id = (SELECT id FROM public.branches ORDER BY created_at ASC LIMIT 1)
WHERE branch_id IS NULL;
