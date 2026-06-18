import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';
import type { Campaign } from '@/lib/campaigns/types';
import type { Campaign as DbCampaign, Mission as DbMission } from '@/lib/db.types';

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

// ─── New-schema public campaign detail (used by /campaigns/[id]) ───
export type PublicCampaign = DbCampaign & { missions: DbMission[] };

/**
 * Fetches a single campaign + missions on the NEW schema for public display.
 * RLS exposes active campaigns (and their missions) to anon, so unauthenticated
 * visitors can view campaign detail pages. Returns null when not found/visible.
 */
export const fetchPublicCampaign = cache(
  async (id: string): Promise<PublicCampaign | null> => {
    if (!HAS_SUPABASE_ENV) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, missions(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('fetchPublicCampaign:', error);
      return null;
    }
    if (!data) return null;
    return data as PublicCampaign;
  },
);

// 랜딩 카드용: 캠페인 + 미션 + 참여 수(applications count). 마감 임박순 정렬.
export type PublicCampaignWithStats = PublicCampaign & {
  applications?: { count: number }[];
};

/**
 * 랜딩 미리보기용: 현재 모집 중(status='active') 캠페인 N개 + 전체 활성 개수.
 * 마감 임박순(deadline 가까운 순, 마감일 없는 상시 모집은 뒤로) 정렬하고,
 * 각 캠페인의 미션과 참여 수(applications count)를 함께 가져온다.
 * 새 스키마 기준. RLS "Anyone can read campaigns"로 anon 조회 가능.
 */
export async function fetchActiveCampaigns(
  limit = 6,
): Promise<{ campaigns: PublicCampaignWithStats[]; total: number }> {
  if (!HAS_SUPABASE_ENV) return { campaigns: [], total: 0 };

  const supabase = await createClient();
  const [{ data, error }, { count }] = await Promise.all([
    supabase
      .from('campaigns')
      .select('*, missions(*), applications(count)')
      .eq('status', 'active')
      .order('deadline', { ascending: true, nullsFirst: false })
      .limit(limit),
    supabase
      .from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
  ]);

  if (error) {
    console.error('fetchActiveCampaigns:', error);
    return { campaigns: [], total: 0 };
  }
  return { campaigns: (data as PublicCampaignWithStats[]) ?? [], total: count ?? 0 };
}

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
