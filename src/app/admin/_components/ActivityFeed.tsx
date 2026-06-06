import { createClient } from '@/lib/supabase/server';

import type { FeedEvent, FeedEventDraft } from './activityFeedTypes';
import { ActivityFeedView } from './ActivityFeedView';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function formatTimeAgo(date: Date, now = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 60_000) return '방금 전';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function formatFeedAmount(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    const formatted = Number.isInteger(m) ? String(m) : m.toFixed(1);
    return `₩${formatted}M`;
  }
  if (amount >= 1_000) {
    return `₩${Math.round(amount / 1_000)}K`;
  }
  return `₩${amount.toLocaleString()}`;
}

function firstRow<T>(value: T | T[] | null | undefined): T | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function displayName(
  creators: { display_name?: string | null } | { display_name?: string | null }[] | null | undefined,
): string {
  return firstRow(creators)?.display_name?.trim() || '크리에이터';
}

function campaignName(
  campaigns: { name?: string | null } | { name?: string | null }[] | null | undefined,
): string {
  return firstRow(campaigns)?.name?.trim() || '캠페인';
}

function toFeedEvents(drafts: FeedEventDraft[]): FeedEvent[] {
  const now = new Date();
  return drafts
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 7)
    .map(({ id, type, at, parts }) => ({
      id,
      type,
      parts,
      timeAgo: formatTimeAgo(at, now),
    }));
}

async function fetchFeedDrafts(): Promise<FeedEventDraft[]> {
  if (!HAS_SUPABASE_ENV) return [];

  const supabase = await createClient();
  const drafts: FeedEventDraft[] = [];

  const [paymentsRes, submissionsRes, creatorsRes, studiosRes] = await Promise.all([
    supabase
      .from('payments')
      .select(
        `
        id,
        amount,
        paid_at,
        creators ( display_name ),
        submissions ( campaigns ( name ) )
      `,
      )
      .eq('status', 'completed')
      .not('paid_at', 'is', null)
      .order('paid_at', { ascending: false })
      .limit(5),
    supabase
      .from('submissions')
      .select(
        `
        id,
        submitted_at,
        creators ( display_name ),
        campaigns ( name )
      `,
      )
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(5),
    supabase
      .from('creators')
      .select('id, display_name, grade, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('studios')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (paymentsRes.error) {
    console.error('ActivityFeed: payments', paymentsRes.error);
  } else {
    for (const row of paymentsRes.data ?? []) {
      const paidAt = row.paid_at;
      if (!paidAt) continue;
      const submission = firstRow(row.submissions);
      const name = displayName(row.creators);
      const campaign = campaignName(submission?.campaigns ?? null);
      drafts.push({
        id: `payment-${row.id}`,
        type: 'payment',
        at: new Date(paidAt),
        parts: [
          { text: name, em: true },
          { text: '님이 ' },
          { text: campaign, em: true },
          { text: ' 정산금 ' },
          { text: formatFeedAmount(row.amount ?? 0), em: true },
          { text: '을 받았습니다' },
        ],
      });
    }
  }

  if (submissionsRes.error) {
    console.error('ActivityFeed: submissions', submissionsRes.error);
  } else {
    for (const row of submissionsRes.data ?? []) {
      const submittedAt = row.submitted_at;
      if (!submittedAt) continue;
      drafts.push({
        id: `submission-${row.id}`,
        type: 'content',
        at: new Date(submittedAt),
        parts: [
          { text: displayName(row.creators), em: true },
          { text: '님이 ' },
          { text: campaignName(row.campaigns), em: true },
          { text: ' 콘텐츠를 제출했습니다' },
        ],
      });
    }
  }

  if (creatorsRes.error) {
    console.error('ActivityFeed: creators', creatorsRes.error);
  } else {
    for (const row of creatorsRes.data ?? []) {
      if (!row.created_at) continue;
      drafts.push({
        id: `creator-${row.id}`,
        type: 'creator',
        at: new Date(row.created_at),
        parts: [
          { text: '신규 크리에이터 ' },
          { text: row.display_name?.trim() || '크리에이터', em: true },
          { text: ' 인증 완료 — ' },
          { text: `${row.grade ?? 'E'}티어`, em: true },
        ],
      });
    }
  }

  if (studiosRes.error) {
    console.error('ActivityFeed: studios', studiosRes.error);
  } else {
    for (const row of studiosRes.data ?? []) {
      if (!row.created_at) continue;
      drafts.push({
        id: `studio-${row.id}`,
        type: 'creator',
        at: new Date(row.created_at),
        parts: [
          { text: '신규 게임사 ' },
          { text: row.name?.trim() || '게임사', em: true },
          { text: '가 플랫폼에 합류했습니다' },
        ],
      });
    }
  }

  return drafts;
}

export async function ActivityFeed() {
  const drafts = await fetchFeedDrafts();
  const events = toFeedEvents(drafts);
  return <ActivityFeedView events={events} />;
}
