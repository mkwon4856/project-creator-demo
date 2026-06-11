import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';
import type { Campaign } from '@/lib/campaigns/types';

import {
  transformDbCampaign,
  type CampaignWithMissions,
} from './transformDbCampaign';

export type CampaignSeoData = {
  campaign: Campaign;
  brief: string;
};

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const CAMPAIGN_SELECT = '*, missions (*)';

/**
 * Fetches the latest live campaigns for the landing page.
 * DB schema uses status `live` for active campaigns.
 */
export async function fetchLiveCampaigns(limit = 6): Promise<Campaign[]> {
  if (!HAS_SUPABASE_ENV) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select(CAMPAIGN_SELECT)
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchLiveCampaigns:', error);
    return [];
  }

  return ((data as CampaignWithMissions[]) ?? []).map(transformDbCampaign);
}

/**
 * Fetches a single campaign by UUID (deduped per request via React cache).
 */
export const fetchCampaignById = cache(async (id: string): Promise<CampaignSeoData | null> => {
  if (!HAS_SUPABASE_ENV) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select(CAMPAIGN_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('fetchCampaignById:', error);
    return null;
  }
  if (!data) return null;

  const row = data as CampaignWithMissions;
  return {
    campaign: transformDbCampaign(row),
    // TODO(rebuild): transformDbCampaign's legacy CampaignRow has no description column yet
    brief: (row as { description?: string | null }).description ?? '',
  };
});

/** Live campaign IDs for sitemap generation. */
export async function fetchLiveCampaignRoutes(): Promise<
  Array<{ id: string; updatedAt: Date }>
> {
  if (!HAS_SUPABASE_ENV) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, updated_at')
    .eq('status', 'live')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchLiveCampaignRoutes:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    updatedAt: new Date(row.updated_at),
  }));
}
