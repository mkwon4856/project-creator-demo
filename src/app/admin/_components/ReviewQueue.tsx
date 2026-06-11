'use client';

import { Film, Radio, Video } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { Badge, Button, statusToBadgeVariant, toast } from '@/components/ui';
import type { Grade } from '@/lib/db.types';
import { formatCompactKRW } from '@/lib/formatCurrency';
import {
  useAppStore,
  type ActivityMission,
  type ReviewItem,
} from '@/lib/store';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

import { Panel } from './Panel';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const GRID = 'grid-cols-[40px_1.4fr_1fr_1fr_0.8fr_0.9fr_180px]';

const MISSION_LABELS: Record<ActivityMission, string> = {
  shortform: 'Shortform',
  longform: 'Longform',
  live: 'Live',
};


type QueueStatus = 'review' | 'approved';

const MISSION_ICON: Record<ActivityMission, ReactNode> = {
  shortform: <Film size={12} aria-hidden />,
  longform: <Video size={12} aria-hidden />,
  live: <Radio size={12} aria-hidden />,
};

const DEFAULT_THUMBNAIL = { from: '#1a0a3e', to: '#4a1a6e', emoji: '🎮' };
const DEFAULT_CREATOR_EMOJI = '🎬';

interface QueueRow {
  key: string;
  source: 'db' | 'store';
  status: QueueStatus;
  submissionId?: string;
  creatorId?: string;
  activityId?: string;
  campaignName: string;
  developer: string;
  thumbnail: { from: string; to: string; emoji: string };
  creatorName: string;
  creatorEmoji: string;
  creatorGrade: Grade;
  mission: ActivityMission;
  submittedAgo: string;
  reward: number;
}

const QUEUE_STATUS_LABELS: Record<QueueStatus, string> = {
  review: '검수 중',
  approved: '승인됨 · 정산 대기',
};

const QUEUE_BADGE_STATUS: Record<QueueStatus, string> = {
  review: 'review',
  approved: 'approved',
};

function StatusBadge({ status }: { status: QueueStatus }) {
  return (
    <Badge variant={statusToBadgeVariant(QUEUE_BADGE_STATUS[status])} size="sm">
      {QUEUE_STATUS_LABELS[status]}
    </Badge>
  );
}

function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '방금 전';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return '방금 전';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function thumbnailFromJson(json: unknown): { from: string; to: string; emoji: string } {
  if (json && typeof json === 'object') {
    const t = json as { from?: string; to?: string; emoji?: string };
    return {
      from: t.from ?? DEFAULT_THUMBNAIL.from,
      to: t.to ?? DEFAULT_THUMBNAIL.to,
      emoji: t.emoji ?? DEFAULT_THUMBNAIL.emoji,
    };
  }
  return DEFAULT_THUMBNAIL;
}

function storeItemToRow(item: ReviewItem): QueueRow {
  return {
    key: `store-${item.activityId}`,
    source: 'store',
    status: 'review',
    activityId: item.activityId,
    campaignName: item.campaignName,
    developer: item.developer,
    thumbnail: item.thumbnail,
    creatorName: item.creatorName,
    creatorEmoji: item.creatorEmoji,
    creatorGrade: item.creatorGrade,
    mission: item.mission,
    submittedAgo: item.submittedAgo,
    reward: item.reward,
  };
}

function HeaderRow() {
  return (
    <div
      role="row"
      className={`grid ${GRID} items-center gap-3 px-5 py-3 bg-bg-elevated text-xs font-medium text-text-secondary uppercase`}
    >
      <span aria-hidden />
      <span>캠페인</span>
      <span>크리에이터</span>
      <span>미션</span>
      <span>제출</span>
      <span>상태</span>
      <span className="text-right">보상 · 작업</span>
    </div>
  );
}

