'use client';

import {
  ExternalLink,
  Film,
  Radio,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { SubmitUrlModal } from '@/components/creator/SubmitUrlModal';
import { Alert, Badge, Button, Card, Pill, statusToBadgeVariant, toast } from '@/components/ui';
import type { DisplayActivity } from '@/lib/api/submissions';
import type {
  ContentType,
  SubmissionStatus,
} from '@/lib/db.types';
import { formatCompactKRW } from '@/lib/formatCurrency';
import { CURRENT_CREATOR } from '@/lib/mockCreators';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentCreator } from '@/lib/supabase/hooks';

import { getCreatorSidebar } from '../_config/sidebar';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const GRID =
  'grid-cols-[40px_1.4fr_0.7fr_1.2fr_0.7fr_0.9fr_0.8fr_140px]';

const MISSION_META: Record<ContentType, { label: string; icon: LucideIcon }> = {
  shortform: { label: '숏폼', icon: Film },
  longform: { label: '롱폼', icon: Video },
  live: { label: '라이브', icon: Radio },
};

const DEFAULT_THUMBNAIL = { from: '#1a0a3e', to: '#4a1a6e', emoji: '🎮' };

type StatusFilter = 'all' | SubmissionStatus;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'pending', label: '진행 중' },
  { id: 'approved', label: '승인됨' },
  { id: 'rejected', label: '반려됨' },
];

interface ActivityRow {
  id: string;
  status: SubmissionStatus;
  reward: number;
  submittedAt: string | null;
  contentUrl: string;
  campaignId: string;
  campaignName: string;
  developer: string;
  thumbnail: { from: string; to: string; emoji: string };
  mission: ContentType;
}

function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return '방금 전';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
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

const ACTIVITY_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: '진행 중',
  approved: '승인됨',
  rejected: '반려됨',
};

function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <Badge variant={statusToBadgeVariant(status)} size="sm">
      {ACTIVITY_STATUS_LABELS[status]}
    </Badge>
  );
}

function HeaderRow() {
  return (
    <div
      role="row"
      className={`grid ${GRID} items-center gap-3 px-5 py-3 bg-bg-elevated text-xs font-medium text-text-secondary uppercase`}
    >
      <span aria-hidden />
      <span>캠페인</span>
      <span>미션</span>
      <span>콘텐츠</span>
      <span>제출일</span>
      <span>상태</span>
      <span className="text-right">보상</span>
      <span className="text-right">작업</span>
    </div>
  );
}

function Row({
  item,
  last,
  onSubmit,
}: {
  item: ActivityRow;
  last: boolean;
  onSubmit: (item: ActivityRow) => void;
}) {
  const meta = MISSION_META[item.mission];
  const Icon = meta.icon;
  const hasUrl = item.contentUrl.trim().length > 0;

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
        <span className="text-sm font-medium text-text-primary truncate">
          {item.campaignName}
        </span>
        <span className="text-[11px] text-text-secondary truncate">{item.developer}</span>
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
        <Icon size={12} aria-hidden />
        {meta.label}
      </span>

      <div className="min-w-0">
        {hasUrl ? (
          <a
            href={item.contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-white transition-colors duration-150 ease-out truncate max-w-full"
            title={item.contentUrl}
          >
            <span className="truncate">{item.contentUrl}</span>
            <ExternalLink size={11} className="shrink-0" aria-hidden />
          </a>
        ) : (
          <span className="text-xs text-text-muted">제작 중</span>
        )}
      </div>

      <span className="text-xs text-text-secondary">{getTimeAgo(item.submittedAt)}</span>

      <StatusBadge status={item.status} />

      <span className="text-sm font-medium tabular-nums text-text-primary text-right">
        {formatCompactKRW(item.reward)}
      </span>

      <div className="flex items-center justify-end">
        {item.status === 'pending' ? (
          <Button variant="primary" size="sm" onClick={() => onSubmit(item)}>
            URL 제출
          </Button>
        ) : item.status === 'approved' ? (
          <span className="text-[11px] text-success">승인됨</span>
        ) : (
          <span className="text-[11px] text-danger">반려됨</span>
        )}
      </div>
    </div>
  );
}

function rowToDisplayActivity(item: ActivityRow): DisplayActivity {
  // SubmitUrlModal은 DisplayActivity 형태를 요구. submissionId만 있으면
  // DB update 경로를 그대로 탄다.
  return {
    id: item.id,
    submissionId: item.id,
    campaignId: item.campaignId,
    campaignName: item.campaignName,
    developer: item.developer,
    thumbnail: item.thumbnail,
    mission: item.mission,
    status: 'making',
    reward: item.reward,
    appliedAt: item.submittedAt ?? new Date().toISOString(),
    submittedAt: undefined,
    title: `${MISSION_META[item.mission].label} · ${item.campaignName}`,
  };
}

