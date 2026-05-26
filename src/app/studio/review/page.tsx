'use client';

import { ExternalLink, Film, Radio, Video, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Badge, Button, Pill, toast } from '@/components/ui';
import type {
  CampaignThumbnailJson,
  CreatorGrade,
  MissionType,
  SubmissionStatus,
} from '@/lib/db.types';
import { formatCompactKRW } from '@/lib/mockAdmin';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentStudio } from '@/lib/supabase/hooks';

import { getStudioSidebar } from '../_config/sidebar';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const GRID =
  'grid-cols-[40px_1.3fr_1fr_0.8fr_1.2fr_0.7fr_0.8fr_0.7fr_180px]';

const MISSION_META: Record<MissionType, { label: string; icon: LucideIcon }> = {
  shortform: { label: 'Shortform', icon: Film },
  longform: { label: 'Longform', icon: Video },
  live: { label: 'Live', icon: Radio },
};

const DEFAULT_THUMBNAIL = { from: '#1a0a3e', to: '#4a1a6e', emoji: '🎮' };

type StatusFilter = 'all' | SubmissionStatus;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'review', label: 'In review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'paid', label: 'Paid' },
];

interface Submission {
  id: string;
  status: SubmissionStatus;
  reward: number;
  submittedAt: string | null;
  contentUrl: string;
  campaign: {
    id: string;
    name: string;
    developer: string;
    thumbnail: { from: string; to: string; emoji: string };
  };
  creator: {
    displayName: string;
    handle: string;
    grade: CreatorGrade;
  };
  mission: MissionType;
}

function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return 'Just now';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function thumbnailFromJson(json: unknown): { from: string; to: string; emoji: string } {
  if (json && typeof json === 'object') {
    const t = json as CampaignThumbnailJson;
    return {
      from: t.from ?? DEFAULT_THUMBNAIL.from,
      to: t.to ?? DEFAULT_THUMBNAIL.to,
      emoji: t.emoji ?? DEFAULT_THUMBNAIL.emoji,
    };
  }
  return DEFAULT_THUMBNAIL;
}