function Row({
  item,
  last,
  busy,
  onApprove,
  onReject,
}: {
  item: QueueRow;
  last: boolean;
  busy: boolean;
  onApprove: (row: QueueRow) => void;
  onReject: (row: QueueRow) => void;
}) {
  return (
    <div
      role="row"
      className={[
        `grid ${GRID} items-center gap-3 px-5 py-3 transition-colors duration-150 ease-out hover:bg-bg-hover`,
        last ? '' : 'border-b border-border',
      ].join(' ')}
    >
      <span
        className="w-8 h-8 rounded-md flex items-center justify-center text-[15px] leading-none"
        style={{
          background: `linear-gradient(135deg, ${item.thumbnail.from}, ${item.thumbnail.to})`,
        }}
        aria-hidden
      >
        {item.thumbnail.emoji}
      </span>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">{item.campaignName}</span>
        <span className="text-xs text-text-secondary truncate">{item.developer}</span>
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <span
          className="inline-flex w-6 h-6 rounded-full bg-bg-hover items-center justify-center text-sm leading-none shrink-0"
          aria-hidden
        >
          {item.creatorEmoji}
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-text-primary truncate">{item.creatorName}</span>
          <span className="text-[10px] text-text-secondary">{item.creatorGrade}티어</span>
        </div>
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
        {MISSION_ICON[item.mission]}
        {MISSION_LABELS[item.mission]}
      </span>

      <span className="text-xs text-text-secondary">{item.submittedAgo}</span>

      <StatusBadge status={item.status} />

      <div className="flex items-center justify-end gap-2">
        <span className="text-sm font-medium tabular-nums text-text-primary">
          {formatCompactKRW(item.reward)}
        </span>
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => onReject(item)}>
          반려
        </Button>
        <Button variant="primary" size="sm" disabled={busy} onClick={() => onApprove(item)}>
          {item.status === 'approved' ? '지급' : '승인'}
        </Button>
      </div>
    </div>
  );
}

