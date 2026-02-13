-- Create roles tables if they don't exist
CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gate_personnel (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_personnel ENABLE ROW LEVEL SECURITY;

-- Policies for reading roles (allow authenticated users to read roles to determine their own permissions)
-- Ideally, we might want to restrict this further, but for now allow reading own role.

CREATE POLICY "Users can read own super_admin role" ON public.super_admins
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read own admin role" ON public.admins
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read own gate_personnel role" ON public.gate_personnel
  FOR SELECT USING (auth.uid() = id);
