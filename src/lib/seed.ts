'use client';

import type { Json } from '@/lib/db.types';
import { isSeedEnabled } from '@/lib/envFlags';
import { SEED_CAMPAIGN_TEMPLATES } from '@/lib/seed/campaignTemplates';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

const STATUS_MAP: Record<'live' | 'recruiting' | 'completed', 'live' | 'recruiting' | 'completed'> = {
  live: 'live',
  recruiting: 'recruiting',
  completed: 'completed',
};

// Longform pays roughly 3x and live ~2x of the shortform rate (rough heuristic
// chosen so seeded data reflects the original mock proportions).
const TYPE_MULTIPLIER = { shortform: 1, longform: 3, live: 2 } as const;

export interface SeedResult {
  inserted: number;
  skipped: number;
  errors: string[];
}

/**
 * Insert the mock campaigns (with their 3 mission rows each) under the given
 * studio. Idempotent: skips campaigns that already exist (matched by name).
 */
export async function seedCampaigns(studioId: string): Promise<SeedResult> {
  if (!isSeedEnabled()) {
    return {
      inserted: 0,
      skipped: 0,
      errors: ['Seed is disabled in this environment.'],
    };
  }

  const supabase = createBrowserSupabaseClient();
  const result: SeedResult = { inserted: 0, skipped: 0, errors: [] };

  const { data: existing, error: existingErr } = await supabase
    .from('campaigns')
    .select('name')
    .eq('studio_id', studioId);

  if (existingErr) {
    result.errors.push(`기존 캠페인 조회 실패: ${existingErr.message}`);
    return result;
  }

  const existingNames = new Set((existing ?? []).map((row) => row.name));

  for (const camp of SEED_CAMPAIGN_TEMPLATES) {
    if (existingNames.has(camp.name)) {
      result.skipped += 1;
      continue;
    }

    const thumbnail: Json = {
      from: camp.thumbnail.from,
      to: camp.thumbnail.to,
      emoji: camp.thumbnail.emoji,
    };

    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .insert({
        studio_id: studioId,
        name: camp.name,
        genre: camp.genre,
        developer: camp.developer,
        status: STATUS_MAP[camp.status],
        total_budget: camp.totalBudget,
        spent_budget: camp.spentBudget,
        target_creators: camp.target,
        brief: '게임의 첫인상과 핵심 매력을 전달해주세요.',
        hashtags: [`#${camp.name.replace(/\s+/g, '')}`],
        thumbnail,
        platform: camp.platform,
        recruit_start: '2026-05-01',
        recruit_end: '2026-06-30',
        submit_deadline: '2026-07-15',
        payout_days: 7,
      })
      .select()
      .single();

    if (campErr || !campaign) {
      result.errors.push(`${camp.name}: ${campErr?.message ?? 'unknown error'}`);
      continue;
    }

    const missions = (['shortform', 'longform', 'live'] as const).map((type) => {
      const mult = TYPE_MULTIPLIER[type];
      return {
        campaign_id: campaign.id,
        type,
        enabled: camp.missions[type],
        rate_a: camp.rates.A * mult,
        rate_b: camp.rates.B * mult,
        rate_c: camp.rates.C * mult,
        rate_d: camp.rates.D * mult,
        rate_e: camp.rates.E * mult,
      };
    });
    const { error: missionErr } = await supabase.from('missions').insert(missions);
    if (missionErr) {
      result.errors.push(`${camp.name} missions: ${missionErr.message}`);
    }

    existingNames.add(camp.name);
    result.inserted += 1;
  }

  return result;
}
