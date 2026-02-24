-- Update database with transactions and admin financial fields

-- Add total_earned and total_paid fields to admins table if they don't exist
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS total_earned NUMERIC DEFAULT 0;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0;

-- Create transactions table if it doesn't exist
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

-- Insert sample transactions for testing (optional - remove in production)
-- These will only be inserted if an admin exists
DO $$
DECLARE
  admin_uuid UUID;
BEGIN
  -- Get the first admin ID
  SELECT id INTO admin_uuid FROM public.admins LIMIT 1;
  
  IF admin_uuid IS NOT NULL THEN
    -- Insert sample transactions
    INSERT INTO public.transactions (type, amount, status, description, admin_id, created_at) VALUES
    ('sale', 450.00, 'completed', 'Ventes Semaine 42', admin_uuid, NOW() - INTERVAL '10 days'),
    ('sale', 890.00, 'completed', 'Ventes Semaine 43', admin_uuid, NOW() - INTERVAL '3 days'),
    ('payout', 500.00, 'processing', 'Demande de retrait #45', admin_uuid, NOW() - INTERVAL '1 day'),
    ('sale', 320.00, 'completed', 'Ventes Semaine 44', admin_uuid, NOW() - INTERVAL '1 day');
    
    -- Update admin totals
    UPDATE public.admins 
    SET total_earned = 1660.00, total_paid = 1200.00 
    WHERE id = admin_uuid;
  END IF;
END $$;