'use client';

import { useEffect, useRef, useState } from 'react';

import type { Database } from '@/lib/db.types';

import { createClient as createBrowserSupabaseClient } from './client';

type CreatorRow = Database['public']['Tables']['creators']['Row'];
type StudioRow = Database['public']['Tables']['studios']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface FetchState<T> {
  data: T | null;
  loading: boolean;
}

const hasSupabaseEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Fetch the current Supabase user's row from a single table, keyed by `user_id`
 * (or `id` for the `profiles` table). Returns `{ data: null, loading: false }`
 * when there is no logged-in user, no Supabase env, or no matching row — the
 * caller is responsible for falling back to mock data.
 */
function useUserRow<T>(
  table: 'creators' | 'studios' | 'profiles',
): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    if (!hasSupabaseEnv) {
      setLoading(false);
      return () => {};
    }

    (async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled.current) setLoading(false);
          return;
        }

        // Each table is queried by a slightly different key column, and
        // the union of return types confuses TypeScript — branch explicitly.
        let row: unknown = null;
        if (table === 'profiles') {
          const { data: r } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          row = r;
        } else if (table === 'creators') {
          const { data: r } = await supabase
            .from('creators')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          row = r;
        } else {
          const { data: r } = await supabase
            .from('studios')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          row = r;
        }

        if (cancelled.current) return;
        setData((row as T) ?? null);
      } catch {
        // demo mode / network error — fall through to fallback
      } finally {
        if (!cancelled.current) setLoading(false);
      }
    })();

    return () => {
      cancelled.current = true;
    };
  }, [table]);

  return { data, loading };
}

export function useCurrentCreator() {
  return useUserRow<CreatorRow>('creators');
}

export function useCurrentStudio() {
  return useUserRow<StudioRow>('studios');
}

export function useCurrentProfile() {
  return useUserRow<ProfileRow>('profiles');
}
