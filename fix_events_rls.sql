-- Fix RLS policy for events table to allow admins to insert
-- This assumes 'events' table has an 'admin_id' column or similar linking to the user.
-- If not, we might need to add it or adjust the policy.

-- First, ensure events table has an admin_id column if it doesn't already
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'admin_id') THEN
        ALTER TABLE public.events ADD COLUMN admin_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Enable RLS on events table if not already enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policy if any (to avoid conflicts/duplicates)
DROP POLICY IF EXISTS "Admins can insert their own events" ON public.events;

-- Create policy to allow authenticated users (admins) to insert events
-- We enforce that they can only insert rows where admin_id matches their own ID
CREATE POLICY "Admins can insert their own events" ON public.events
    FOR INSERT 
    WITH CHECK (auth.uid() = admin_id);

-- Also allow them to select/update/delete their own events
DROP POLICY IF EXISTS "Admins can view their own events" ON public.events;
CREATE POLICY "Admins can view their own events" ON public.events
    FOR SELECT
    USING (auth.uid() = admin_id OR true); -- 'OR true' temporarily allows everyone to see all events (for public listing), restrict if needed.

DROP POLICY IF EXISTS "Admins can update their own events" ON public.events;
CREATE POLICY "Admins can update their own events" ON public.events
    FOR UPDATE
    USING (auth.uid() = admin_id);

DROP POLICY IF EXISTS "Admins can delete their own events" ON public.events;
CREATE POLICY "Admins can delete their own events" ON public.events
    FOR DELETE
    USING (auth.uid() = admin_id);
