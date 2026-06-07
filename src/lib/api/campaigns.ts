'use client';

import type { Campaign } from '@/lib/campaigns/types';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

import {
  transformDbCampaign,
  type CampaignWithMissions,
} from './transformDbCampaign';

export type { CampaignWithMissions } from './transformDbCampaign';
export { transformDbCampaign } from './transformDbCampaign';

const CAMPAIGN_SELECT = '*, missions (*)';

export async function fetchOpenCampaigns(): Promise<Campaign[]> {
  try {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select(CAMPAIGN_SELECT)
      .in('status', ['live', 'recruiting'])
      .order('created_at', { ascending: false });
    if (error) {
      console.error('fetchOpenCampaigns:', error);
      return [];
    }
    return ((data as CampaignWithMissions[]) ?? []).map(transformDbCampaign);
  } catch (e) {
    console.error('fetchOpenCampaigns:', e);
    return [];
  }
}

export async function fetchCampaigns(): Promise<CampaignWithMissions[]> {
  try {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select(CAMPAIGN_SELECT)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('fetchCampaigns:', error);
      return [];
    }
    return (data as CampaignWithMissions[]) ?? [];
  } catch (e) {
    console.error('fetchCampaigns:', e);
    return [];
  }
}

export async function fetchMyCampaigns(
  studioId: string,
): Promise<CampaignWithMissions[]> {
  try {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select(CAMPAIGN_SELECT)
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('fetchMyCampaigns:', error);
      return [];
    }
    return (data as CampaignWithMissions[]) ?? [];
  } catch (e) {
    console.error('fetchMyCampaigns:', e);
    return [];
  }
}

