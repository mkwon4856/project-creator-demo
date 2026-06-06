'use client';

import { useEffect, useState } from 'react';

import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export interface AdminBadgeCounts {
  review: number;
  payouts: number;
  notification: number;
  loading: boolean;
}

const ZERO_COUNTS: Omit<AdminBadgeCounts, 'loading'> = {
  review: 0,
  payouts: 0,
  notification: 0,
};

export function useAdminBadgeCounts(): AdminBadgeCounts {
  const [counts, setCounts] = useState<Omit<AdminBadgeCounts, 'loading'>>(ZERO_COUNTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!HAS_SUPABASE_ENV) {
      setCounts(ZERO_COUNTS);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      const supabase = createBrowserSupabaseClient();

      const [reviewRes, payoutRes] = await Promise.all([
        supabase
          .from('submissions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'review'),
        supabase
          .from('payments')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);

      if (cancelled) return;

      if (reviewRes.error) {
        console.error('admin badge counts: submissions error', reviewRes.error);
      }
      if (payoutRes.error) {
        console.error('admin badge counts: payments error', payoutRes.error);
      }

      const review =
        reviewRes.error ? 0 : (reviewRes.count ?? 0);
      const payouts =
        payoutRes.error ? 0 : (payoutRes.count ?? 0);

      setCounts({
        review,
        payouts,
        notification: review + payouts,
      });
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...counts, loading };
}
