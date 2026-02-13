-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON public.categories
    FOR SELECT USING (true);

-- Allow authenticated users (super_admin) to manage categories
-- Note: Simplified for now, allows any authenticated user to insert/delete if they have access to the dashboard logic
CREATE POLICY "Admin full access" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert default categories
INSERT INTO public.categories (name) VALUES 
('Musique'),
('Culture'),
('Art'),
('Conférence'),
('Gastronomie'),
('Film'),
('Mode'),
('Football'),
('Volleyball'),
('Basketball')
ON CONFLICT (name) DO NOTHING;
