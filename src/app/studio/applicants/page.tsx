'use client';

import { Film, Radio, Users, Video, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Badge, Button, EmptyState, Pill, toast } from '@/components/ui';
import type { ApplicationStatus, CreatorGrade, MissionType } from '@/lib/db.types';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentStudio } from '@/lib/supabase/hooks';

import { getStudioSidebar } from '../_config/sidebar';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const GRID = 'grid-cols-[1.4fr_1.2fr_1fr_0.8fr_0.6fr_0.9fr_180px]';

const MISSION_META: Record<MissionType, { label: string; icon: LucideIcon }> = {
  shortform: { label: '숏폼', icon: Film },
  longform: { label: '롱폼', icon: Video },
  live: { label: '라이브', icon: Radio },
};

interface Applicant {
  id: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  campaign: {
    id: string;
    name: string;
    developer: string;
  };
  mission: MissionType;
  creator: {
    displayName: string;
    handle: string;
    grade: CreatorGrade;
    subscribers: number;
  };
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
  return new Date(dateStr).toLocaleDateString();
}

function formatSubscribers(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(n >= 100_000 ? 0 : 1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function StatusPill({ status }: { status: ApplicationStatus }) {
  if (status === 'applied') {
    return <Pill variant="status" status="review" size="sm">대기 중</Pill>;
  }
  if (status === 'accepted') {
    return <Pill variant="status" status="live" size="sm">수락됨</Pill>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none border bg-red-500/15 text-red-400 border-red-500/30 whitespace-nowrap">
      거절됨
    </span>
  );
}

function CreatorAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span
      className="inline-flex w-8 h-8 rounded-full bg-bg-hover items-center justify-center text-xs font-medium text-text-secondary shrink-0"
      aria-hidden
    >
      {initial}
    </span>
  );
}

function HeaderRow() {
  return (
    <div
      role="row"
      className={`grid ${GRID} items-center gap-3 px-5 py-3 bg-bg-elevated text-[11px] uppercase tracking-wider text-text-secondary`}
    >
      <span>크리에이터</span>
      <span>캠페인</span>
      <span>미션</span>
      <span>지원일</span>
      <span>등급</span>
      <span>상태</span>
      <span className="text-right">작업</span>
    </div>
  );
}

