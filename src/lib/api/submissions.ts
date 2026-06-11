'use client';

import type { ActivityMission, ActivityStatus, UserActivity } from '@/lib/store';
import type { Submission } from '@/lib/db.types';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

type RateColumn = 'rate_a' | 'rate_b' | 'rate_c' | 'rate_d' | 'rate_e';

/**
 * Unified shape consumed by ActivityTable / EarningsOverview, abstracting
 * away whether the row came from the Zustand demo store or the Supabase DB.
 */
export interface DisplayActivity {
  /** Stable React key. */
  id: string;
  /** Present when DB-backed — used to update via `submitContentUrl`. */
  submissionId?: string;
  /** Present when Zustand-backed — used to call store.submitUrl. */
  storeActivityId?: string;
  campaignId: string;
  campaignName: string;
  developer: string;
  thumbnail: { from: string; to: string; emoji: string };
  mission: ActivityMission;
  status: ActivityStatus;
  /** in won */
  reward: number;
  appliedAt: string;
  submittedAt?: string;
  title: string;
}

const HAS_SUPABASE_ENV =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const MISSION_TITLE_PREFIX: Record<ActivityMission, string> = {
  shortform: 'Shortform',
  longform: 'Longform',
  live: 'Live',
};

/** Map DB submission status -> UI status. `approved` is collapsed into `paid`. */
function mapStatus(s: string): ActivityStatus {
  switch (s) {
    case 'making':
      return 'making';
    case 'review':
      return 'review';
    case 'rejected':
      return 'rejected';
    default:
      return 'paid';
  }
}

// ─── Read ───────────────────────────────────────────────────────

interface JoinedSubmissionRow {
  id: string;
  content_url: string;
  status: string;
  reward: number;
  submitted_at: string | null;
  campaign_id: string;
  campaigns: {
    name: string;
    developer: string;
    thumbnail: Record<string, unknown> | null;
  } | null;
  applications: {
    applied_at: string;
    missions: { type: string } | null;
  } | null;
}

export async function fetchMyActivities(): Promise<DisplayActivity[] | null> {
  if (!HAS_SUPABASE_ENV) return null;
  try {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!creator) return null;

    const { data, error } = await supabase
      .from('submissions')
      .select(
        `id, content_url, status, reward, submitted_at, campaign_id,
         campaigns ( name, developer, thumbnail ),
         applications!inner ( applied_at, missions ( type ) )`,
      )
      .eq('creator_id', creator.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('fetchMyActivities:', error);
      return [];
    }

    const rows = (data ?? []) as unknown as JoinedSubmissionRow[];
    return rows.map((r) => {
      const thumb = (r.campaigns?.thumbnail ?? {}) as {
        from?: string;
        to?: string;
        emoji?: string;
      };
      const missionType = (r.applications?.missions?.type ?? 'shortform') as ActivityMission;
      const status = mapStatus(r.status);
      const campaignName = r.campaigns?.name ?? 'Unknown campaign';
      return {
        id: r.id,
        submissionId: r.id,
        campaignId: r.campaign_id,
        campaignName,
        developer: r.campaigns?.developer ?? '',
        thumbnail: {
          from: thumb.from ?? '#1a0a3e',
          to: thumb.to ?? '#4a1a6e',
          emoji: thumb.emoji ?? '🎮',
        },
        mission: missionType,
        status,
        reward: r.reward ?? 0,
        appliedAt: r.applications?.applied_at?.slice(0, 10) ?? '',
        submittedAt:
          r.submitted_at && status !== 'making'
            ? r.submitted_at.slice(0, 10)
            : undefined,
        title: `${campaignName} ${MISSION_TITLE_PREFIX[missionType]}`,
      };
    });
  } catch (e) {
    console.error('fetchMyActivities:', e);
    return null;
  }
}

// ─── Apply / submit ────────────────────────────────────────────

export type ApplyResult =
  | { kind: 'success' }
  | { kind: 'duplicate' }
  | { kind: 'no-mission' }
  | { kind: 'no-creator' }
  | { kind: 'error'; message: string }
  /** Demo mode (no Supabase env) or anonymous user — caller should use Zustand fallback. */
  | { kind: 'skip' };

