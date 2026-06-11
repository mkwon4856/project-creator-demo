'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for browser/client components.
 *
 * Usage:
 *   const supabase = createClient();
 *   const { data } = await supabase.from('campaigns').select('*');
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
