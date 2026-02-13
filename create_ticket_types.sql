-- Create ticket_types table
CREATE TABLE IF NOT EXISTS public.ticket_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    capacity INTEGER NOT NULL,
    remaining INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON public.ticket_types
    FOR SELECT USING (true);

-- Allow authenticated users (admins) to manage ticket types
CREATE POLICY "Admin full access" ON public.ticket_types
    FOR ALL USING (auth.role() = 'authenticated');