export function ReviewQueue() {
  const storeReviewQueue = useAppStore((s) => s.reviewQueue);
  const approveContent = useAppStore((s) => s.approveContent);
  const rejectContent = useAppStore((s) => s.rejectContent);

  const [dbQueue, setDbQueue] = useState<QueueRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    if (!HAS_SUPABASE_ENV) {
      setDbQueue(null);
      setLoading(false);
      return;
    }
    const supabase = createBrowserSupabaseClient();

    const { data, error } = await supabase
      .from('submissions')
      .select(
        `
        id,
        content_url,
        status,
        reward,
        submitted_at,
        campaign_id,
        creator_id,
        campaigns ( name, developer, thumbnail ),
        creators ( display_name, handle, grade ),
        applications ( missions ( type ) )
      `,
      )
      .in('status', ['review', 'approved'])
      .order('submitted_at', { ascending: false });

    if (error) {
      toast.error(`검수 큐 조회 실패: ${error.message}`);
      setDbQueue(null);
      setLoading(false);
      return;
    }

    if (data) {
      const rows: QueueRow[] = data.map((s) => {
        // supabase JS의 nested select은 to-one 관계를 객체 또는 배열로 줄 수 있음 — 안전하게 narrow.
        const raw = s as unknown as {
          id: string;
          status: 'review' | 'approved' | string;
          reward: number;
          submitted_at: string | null;
          creator_id: string;
          campaigns:
            | { name?: string | null; developer?: string | null; thumbnail?: unknown }
            | { name?: string | null; developer?: string | null; thumbnail?: unknown }[]
            | null;
          creators:
            | { display_name?: string | null; handle?: string | null; grade?: string | null }
            | { display_name?: string | null; handle?: string | null; grade?: string | null }[]
            | null;
          applications:
            | { missions: { type?: string | null } | { type?: string | null }[] | null }
            | { missions: { type?: string | null } | { type?: string | null }[] | null }[]
            | null;
        };

        const campaign = Array.isArray(raw.campaigns) ? raw.campaigns[0] : raw.campaigns;
        const creator = Array.isArray(raw.creators) ? raw.creators[0] : raw.creators;
        const application = Array.isArray(raw.applications)
          ? raw.applications[0]
          : raw.applications;
        const mission =
          application && application.missions
            ? Array.isArray(application.missions)
              ? application.missions[0]
              : application.missions
            : null;

        const missionType: ActivityMission =
          mission?.type === 'longform' || mission?.type === 'live' || mission?.type === 'shortform'
            ? (mission.type as ActivityMission)
            : 'shortform';

        const grade = (creator?.grade as Grade | undefined) ?? 'E';

        const queueStatus: QueueStatus = raw.status === 'approved' ? 'approved' : 'review';

        return {
          key: `db-${raw.id}`,
          source: 'db',
          status: queueStatus,
          submissionId: raw.id,
          creatorId: raw.creator_id,
          campaignName: campaign?.name ?? '알 수 없음',
          developer: campaign?.developer ?? '',
          thumbnail: thumbnailFromJson(campaign?.thumbnail),
          creatorName: creator?.display_name ?? '알 수 없음',
          creatorEmoji: DEFAULT_CREATOR_EMOJI,
          creatorGrade: grade,
          mission: missionType,
          submittedAgo: getTimeAgo(raw.submitted_at),
          reward: raw.reward,
        };
      });
      setDbQueue(rows);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchQueue();
  }, [fetchQueue]);

  const handleApprove = async (row: QueueRow) => {
    // Demo (store) fallback path — DB와 분리해서 처리.
    if (row.source === 'store') {
      if (row.activityId) approveContent(row.activityId);
      toast.success('콘텐츠가 승인되었습니다');
      return;
    }

    const submissionId = row.submissionId;
    const creatorId = row.creatorId;
    const reward = row.reward;
    if (!submissionId || !creatorId) return;

    setBusyId(submissionId);

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error: subError } = await supabase
        .from('submissions')
        .update({
          status: 'paid',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id ?? null,
        })
        .eq('id', submissionId);
      if (subError) {
        toast.error(`승인 실패: ${subError.message}`);
        return;
      }

      const platformFee = Math.round(reward * 0.15);
      const { error: payError } = await supabase.from('payments').insert({
        submission_id: submissionId,
        creator_id: creatorId,
        amount: reward - platformFee,
        platform_fee: platformFee,
        status: 'completed',
        paid_at: new Date().toISOString(),
      });
      if (payError) {
        toast.error(`정산 기록 실패: ${payError.message}`);
        return;
      }

      toast.success('콘텐츠가 승인되었습니다');
      await fetchQueue();
    } catch (err) {
      console.error('[APPROVE] catch error:', err);
      toast.error(
        `오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (row: QueueRow) => {
    if (row.source === 'store') {
      if (row.activityId) rejectContent(row.activityId);
      toast.error('콘텐츠가 반려되었습니다');
      return;
    }

    const submissionId = row.submissionId;
    if (!submissionId) return;

    setBusyId(submissionId);

    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id ?? null,
        })
        .eq('id', submissionId);
      if (error) {
        toast.error(`반려 실패: ${error.message}`);
        return;
      }

      toast.error('콘텐츠가 반려되었습니다');
      await fetchQueue();
    } catch (err) {
      console.error('[REJECT] catch error:', err);
      toast.error(
        `오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setBusyId(null);
    }
  };

  // DB 결과가 있고 비어있지 않으면 DB만, 아니면 Zustand fallback.
  const queue: QueueRow[] =
    dbQueue && dbQueue.length > 0
      ? dbQueue
      : storeReviewQueue.map(storeItemToRow);

  return (
    <Panel
      title="콘텐츠 검수 큐"
      ctaHref="/admin/review"
      cta="전체 보기"
      rightSlot={
        <span className="text-[11px] font-medium text-red-400 tabular-nums">
          {loading ? '…' : `${queue.length}건 대기`}
        </span>
      }
      bodyClassName=""
    >
      <HeaderRow />
      {loading ? (
        <div className="px-5 py-12 text-center text-sm text-text-secondary">불러오는 중…</div>
      ) : queue.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-text-secondary">
          검수 큐가 비어 있습니다.
        </div>
      ) : (
        queue.map((item, i) => (
          <Row
            key={item.key}
            item={item}
            last={i === queue.length - 1}
            busy={busyId === item.submissionId}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))
      )}
    </Panel>
  );
}
