'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export function useUser() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    // Fallback timeout to avoid infinite loading on refresh in edge cases
    const timeoutId = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3500);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        fetchUserRole(session.user)
          .then(userWithRole => {
            if (!isMounted) return;
            setUser(userWithRole);
          })
          .finally(() => {
            if (isMounted) setLoading(false);
          });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        // We need to fetch role again on auth state change
        const userWithRole = await fetchUserRole(session.user);
        setUser(userWithRole);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

async function fetchUserRole(user: User) {
  const formattedUser = formatUser(user);
  const supabase = createClient();
  
  try {
    // Check Super Admin via RPC to avoid RLS issues
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
    if (isSuperAdmin) {
      return { ...formattedUser, role: 'super_admin' };
    }

    // Check Admin via RPC to avoid RLS issues
    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (isAdmin) {
      return { ...formattedUser, role: 'admin' };
    }

    // Check Gate Personnel
    const { data: gate } = await supabase
      .from('gate_personnel')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (gate) {
      return { ...formattedUser, role: 'gate' };
    }

  } catch (error) {
    console.error('Error fetching user role:', error);
  }

  return { ...formattedUser, role: 'user' };
}

// Helper to format Supabase user to match previous Firebase user structure if needed
// or just return the Supabase user with added convenience properties
function formatUser(user: User) {
  return {
    ...user,
    displayName: user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0],
    photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    uid: user.id,
  };
}
