'use client';

import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Input, Pill, toast } from '@/components/ui';
import type {
  CampaignStatus,
  CampaignThumbnailJson,
  Database,
} from '@/lib/db.types';
import { formatCompactKRW } from '@/lib/mockAdmin';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentProfile } from '@/lib/supabase/hooks';

import { getAdminSidebar } from '../_config/sidebar';
import { useAdminBadgeCounts } from '../_hooks/useAdminBadgeCounts';

type CampaignRow = Database['public']['Tables']['campaigns']['Row'];

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const GRID =
  'grid-cols-[40px_1.4fr_1fr_0.7fr_0.9fr_0.9fr_1.1fr_0.7fr_0.7fr_0.9fr]';

const DEFAULT_THUMBNAIL = { from: '#1a0a3e', to: '#4a1a6e', emoji: '🎮' };

type StatusFilter = 'all' | CampaignStatus;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'draft', label: '초안' },
  { id: 'recruiting', label: '모집중' },
  { id: 'live', label: '진행중' },
  { id: 'completed', label: '완료' },
];

interface CampaignWithCounts extends CampaignRow {
  studioName: string;
  applicantsCount: number;
  submissionsCount: number;
  thumbnailParsed: { from: string; to: string; emoji: string };
}

function formatCreatedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

function StatusPill({ status }: { status: CampaignStatus }) {
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none border bg-bg-hover text-text-secondary border-white/10 whitespace-nowrap">
        초안
      </span>
    );
  }
  if (status === 'recruiting') {
    return (
      <Pill variant="status" status="recruiting" size="sm">
        모집중
      </Pill>
    );
  }
  if (status === 'live') {
    return (
      <Pill variant="status" status="live" size="sm">
        진행중
      </Pill>
    );
  }
  return (
    <Pill variant="status" status="completed" size="sm">
      완료
    </Pill>
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
      <span>캠페인</span>
      <span>게임사</span>
      <span>장르</span>
      <span>상태</span>
      <span className="text-right">예산</span>
      <span>집행액</span>
      <span className="text-right">크리에이터</span>
      <span className="text-right">제출</span>
      <span>등록일</span>
    </div>
  );
}

function BudgetBar({ total, spent }: { total: number; spent: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center justify-between gap-2 text-[11px] tabular-nums">
        <span className="text-text-secondary">{formatCompactKRW(spent)}</span>
        <span className="text-text-muted">{pct}%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-bg-hover overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background:
              pct >= 100
                ? 'var(--text-secondary)'
                : 'linear-gradient(90deg, var(--ube-bright), var(--ube))',
          }}
        />
      </div>
    </div>
  );
}

function Row({ item, last }: { item: CampaignWithCounts; last: boolean }) {
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
          background: `linear-gradient(135deg, ${item.thumbnailParsed.from}, ${item.thumbnailParsed.to})`,
        }}
        aria-hidden
      >
        {item.thumbnailParsed.emoji}
      </span>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">{item.name}</span>
        <span className="text-[11px] text-text-secondary truncate">{item.developer}</span>
      </div>

      <span className="text-xs text-text-secondary truncate">{item.studioName}</span>

      <span className="text-xs text-text-secondary truncate">{item.genre || '—'}</span>

      <StatusPill status={item.status} />

      <span className="text-sm font-medium tabular-nums text-text-primary text-right">
        {formatCompactKRW(item.total_budget)}
      </span>

      <BudgetBar total={item.total_budget} spent={item.spent_budget} />

      <span className="text-sm tabular-nums text-text-secondary text-right">
        {item.applicantsCount}
        <span className="text-text-muted text-[11px]"> / {item.target_creators}</span>
      </span>

      <span className="text-sm tabular-nums text-text-secondary text-right">
        {item.submissionsCount}
      </span>

      <span className="text-xs text-text-secondary tabular-nums">
        {formatCreatedDate(item.created_at)}
      </span>
    </div>
  );
}

export default function AdminCampaignsPage() {
  const { data: profile, loading: profileLoading } = useCurrentProfile();
  const badgeCounts = useAdminBadgeCounts();
  const [campaigns, setCampaigns] = useState<CampaignWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const fetchCampaigns = useCallback(async () => {
    if (!HAS_SUPABASE_ENV) {
      setCampaigns([]);
      setLoading(false);
      return;
    }
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select(
        `
        *,
        studios ( name ),
        applications ( id ),
        submissions ( id )
      `,
      )
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(`캠페인 조회 실패: ${error.message}`);
      setCampaigns([]);
      setLoading(false);
      return;
    }

    const subs = data ?? [];
    const rows: CampaignWithCounts[] = subs.map((c) => {
      const raw = c as unknown as CampaignRow & {
        studios:
          | { name?: string }
          | { name?: string }[]
          | null;
        applications: { id: string }[] | null;
        submissions: { id: string }[] | null;
      };
      const studio = Array.isArray(raw.studios) ? raw.studios[0] : raw.studios;
      return {
        ...(raw as CampaignRow),
        studioName: studio?.name ?? '—',
        applicantsCount: raw.applications?.length ?? 0,
        submissionsCount: raw.submissions?.length ?? 0,
        thumbnailParsed: thumbnailFromJson(raw.thumbnail),
      };
    });
    setCampaigns(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: campaigns.length,
      draft: 0,
      recruiting: 0,
      live: 0,
      completed: 0,
    };
    for (const r of campaigns) c[r.status]++;
    return c;
  }, [campaigns]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (q) {
        const hay = `${c.name} ${c.developer} ${c.genre}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [campaigns, statusFilter, search]);

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">불러오는 중…</span>
      </div>
    );
  }

  const adminName = profile?.name?.trim() || '민석';
  const initials = adminName.slice(0, 2).toUpperCase();

  return (
    <WorkspaceLayout
      persona="admin"
      userName={adminName}
      userAvatar={initials}
      userBadge="관리자"
      sidebarSections={getAdminSidebar('campaigns', {
        review: badgeCounts.review,
        payouts: badgeCounts.payouts,
      })}
      notificationCount={badgeCounts.notification}
    >
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ube-bright">
          관리자 · 디렉터리
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          캠페인
        </h1>
        <p className="text-sm text-text-secondary mt-1">플랫폼의 모든 캠페인</p>
      </header>

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
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
                {counts[f.id]}
              </span>
            </FilterPill>
          ))}
        </div>
        <div className="ml-auto w-full max-w-xs">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="캠페인 검색"
            icon={<Search size={14} aria-hidden />}
          />
        </div>
      </div>

      <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-bg-card">
        <HeaderRow />
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-text-primary mb-1">
              {campaigns.length === 0
                ? '캠페인이 없습니다.'
                : '필터에 맞는 캠페인이 없습니다.'}
            </p>
            <p className="text-xs text-text-secondary">
              {campaigns.length === 0
                ? '게임사가 캠페인을 생성하면 여기에 표시됩니다.'
                : '다른 상태나 검색어를 시도해 보세요.'}
            </p>
          </div>
        ) : (
          filtered.map((item, i) => (
            <Row key={item.id} item={item} last={i === filtered.length - 1} />
          ))
        )}
      </div>
    </WorkspaceLayout>
  );
}
