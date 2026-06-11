'use client';

import type { Campaign } from '@/lib/campaigns/types';
import type { Campaign as DbCampaign, Mission as DbMission } from '@/lib/db.types';
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

// ─── New schema writers (rebuild) ───────────────────────────────

export async function createCampaign(
  data: Omit<DbCampaign, 'id' | 'created_at' | 'launched_at' | 'completed_at'>,
) {
  const supabase = createBrowserSupabaseClient();
  return supabase.from('campaigns').insert(data).select().single();
}

export async function createMissions(
  missions: Omit<DbMission, 'id' | 'created_at'>[],
) {
  const supabase = createBrowserSupabaseClient();
  return supabase.from('missions').insert(missions).select();
}

export async function updateCampaignStatus(
  id: string,
  status: DbCampaign['status'],
  adminNote?: string,
) {
  const supabase = createBrowserSupabaseClient();
  return supabase
    .from('campaigns')
    .update({ status, ...(adminNote ? { admin_note: adminNote } : {}) })
    .eq('id', id);
}

export async function getAllCampaigns() {
  const supabase = createBrowserSupabaseClient();
  return supabase
    .from('campaigns')
    .select('*, studios(company_name), missions(*)')
    .order('created_at', { ascending: false });
}

export async function getPendingCampaigns() {
  const supabase = createBrowserSupabaseClient();
  return supabase
    .from('campaigns')
    .select('*, studios(company_name), missions(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
}

