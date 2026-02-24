-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name) VALUES
('Musique'),
('Culture'),
('Art'),
('Conférence'),
('Gastronomie'),
('Mode'),
('Football'),
('Volleyball'),
('Basketball'),
('Théâtre'),
('Cinéma')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Allow admins to insert categories (optional)
CREATE POLICY "Admins can insert categories" ON public.categories
  FOR INSERT WITH CHECK (public.is_admin() OR public.is_super_admin());

-- Ensure ticket_types table exists
CREATE TABLE IF NOT EXISTS public.ticket_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    capacity INTEGER NOT NULL,
    remaining INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ticket_types if not already enabled
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;

-- Policies for ticket_types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'ticket_types' AND policyname = 'Public read access'
    ) THEN
        CREATE POLICY "Public read access" ON public.ticket_types FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'ticket_types' AND policyname = 'Admin full access'
    ) THEN
        CREATE POLICY "Admin full access" ON public.ticket_types FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- Add ticket_type_id to tickets table if it doesn't exist
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ticket_type_id UUID REFERENCES public.ticket_types(id);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('sale', 'payout')),
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'processing', 'failed')),
  description TEXT,
  admin_id UUID REFERENCES public.admins(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Allow admins to see their own transactions
CREATE POLICY "Admins can view their own transactions" ON public.transactions
  FOR SELECT USING (admin_id = auth.uid());

-- Allow admins to create transactions (for payouts)
CREATE POLICY "Admins can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (admin_id = auth.uid());

-- Add total_earned and total_paid fields to admins table
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS total_earned NUMERIC DEFAULT 0;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0;
