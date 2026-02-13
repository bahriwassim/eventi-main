-- Create tickets table to enable real purchases and scanning
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL, -- Assuming event_id is TEXT from placeholder-data, ideally UUID if events are in DB
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticket_type TEXT NOT NULL, -- 'gradin', 'tribune', etc.
  price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'valid', -- 'valid', 'used', 'cancelled'
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  scanned_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert tickets (purchase) - In a real app this might be server-side only after payment
CREATE POLICY "Users can insert tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gate personnel and Admins can view all tickets (for scanning)
-- For simplicity, let's allow gate_personnel to select all.
CREATE POLICY "Gate personnel can view all tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.gate_personnel WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid())
  );

-- Gate personnel can update tickets (mark as used)
CREATE POLICY "Gate personnel can update tickets" ON public.tickets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.gate_personnel WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid())
  );