function StatusPill({ status }: { status: SubmissionStatus }) {
  if (status === 'making') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none border bg-bg-hover text-text-secondary border-white/10 whitespace-nowrap">
        제작 중
      </span>
    );
  }
  if (status === 'review') {
    return (
      <Pill variant="status" status="review" size="sm">
        검수 중
      </Pill>
    );
  }
  if (status === 'approved') {
    return (
      <Pill variant="status" status="live" size="sm">
        승인됨
      </Pill>
    );
  }
  if (status === 'paid') {
    return (
      <Pill variant="status" status="paid" size="sm">
        정산 완료
      </Pill>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none border bg-red-500/15 text-red-400 border-red-500/30 whitespace-nowrap">
      거절됨
    </span>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ease-out border whitespace-nowrap',
        active
          ? 'bg-ube text-white border-ube'
          : 'bg-transparent border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function HeaderRow() {
  return (
    <div
      role="row"
      className={`grid ${GRID} items-center gap-3 px-5 py-3 bg-bg-elevated text-[11px] uppercase tracking-wider text-text-secondary`}
    >
      <span aria-hidden />
      <span>Campaign</span>
      <span>Creator</span>
      <span>Mission</span>
      <span>Content</span>
      <span>Submitted</span>
      <span>Reward</span>
      <span>Status</span>
      <span className="text-right">Action</span>
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
  item: Submission;
  last: boolean;
  busy: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const meta = MISSION_META[item.mission];
  const Icon = meta.icon;
  const hasUrl = item.contentUrl.trim().length > 0;

  return (
    <div
      role="row"
      className={[
        `grid ${GRID} items-center gap-3 px-5 py-3 transition-colors duration-150 ease-out hover:bg-bg-hover`,
        last ? '' : 'border-b border-white/[0.06]',
      ].join(' ')}
    >
      <span
        className="w-8 h-8 rounded-md flex items-center justify-center text-[15px] leading-none"
        style={{
          background: `linear-gradient(135deg, ${item.campaign.thumbnail.from}, ${item.campaign.thumbnail.to})`,
        }}
        aria-hidden
      >
        {item.campaign.thumbnail.emoji}
      </span>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">
          {item.campaign.name}
        </span>
        <span className="text-[11px] text-text-secondary truncate">
          {item.campaign.developer}
        </span>
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-text-primary truncate">
            {item.creator.displayName}
          </span>
          <span className="text-[11px] text-text-secondary truncate">
            {item.creator.handle}
          </span>
        </div>
        <Badge variant="ube" size="sm">
          {item.creator.grade}
        </Badge>
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
            className="inline-flex items-center gap-1 text-xs text-ube-bright hover:text-white transition-colors duration-150 ease-out truncate max-w-full"
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

      <span className="text-sm font-medium tabular-nums text-text-primary">
        {formatCompactKRW(item.reward)}
      </span>

      <StatusPill status={item.status} />

      <div className="flex items-center justify-end gap-2">
        {item.status === 'review' ? (
          <>
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => onReject(item.id)}>
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={busy}
              onClick={() => onApprove(item.id)}
            >
              Approve
            </Button>
          </>
        ) : (
          <span className="text-[11px] text-text-muted">—</span>
        )}
      </div>
    </div>
  );
}

export default function StudioReviewPage() {
  const { data: studio, loading: studioLoading } = useCurrentStudio();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  const fetchSubmissions = useCallback(async () => {
    if (!HAS_SUPABASE_ENV || !studio) {
      setSubmissions([]);
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
        campaigns!inner ( id, name, developer, thumbnail, studio_id ),
        creators ( display_name, handle, grade ),
        applications ( missions ( type ) )
      `,
      )
      .eq('campaigns.studio_id', studio.id)
      .order('submitted_at', { ascending: false });

    console.log('[STUDIO REVIEW] queue:', data, 'error:', error);

    if (error) {
      toast.error(`제출물 조회 실패: ${error.message}`);
      setSubmissions([]);
      setLoading(false);
      return;
    }

    if (!data) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    const rows: Submission[] = data.map((s) => {
      const raw = s as unknown as {
        id: string;
        content_url: string;
        status: SubmissionStatus;
        reward: number;
        submitted_at: string | null;
        campaigns:
          | { id?: string; name?: string; developer?: string; thumbnail?: unknown }
          | { id?: string; name?: string; developer?: string; thumbnail?: unknown }[]
          | null;
        creators:
          | { display_name?: string; handle?: string; grade?: string | null }
          | { display_name?: string; handle?: string; grade?: string | null }[]
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

      const missionType: MissionType =
        mission?.type === 'shortform' ||
        mission?.type === 'longform' ||
        mission?.type === 'live'
          ? (mission.type as MissionType)
          : 'shortform';

      const grade = (creator?.grade as CreatorGrade | undefined) ?? 'E';

      return {
        id: raw.id,
        status: raw.status,
        reward: raw.reward,
        submittedAt: raw.submitted_at,
        contentUrl: raw.content_url ?? '',
        campaign: {
          id: campaign?.id ?? '',
          name: campaign?.name ?? 'Unknown campaign',
          developer: campaign?.developer ?? '',
          thumbnail: thumbnailFromJson(campaign?.thumbnail),
        },
        creator: {
          displayName: creator?.display_name ?? 'Unknown',
          handle: creator?.handle ?? '',
          grade,
        },
        mission: missionType,
      };
    });
    setSubmissions(rows);
    setLoading(false);
  }, [studio]);

  useEffect(() => {
    if (studioLoading) return;
    void fetchSubmissions();
  }, [studioLoading, fetchSubmissions]);

  const campaignOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of submissions) {
      if (s.campaign.id) map.set(s.campaign.id, s.campaign.name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [submissions]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (campaignFilter !== 'all' && s.campaign.id !== campaignFilter) return false;
      return true;
    });
  }, [submissions, statusFilter, campaignFilter]);

  const pendingCount = submissions.filter((s) => s.status === 'review').length;

  const handleApprove = async (submissionId: string) => {
    console.log('[STUDIO APPROVE] 시작', { submissionId });
    setBusyId(submissionId);
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id ?? null,
        })
        .eq('id', submissionId);
      console.log('[STUDIO APPROVE] error:', error);
      if (error) {
        toast.error(`승인 실패: ${error.message}`);
        return;
      }
      toast.success('콘텐츠가 승인되었습니다 (관리자 정산 대기)');
      await fetchSubmissions();
    } catch (err) {
      console.error('[STUDIO APPROVE] catch error:', err);
      toast.error(
        `오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    console.log('[STUDIO REJECT] 시작', { submissionId });
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
      console.log('[STUDIO REJECT] error:', error);
      if (error) {
        toast.error(`거절 실패: ${error.message}`);
        return;
      }
      toast.error('콘텐츠가 거절되었습니다');
      await fetchSubmissions();
    } catch (err) {
      console.error('[STUDIO REJECT] catch error:', err);
      toast.error(
        `오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setBusyId(null);
    }
  };

  if (studioLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <WorkspaceLayout
      persona="studio"
      userName={studio?.name ?? 'Pulse Games'}
      userAvatar="🎮"
      userBadge="Studio"
      sidebarSections={getStudioSidebar('review')}
      notificationCount={3}
    >
      <header className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ube-bright">
            Studio · Content review
          </span>
          <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
            Content review
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review submitted content from creators
          </p>
        </div>
        <span className="text-sm font-medium text-red-400 tabular-nums">
          {pendingCount} pending
        </span>
      </header>

      {!studio && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-xs text-amber-300 mb-6">
          스튜디오 프로필이 없습니다. 회원가입 시 role을 <code>studio</code>로 선택해야
          이 페이지가 작동합니다.
        </div>
      )}

      {submissions.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-text-muted mr-1">
              Status
            </span>
            {STATUS_FILTERS.map((f) => {
              const count =
                f.id === 'all'
                  ? submissions.length
                  : submissions.filter((s) => s.status === f.id).length;
              return (
                <FilterPill
                  key={f.id}
                  active={statusFilter === f.id}
                  onClick={() => setStatusFilter(f.id)}
                >
                  {f.label}
                  <span
                    className={[
                      'ml-1.5 tabular-nums',
                      statusFilter === f.id ? 'text-white/70' : 'text-text-muted',
                    ].join(' ')}
                  >
                    {count}
                  </span>
                </FilterPill>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-text-muted mr-1">
              Campaign
            </span>
            <FilterPill
              active={campaignFilter === 'all'}
              onClick={() => setCampaignFilter('all')}
            >
              All campaigns
              <span className="ml-1.5 text-text-muted tabular-nums">
                {submissions.length}
              </span>
            </FilterPill>
            {campaignOptions.map(({ id, name }) => {
              const count = submissions.filter((s) => s.campaign.id === id).length;
              return (
                <FilterPill
                  key={id}
                  active={campaignFilter === id}
                  onClick={() => setCampaignFilter(id)}
                >
                  {name}
                  <span
                    className={[
                      'ml-1.5 tabular-nums',
                      campaignFilter === id ? 'text-white/70' : 'text-text-muted',
                    ].join(' ')}
                  >
                    {count}
                  </span>
                </FilterPill>
              );
            })}
          </div>
        </div>
      )}

      <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-bg-card">
        <HeaderRow />
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-text-primary mb-1">
              {submissions.length === 0
                ? 'No submissions yet.'
                : 'No submissions match your filters.'}
            </p>
            <p className="text-xs text-text-secondary">
              {submissions.length === 0
                ? 'Creators will submit content here once they finish their work.'
                : 'Try changing the status or campaign filter above.'}
            </p>
          </div>
        ) : (
          filtered.map((item, i) => (
            <Row
              key={item.id}
              item={item}
              last={i === filtered.length - 1}
              busy={busyId === item.id}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>
    </WorkspaceLayout>
  );
}
