-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------
-- 1. Tables
-- ----------------------------------------------------------------------

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admins (Role Management)
CREATE TABLE public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Super Admins (Role Management)
CREATE TABLE public.super_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id), -- Owner of the event
  name TEXT NOT NULL,
  date DATE,
  time TIME,
  location TEXT,
  category TEXT,
  price NUMERIC,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gate Personnel (Sub-resource of Events)
CREATE TABLE public.gate_personnel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  email TEXT NOT NULL, -- Identifying by email or linking to user if they exist
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tickets (Purchase History)
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id),
  purchase_date TIMESTAMPTZ DEFAULT now(),
  qr_code_value TEXT,
  status TEXT DEFAULT 'valid', -- valid, used, refunded
  price_paid NUMERIC
);

-- ----------------------------------------------------------------------
-- 2. Storage Buckets
-- ----------------------------------------------------------------------

-- Create a bucket for event images and avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------
-- 3. Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Helper Functions for Policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins Policies
CREATE POLICY "Admins viewable by super admins" ON public.admins
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY "Super admins can manage admins" ON public.admins
  FOR ALL USING (public.is_super_admin());

-- Super Admins Policies
CREATE POLICY "Super admins viewable by super admins" ON public.super_admins
  FOR SELECT USING (public.is_super_admin());

-- Events Policies
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins and Super Admins can insert events" ON public.events
  FOR INSERT WITH CHECK (
    (public.is_admin() AND auth.uid() = admin_id) OR public.is_super_admin()
  );

CREATE POLICY "Event owners and Super Admins can update events" ON public.events
  FOR UPDATE USING (
    (auth.uid() = admin_id) OR public.is_super_admin()
  );

CREATE POLICY "Event owners and Super Admins can delete events" ON public.events
  FOR DELETE USING (
    (auth.uid() = admin_id) OR public.is_super_admin()
  );

-- Gate Personnel Policies
CREATE POLICY "Event owners and Super Admins can manage gate personnel" ON public.gate_personnel
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = gate_personnel.event_id
      AND (admin_id = auth.uid() OR public.is_super_admin())
    )
  );

-- Tickets Policies
CREATE POLICY "Users can view their own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert tickets (purchase)" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage Policies (Images Bucket)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND auth.uid() = owner);

-- ----------------------------------------------------------------------
-- 4. Triggers (Auto-create profile on signup)
-- ----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, photo_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
