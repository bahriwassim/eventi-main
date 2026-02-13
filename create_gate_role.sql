-- Create table for Gate Personnel if it doesn't exist
CREATE TABLE IF NOT EXISTS public.gate_personnel (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.gate_personnel ENABLE ROW LEVEL SECURITY;

-- Policies for gate_personnel (readable by everyone or just admins? usually public read is fine for role checks if row level security allows it, but better to be safe)
-- Actually for role checks we often just need to know if the current user is in the table.
-- Let's allow users to read their own entry.
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
    INSERT INTO public.gate_personnel (id)
    VALUES (gate_uid)
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Gate role granted to %', gate_email;
  ELSE
    RAISE NOTICE 'Gate user not found';
  END IF;
END $$;
