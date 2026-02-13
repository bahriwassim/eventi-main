-- SQL Script to seed roles for specific users
-- Instructions:
-- 1. Ask the users to sign up using the emails below.
-- 2. Once they have signed up, run this script in the Supabase SQL Editor.
-- 3. This script will find their User ID based on their email and insert/update their role.

-- Define the emails for each role here
-- Replace these with the actual emails you want to use
DO $$
DECLARE
  super_admin_email TEXT := 'superadmin@eventi.com';
  admin_email TEXT := 'admin@eventi.com';
  gate_email TEXT := 'gate@eventi.com';
  
  super_admin_uid UUID;
  admin_uid UUID;
  gate_uid UUID;
BEGIN

  -- 1. Super Admin
  SELECT id INTO super_admin_uid FROM auth.users WHERE email = super_admin_email;
  
  IF super_admin_uid IS NOT NULL THEN
    -- Insert into super_admins table
    INSERT INTO public.super_admins (id)
    VALUES (super_admin_uid)
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Super Admin role granted to % (UID: %)', super_admin_email, super_admin_uid;
  ELSE
    RAISE NOTICE 'User % not found. Please ensure they have signed up first.', super_admin_email;
  END IF;

  -- 2. Admin
  SELECT id INTO admin_uid FROM auth.users WHERE email = admin_email;
  
  IF admin_uid IS NOT NULL THEN
    -- Insert into admins table
    INSERT INTO public.admins (id)
    VALUES (admin_uid)
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Admin role granted to % (UID: %)', admin_email, admin_uid;
  ELSE
    RAISE NOTICE 'User % not found. Please ensure they have signed up first.', admin_email;
  END IF;

  -- 3. Gate Personnel (Assuming Gate is just an Admin of a specific event, or we can create a gate_personnel entry)
  -- For now, we'll treat them as a standard user who might be added to specific events later.
  -- Or if you want a global "Gate" role, you might need a table for that, but currently schema supports gate per event.
  -- Let's just verify they exist.
  SELECT id INTO gate_uid FROM auth.users WHERE email = gate_email;
  
  IF gate_uid IS NOT NULL THEN
     RAISE NOTICE 'Gate User % found (UID: %). To assign them to an event, use the event management UI.', gate_email, gate_uid;
  ELSE
    RAISE NOTICE 'User % not found. Please ensure they have signed up first.', gate_email;
  END IF;

END $$;
