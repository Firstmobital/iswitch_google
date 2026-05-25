-- Fix profiles RLS recursion and ensure bootstrap profile rows for known users.
-- Safe to run multiple times.

BEGIN;

-- 1) Helper function to avoid recursive policy evaluation on public.profiles.
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _uid
      AND role = 'admin'::user_role
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon, service_role;

-- 2) Replace recursive policies with function-based checks.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 3) Ensure profile rows exist for the two known auth users.
INSERT INTO public.profiles (
  id,
  email,
  role,
  approval_status,
  is_active,
  full_name,
  shop_name,
  phone,
  city
)
SELECT
  u.id,
  u.email,
  CASE
    WHEN lower(u.email) = 'mail@techwheels.in' THEN 'admin'::user_role
    ELSE 'retailer'::user_role
  END,
  'approved'::approval_status,
  true,
  NULLIF(u.raw_user_meta_data->>'full_name', ''),
  NULLIF(u.raw_user_meta_data->>'shop_name', ''),
  NULLIF(u.raw_user_meta_data->>'phone', ''),
  NULLIF(u.raw_user_meta_data->>'city', '')
FROM auth.users u
WHERE lower(u.email) IN ('mail@techwheels.in', 'vinodexodus@gmail.com')
  AND NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = u.id
  );

-- 4) Normalize role/approval for both users.
UPDATE public.profiles p
SET
  role = CASE
    WHEN lower(p.email) = 'mail@techwheels.in' THEN 'admin'::user_role
    ELSE 'retailer'::user_role
  END,
  approval_status = 'approved'::approval_status,
  is_active = true
WHERE lower(p.email) IN ('mail@techwheels.in', 'vinodexodus@gmail.com');

COMMIT;