export default function CreatorActivityPage() {
  const { data: creator, loading: creatorLoading } = useCurrentCreator();
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pending, setPending] = useState<ActivityRow | null>(null);

  const fetchActivity = useCallback(async () => {
    if (!HAS_SUPABASE_ENV || !creator) {
      setRows([]);
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
        campaigns ( name, developer, thumbnail ),
        applications ( missions ( type ) )
      `,
      )
      .eq('creator_id', creator.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      toast.error(`활동 내역 조회 실패: ${error.message}`);
      setRows([]);
      setLoading(false);
      return;
    }

    const subs = data ?? [];
    const mapped: ActivityRow[] = subs.map((s) => {
      const raw = s as unknown as {
        id: string;
        content_url: string;
        status: SubmissionStatus;
        reward: number;
        submitted_at: string | null;
        campaign_id: string;
        campaigns:
          | { name?: string; developer?: string; thumbnail?: unknown }
          | { name?: string; developer?: string; thumbnail?: unknown }[]
          | null;
        applications:
          | { missions: { type?: string | null } | { type?: string | null }[] | null }
          | { missions: { type?: string | null } | { type?: string | null }[] | null }[]
          | null;
      };

      const campaign = Array.isArray(raw.campaigns) ? raw.campaigns[0] : raw.campaigns;
      const application = Array.isArray(raw.applications)
        ? raw.applications[0]
        : raw.applications;
      const mission =
        application && application.missions
          ? Array.isArray(application.missions)
            ? application.missions[0]
            : application.missions
          : null;

      const missionType: ContentType =
        mission?.type === 'shortform' ||
        mission?.type === 'longform' ||
        mission?.type === 'live'
          ? (mission.type as ContentType)
          : 'shortform';

      return {
        id: raw.id,
        status: raw.status,
        reward: raw.reward,
        submittedAt: raw.submitted_at,
        contentUrl: raw.content_url ?? '',
        campaignId: raw.campaign_id,
        campaignName: campaign?.name ?? '알 수 없는 캠페인',
        developer: campaign?.developer ?? '',
        thumbnail: thumbnailFromJson(campaign?.thumbnail),
        mission: missionType,
      };
    });

    setRows(mapped);
    setLoading(false);
  }, [creator]);

  useEffect(() => {
    if (creatorLoading) return;
    void fetchActivity();
  }, [creatorLoading, fetchActivity]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: rows.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    for (const r of rows) c[r.status]++;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return rows;
    return rows.filter((r) => r.status === statusFilter);
  }, [rows, statusFilter]);

  if (creatorLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">불러오는 중…</span>
      </div>
    );
  }

  const userName = creator?.name || CURRENT_CREATOR.name;
  const userAvatar = CURRENT_CREATOR.emoji;
  // TODO(rebuild): grade now derives from creator_channels
  const userBadge = `${creator ? 'E' : CURRENT_CREATOR.grade}티어`;

  return (
    <WorkspaceLayout
      persona="creator"
      userName={userName}
      userAvatar={userAvatar}
      userBadge={userBadge}
      sidebarSections={getCreatorSidebar('activity')}
      notificationCount={3}
    >
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
          크리에이터 · 내 활동
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          내 활동
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          내 캠페인 지원·제출 내역 전체
        </p>
      </header>

      {!creator && (
        <Alert variant="warning" className="mb-6">
          크리에이터 프로필이 없습니다. 회원가입 시 role을 <code>creator</code>로 선택해야
          이 페이지가 작동합니다.
        </Alert>
      )}

      {rows.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {STATUS_FILTERS.map((f) => (
            <Pill
              key={f.id}
              variant={statusFilter === f.id ? 'active' : 'default'}
              size="md"
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
              <span
                className={[
                  'ml-1.5 tabular-nums',
                  statusFilter === f.id ? 'text-bg/70' : 'text-text-muted',
                ].join(' ')}
              >
                {counts[f.id]}
              </span>
            </Pill>
          ))}
        </div>
      )}

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <HeaderRow />
            {filtered.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <p className="text-sm text-text-primary mb-1">
                  {rows.length === 0
                    ? '아직 활동이 없어요.'
                    : '필터에 맞는 항목이 없어요.'}
                </p>
                <p className="text-xs text-text-secondary">
                  {rows.length === 0
                    ? '캠페인에 지원하고 시작해보세요.'
                    : '다른 상태 필터를 선택해보세요.'}
                </p>
              </div>
            ) : (
              filtered.map((item, i) => (
                <Row
                  key={item.id}
                  item={item}
                  last={i === filtered.length - 1}
                  onSubmit={setPending}
                />
              ))
            )}
          </div>
        </div>
      </Card>

      <SubmitUrlModal
        open={pending !== null}
        activity={pending ? rowToDisplayActivity(pending) : null}
        onClose={() => setPending(null)}
        onSubmitted={() => {
          void fetchActivity();
        }}
      />
    </WorkspaceLayout>
  );
}
