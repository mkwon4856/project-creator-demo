import { createClient } from '@/lib/supabase/server';
import type { Campaign } from '@/lib/campaigns/types';

import {
  transformDbCampaign,
  type CampaignWithMissions,
} from './transformDbCampaign';

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
