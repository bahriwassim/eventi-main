-- Fix Role Based Access Control Policies
-- This script ensures that users can read their own role entries in the respective tables.

-- 1. Super Admins
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admins can view their own entry" ON public.super_admins;
CREATE POLICY "Super Admins can view their own entry" ON public.super_admins
  FOR SELECT USING (auth.uid() = id);

-- 2. Admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view their own entry" ON public.admins;
CREATE POLICY "Admins can view their own entry" ON public.admins
  FOR SELECT USING (auth.uid() = id);

-- 3. Gate Personnel
ALTER TABLE public.gate_personnel ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gate personnel can view their own entry" ON public.gate_personnel;
CREATE POLICY "Gate personnel can view their own entry" ON public.gate_personnel
  FOR SELECT USING (auth.uid() = id);

-- 4. Events (Admin Access)
-- Ensure admins can view/edit events they created
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Admins can update own events" ON public.events;
CREATE POLICY "Admins can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Admins can delete own events" ON public.events;
CREATE POLICY "Admins can delete own events" ON public.events
  FOR DELETE USING (auth.uid() = admin_id);

-- Everyone can read events
DROP POLICY IF EXISTS "Everyone can view events" ON public.events;
CREATE POLICY "Everyone can view events" ON public.events
  FOR SELECT USING (true);
