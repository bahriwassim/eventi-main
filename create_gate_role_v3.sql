-- Fix table definition for Gate Personnel to allow generic gate role or specific event assignment
-- AND handle email constraint.

DO $$
BEGIN
    -- Check if column event_id exists and make it nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gate_personnel' AND column_name = 'event_id') THEN
        ALTER TABLE public.gate_personnel ALTER COLUMN event_id DROP NOT NULL;
    END IF;
END $$;

-- If the table doesn't exist, create it (robustly)
CREATE TABLE IF NOT EXISTS public.gate_personnel (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL, -- Added email column definition
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  event_id UUID -- Implicitly nullable if created here, or handled by ALTER above
);

-- Enable RLS
ALTER TABLE public.gate_personnel ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can read own gate status" ON public.gate_personnel;
CREATE POLICY "Users can read own gate status" ON public.gate_personnel
  FOR SELECT USING (auth.uid() = id);

-- Seed the gate user
DO $$
DECLARE
  gate_email TEXT := 'gate@eventi.com';
  gate_uid UUID;
BEGIN
  SELECT id INTO gate_uid FROM auth.users WHERE email = gate_email;
  
  IF gate_uid IS NOT NULL THEN
    -- Insert with email
    INSERT INTO public.gate_personnel (id, email)
    VALUES (gate_uid, gate_email)
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Gate role granted to %', gate_email;
  ELSE
    RAISE NOTICE 'Gate user not found';
  END IF;
END $$;
