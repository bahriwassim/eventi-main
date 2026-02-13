-- Fix table definition for Gate Personnel to allow generic gate role or specific event assignment
-- The error suggests that there is an existing table 'gate_personnel' that has a non-null 'event_id' column.
-- We need to check the existing schema or adapt our insert. 
-- Since we can't see the exact existing schema but got an error about 'event_id', let's assume it exists and is required.
-- OPTION 1: Make event_id nullable (preferred for a generic "Gate Role")
-- OPTION 2: Assign to a dummy event.

-- Let's try to make event_id nullable if it exists, to allow for a generic "Gate User" who can then be assigned to specific events.

DO $$
BEGIN
    -- Check if column exists and make it nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gate_personnel' AND column_name = 'event_id') THEN
        ALTER TABLE public.gate_personnel ALTER COLUMN event_id DROP NOT NULL;
    END IF;
END $$;

-- If the table was just created by a previous (failed) run or existed before with different schema:
-- Re-run the creation logic but robustly.

CREATE TABLE IF NOT EXISTS public.gate_personnel (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  -- event_id UUID REFERENCES public.events(id) -- This might be what was missing or implicit in previous error context
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
    -- Try to insert. If event_id is still required (e.g. if ALTER failed or wasn't run), we might need to supply a dummy event or NULL if allowed.
    -- We assume the ALTER above worked to make it nullable.
    INSERT INTO public.gate_personnel (id)
    VALUES (gate_uid)
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Gate role granted to %', gate_email;
  ELSE
    RAISE NOTICE 'Gate user not found';
  END IF;
END $$;