function Row({
  item,
  last,
  busy,
  onAccept,
  onReject,
}: {
  item: Applicant;
  last: boolean;
  busy: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const meta = MISSION_META[item.mission];
  const Icon = meta.icon;

  return (
    <div
      role="row"
      className={[
        `grid ${GRID} items-center gap-3 px-5 py-3 transition-colors duration-150 ease-out hover:bg-bg-hover`,
        last ? '' : 'border-b border-white/[0.06]',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 min-w-0">
        <CreatorAvatar name={item.creator.displayName} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-text-primary truncate">
            {item.creator.displayName}
          </span>
          <span className="text-[11px] text-text-secondary truncate">
            {item.creator.handle} · 구독자 {formatSubscribers(item.creator.subscribers)}
          </span>
        </div>
      </div>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">
          {item.campaign.name}
        </span>
        <span className="text-[11px] text-text-secondary truncate">{item.campaign.developer}</span>
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
        <Icon size={12} aria-hidden />
        {meta.label}
      </span>

      <span className="text-xs text-text-secondary">{getTimeAgo(item.appliedAt)}</span>

      <Badge variant="ube" size="sm">{item.creator.grade}</Badge>

      <StatusPill status={item.status} />

      <div className="flex items-center justify-end gap-2">
        {item.status === 'applied' ? (
          <>
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => onReject(item.id)}>
              거절
            </Button>
            <Button variant="primary" size="sm" disabled={busy} onClick={() => onAccept(item.id)}>
              수락
            </Button>
          </>
        ) : (
          <span className="text-[11px] text-text-muted">—</span>
        )}
      </div>
    </div>
  );
}

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function FilterPill({ active, onClick, children }: FilterPillProps) {
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

export default function StudioApplicantsPage() {
  const { data: studio, loading: studioLoading } = useCurrentStudio();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  const fetchApplicants = useCallback(async () => {
    if (!HAS_SUPABASE_ENV || !studio) {
      setApplicants([]);
      setLoading(false);
      return;
    }
    const supabase = createBrowserSupabaseClient();

    const { data, error } = await supabase
      .from('applications')
      .select(
        `
        id,
        status,
        applied_at,
        campaigns!inner ( id, name, developer, studio_id ),
        missions ( type ),
        creators ( display_name, handle, grade, subscribers )
      `,
      )
      .eq('campaigns.studio_id', studio.id)
      .order('applied_at', { ascending: false });

    if (error) {
      toast.error(`지원자 조회 실패: ${error.message}`);
      setApplicants([]);
      setLoading(false);
      return;
    }

    if (!data) {
      setApplicants([]);
      setLoading(false);
      return;
    }

    const rows: Applicant[] = data.map((a) => {
      const raw = a as unknown as {
        id: string;
        status: ApplicationStatus;
        applied_at: string | null;
        campaigns:
          | { id?: string; name?: string; developer?: string }
          | { id?: string; name?: string; developer?: string }[]
          | null;
        missions:
          | { type?: string | null }
          | { type?: string | null }[]
          | null;
        creators:
          | {
              display_name?: string;
              handle?: string;
              grade?: string | null;
              subscribers?: number | null;
            }
          | {
              display_name?: string;
              handle?: string;
              grade?: string | null;
              subscribers?: number | null;
            }[]
          | null;
      };

      const campaign = Array.isArray(raw.campaigns) ? raw.campaigns[0] : raw.campaigns;
      const mission = Array.isArray(raw.missions) ? raw.missions[0] : raw.missions;
      const creator = Array.isArray(raw.creators) ? raw.creators[0] : raw.creators;

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
        appliedAt: raw.applied_at,
        campaign: {
          id: campaign?.id ?? '',
          name: campaign?.name ?? '알 수 없는 캠페인',
          developer: campaign?.developer ?? '',
        },
        mission: missionType,
        creator: {
          displayName: creator?.display_name ?? '알 수 없음',
          handle: creator?.handle ?? '',
          grade,
          subscribers: Number(creator?.subscribers ?? 0),
        },
      };
    });
    setApplicants(rows);
    setLoading(false);
  }, [studio]);

  useEffect(() => {
    if (studioLoading) return;
    void fetchApplicants();
  }, [studioLoading, fetchApplicants]);

  const campaignOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of applicants) {
      if (a.campaign.id) map.set(a.campaign.id, a.campaign.name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [applicants]);

  const filtered = useMemo(() => {
    if (campaignFilter === 'all') return applicants;
    return applicants.filter((a) => a.campaign.id === campaignFilter);
  }, [applicants, campaignFilter]);

  const handleAccept = async (applicationId: string) => {
    setBusyId(applicationId);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId);
      if (error) {
        toast.error(`수락 실패: ${error.message}`);
        return;
      }
      toast.success('지원을 수락했습니다');
      await fetchApplicants();
    } catch (err) {
      console.error('[ACCEPT] catch error:', err);
      toast.error(`오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    setBusyId(applicationId);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);
      if (error) {
        toast.error(`거절 실패: ${error.message}`);
        return;
      }
      toast.error('지원을 거절했습니다');
      await fetchApplicants();
    } catch (err) {
      console.error('[REJECT] catch error:', err);
      toast.error(`오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusyId(null);
    }
  };

  if (studioLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">불러오는 중…</span>
      </div>
    );
  }

  const pendingCount = applicants.filter((a) => a.status === 'applied').length;

  return (
    <WorkspaceLayout
      persona="studio"
      userName={studio?.name ?? '테스트 게임사 1'}
      userAvatar="🎮"
      userBadge="게임사"
      sidebarSections={getStudioSidebar('applicants')}
      notificationCount={3}
    >
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ube-bright">
          게임사 · 지원자
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          지원자
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          캠페인에 지원한 크리에이터를 검토하고 관리하세요
        </p>
      </header>

      {!studio && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-xs text-amber-300 mb-6">
          스튜디오 프로필이 없습니다. 회원가입 시 role을 <code>studio</code>로 선택해야
          이 페이지가 작동합니다.
        </div>
      )}

      {applicants.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <FilterPill
            active={campaignFilter === 'all'}
            onClick={() => setCampaignFilter('all')}
          >
            전체 캠페인
            <span className="ml-1.5 text-text-muted tabular-nums">{applicants.length}</span>
          </FilterPill>
          {campaignOptions.map(({ id, name }) => {
            const count = applicants.filter((a) => a.campaign.id === id).length;
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
          <span className="ml-auto text-[11px] font-medium text-amber-400 tabular-nums">
            대기 {pendingCount}건
          </span>
        </div>
      )}

      {applicants.length === 0 ? (
        <div className="border border-white/[0.06] rounded-lg bg-bg-card">
          <EmptyState
            icon={<Users size={24} aria-hidden />}
            title="아직 지원자가 없습니다"
            description="캠페인을 만들면 크리에이터들이 지원합니다."
            primaryAction={{ label: '캠페인 만들기', href: '/studio/new' }}
          />
        </div>
      ) : (
        <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-bg-card">
          <HeaderRow />
          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm text-text-primary mb-1">필터에 맞는 지원자가 없습니다.</p>
              <p className="text-xs text-text-secondary">
                위의 캠페인 필터를 변경해보세요.
              </p>
            </div>
          ) : (
            filtered.map((item, i) => (
              <Row
                key={item.id}
                item={item}
                last={i === filtered.length - 1}
                busy={busyId === item.id}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      )}
    </WorkspaceLayout>
  );
}
