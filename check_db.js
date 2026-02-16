
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.local' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('No Supabase credentials found.');
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    async function checkEvents() {
      const { data, error } = await supabase.from('events').select('*');
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        console.log('Events found:', data.length);
        if (data.length > 0) {
          console.log('First event ID:', data[0].id);
        } else {
            console.log('No events in DB.');
        }
      }
    }

    checkEvents();
    