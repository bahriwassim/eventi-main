-- Add 'capacity' column to 'events' table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'capacity') THEN
        ALTER TABLE public.events ADD COLUMN capacity INTEGER DEFAULT 100;
    END IF;
END $$;