export async function applyToCampaignViaDb(
  campaignId: string,
  mission: ActivityMission,
): Promise<ApplyResult> {
  if (!HAS_SUPABASE_ENV) return { kind: 'skip' };
  try {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { kind: 'skip' };

    const { data: creator } = await supabase
      .from('creators')
      .select('id, grade')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!creator) return { kind: 'no-creator' };

    const { data: missionRow } = await supabase
      .from('missions')
      .select('id, rate_a, rate_b, rate_c, rate_d, rate_e')
      .eq('campaign_id', campaignId)
      .eq('type', mission)
      .maybeSingle();
    if (!missionRow) return { kind: 'no-mission' };

    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('creator_id', creator.id)
      .eq('mission_id', missionRow.id)
      .maybeSingle();
    if (existing) return { kind: 'duplicate' };

    const { data: appRow, error: appErr } = await supabase
      .from('applications')
      .insert({
        creator_id: creator.id,
        mission_id: missionRow.id,
        campaign_id: campaignId,
        status: 'applied',
      })
      .select('id')
      .single();
    if (appErr || !appRow) {
      return {
        kind: 'error',
        message: appErr?.message ?? 'application insert failed',
      };
    }

    const gradeKey = (`rate_${(creator.grade as string).toLowerCase()}`) as RateColumn;
    const rateManwon = (missionRow[gradeKey] as number) ?? 0;
    const reward = rateManwon * 10_000;

    const { error: subErr } = await supabase.from('submissions').insert({
      application_id: appRow.id,
      creator_id: creator.id,
      campaign_id: campaignId,
      content_url: '',
      status: 'making',
      reward,
    });
    if (subErr) {
      return { kind: 'error', message: subErr.message };
    }

    return { kind: 'success' };
  } catch (e) {
    console.error('applyToCampaignViaDb:', e);
    return {
      kind: 'error',
      message: e instanceof Error ? e.message : 'unknown',
    };
  }
}

export type SubmitResult =
  | { kind: 'success' }
  | { kind: 'error'; message: string }
  /** Demo mode — caller should use Zustand fallback. */
  | { kind: 'skip' };

export async function submitContentUrl(
  submissionId: string,
  url: string,
): Promise<SubmitResult> {
  if (!HAS_SUPABASE_ENV) return { kind: 'skip' };
  try {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from('submissions')
      .update({
        content_url: url,
        status: 'review',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', submissionId);
    if (error) return { kind: 'error', message: error.message };
    return { kind: 'success' };
  } catch (e) {
    return {
      kind: 'error',
      message: e instanceof Error ? e.message : 'unknown',
    };
  }
}

// ─── Aggregations ──────────────────────────────────────────────

export interface EarningsStats {
  thisMonth: number;
  pending: number;
  allTime: number;
  avg: number;
  thisMonthPaidCount: number;
  thisMonthReviewCount: number;
  paidCount: number;
  reviewCount: number;
  totalCount: number;
}

export function computeEarningsFromActivities(items: DisplayActivity[]): EarningsStats {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  let thisMonth = 0;
  let thisMonthPaidCount = 0;
  let thisMonthReviewCount = 0;
  let pending = 0;
  let reviewCount = 0;
  let allTime = 0;
  let paidCount = 0;

  for (const a of items) {
    if (a.status === 'paid') {
      allTime += a.reward;
      paidCount += 1;
      const d = a.submittedAt ? new Date(a.submittedAt) : null;
      if (d && d.getFullYear() === y && d.getMonth() === m) {
        thisMonth += a.reward;
        thisMonthPaidCount += 1;
      }
    } else if (a.status === 'review') {
      pending += a.reward;
      reviewCount += 1;
      const d = a.submittedAt ? new Date(a.submittedAt) : null;
      if (d && d.getFullYear() === y && d.getMonth() === m) {
        thisMonthReviewCount += 1;
      }
    }
  }

  return {
    thisMonth,
    pending,
    allTime,
    avg: paidCount > 0 ? Math.round(allTime / paidCount) : 0,
    thisMonthPaidCount,
    thisMonthReviewCount,
    paidCount,
    reviewCount,
    totalCount: items.length,
  };
}

// ─── Adapter for Zustand demo store ────────────────────────────

export function storeActivitiesToDisplay(
  activities: UserActivity[],
): DisplayActivity[] {
  return activities.map((a) => ({
    id: a.id,
    storeActivityId: a.id,
    campaignId: a.campaignId,
    campaignName: a.campaignName,
    developer: a.developer,
    thumbnail: a.thumbnail,
    mission: a.mission,
    status: a.status,
    reward: a.reward,
    appliedAt: a.appliedAt,
    submittedAt: a.submittedAt,
    title: a.title,
  }));
}

// ─── New schema writers (rebuild) ───────────────────────────────

export async function createSubmission(
  data: Omit<Submission, 'id' | 'created_at' | 'reviewed_at'>,
) {
  const supabase = createBrowserSupabaseClient();
  return supabase.from('submissions').insert(data).select().single();
}

export async function reviewSubmission(
  id: string,
  result: {
    review_url_valid: boolean;
    review_type_match: boolean;
    review_duration_meet: boolean;
    review_guide_meet: boolean;
    status: 'approved' | 'rejected';
    admin_note?: string;
  },
) {
  const supabase = createBrowserSupabaseClient();
  return supabase
    .from('submissions')
    .update({ ...result, reviewed_at: new Date().toISOString() })
    .eq('id', id);
}

export async function getPendingSubmissions() {
  const supabase = createBrowserSupabaseClient();
  return supabase
    .from('submissions')
    .select(
      '*, applications(*, creators(name), campaigns(title, game_name)), missions(content_type, guide_approved)',
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
}
