'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/lib/db.types';

/**
 * Supabase client for browser/client components.
 *
 * Usage:
 *   const supabase = createClient();
 *   const { data } = await supabase.from('campaigns').select('*');
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
