-- Script to seed multiple ESS events
-- This script assumes an admin user already exists. 
-- Ideally, you should replace 'admin@eventi.com' with the actual email of your admin user.

DO $$
DECLARE
  admin_uid UUID;
BEGIN
  -- 1. Find the admin user ID
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@eventi.com' LIMIT 1;
  
  IF admin_uid IS NULL THEN
    RAISE NOTICE 'Admin user not found. Creating events with a placeholder ID (this might fail if FK constraints are strict).';
    -- Fallback: Use the first user found or a specific UUID if known
    SELECT id INTO admin_uid FROM auth.users LIMIT 1;
  END IF;

  IF admin_uid IS NOT NULL THEN
    -- 2. Insert Football Events
    INSERT INTO public.events (admin_id, name, date, time, location, category, price, description, image_url)
    VALUES 
    (admin_uid, 'ESS vs EST', '2024-05-15', '14:30', 'Stade Olympique de Sousse', 'Football', 25.00, 'Le grand classico tunisien. Venez soutenir l''étoile dans ce match décisif pour le championnat.', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop'),
    (admin_uid, 'ESS vs CA', '2024-06-01', '16:00', 'Stade Olympique de Sousse', 'Football', 20.00, 'Un match choc contre le Club Africain. Ambiance garantie !', 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1000&auto=format&fit=crop');

    -- 3. Insert Basketball Events
    INSERT INTO public.events (admin_id, name, date, time, location, category, price, description, image_url)
    VALUES 
    (admin_uid, 'ESS vs US Monastir (Basket)', '2024-05-20', '18:00', 'Salle Olympique de Sousse', 'Basketball', 15.00, 'Derby du Sahel en Basketball. Un match à haute intensité.', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop'),
    (admin_uid, 'ESS vs Ezzahra Sports', '2024-06-05', '17:00', 'Salle Olympique de Sousse', 'Basketball', 10.00, 'Match de championnat Pro A.', 'https://images.unsplash.com/photo-1519861531473-92002639313a?q=80&w=1000&auto=format&fit=crop');

    -- 4. Insert Handball Events
    INSERT INTO public.events (admin_id, name, date, time, location, category, price, description, image_url)
    VALUES 
    (admin_uid, 'ESS vs Esperance (Hand)', '2024-05-25', '16:00', 'Salle Olympique de Sousse', 'Handball', 12.00, 'Le classique du handball tunisien.', 'https://images.unsplash.com/photo-1516475429286-465d815a0df7?q=80&w=1000&auto=format&fit=crop');

    -- 5. Insert Volleyball Events
    INSERT INTO public.events (admin_id, name, date, time, location, category, price, description, image_url)
    VALUES 
    (admin_uid, 'ESS vs CSS (Volley)', '2024-05-30', '15:00', 'Salle Olympique de Sousse', 'Volleyball', 10.00, 'Match important pour la qualification aux play-offs.', 'https://images.unsplash.com/photo-1592656094267-764a45160876?q=80&w=1000&auto=format&fit=crop');

    RAISE NOTICE 'Events seeded successfully for admin %', admin_uid;
  ELSE
    RAISE NOTICE 'No users found in database. Please sign up a user first.';
  END IF;
END $$;
