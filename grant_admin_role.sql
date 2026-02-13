-- Grant Admin Role to a User
-- Replace 'admin@eventi.com' with the email of the user you want to make an admin.

DO $$
DECLARE
  target_email TEXT := 'admin@eventi.com'; -- CHANGE THIS to your email
  target_uid UUID;
BEGIN
  SELECT id INTO target_uid FROM auth.users WHERE email = target_email;
  
  IF target_uid IS NOT NULL THEN
    -- Insert into admins table
    INSERT INTO public.admins (id)
    VALUES (target_uid)
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Admin role granted to %', target_email;
  ELSE
    RAISE NOTICE 'User % not found. Please sign up first.', target_email;
  END IF;
END $$;
