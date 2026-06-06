'use client';

import {
  BadgeCheck,
  PlaySquare,
  Radio,
  Search,
  Tv,
  UserSearch,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Badge, Button, EmptyState, Input, toast } from '@/components/ui';
import type { CreatorGrade, Database } from '@/lib/db.types';
import { formatSubscribers } from '@/lib/mockCreators';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentStudio } from '@/lib/supabase/hooks';

import { getStudioSidebar } from '../_config/sidebar';

type CreatorRow = Database['public']['Tables']['creators']['Row'];

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// Filters
// ─────────────────────────────────────────────────────────────────────────────

type GradeFilter = 'all' | CreatorGrade;
type PlatformFilter = 'all' | PlatformKey;
type SortKey = 'subscribers' | 'rating' | 'campaigns';

const GRADE_FILTERS: { id: GradeFilter; label: string }[] = [
  { id: 'all', label: '전체 등급' },
  { id: 'A', label: 'A티어' },
  { id: 'B', label: 'B티어' },
  { id: 'C', label: 'C티어' },
  { id: 'D', label: 'D티어' },
  { id: 'E', label: 'E티어' },
];

const PLATFORM_FILTERS: { id: PlatformFilter; label: string }[] = [
  { id: 'all', label: '전체 플랫폼' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'soop', label: 'SOOP' },
  { id: 'chzzk', label: '치지직' },
];

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'subscribers', label: '구독자순' },
  { id: 'rating', label: '평점순' },
  { id: 'campaigns', label: '캠페인순' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Platform parsing & icons
// ─────────────────────────────────────────────────────────────────────────────

type PlatformKey = 'youtube' | 'soop' | 'chzzk';

const PLATFORM_META: Record<PlatformKey, { label: string; Icon: LucideIcon }> = {
  youtube: { label: 'YouTube', Icon: PlaySquare },
  soop: { label: 'SOOP', Icon: Radio },
  chzzk: { label: '치지직', Icon: Tv },
};

/** Return the set of platform types that have a non-empty URL. */
function parseConnectedPlatforms(raw: unknown): Set<PlatformKey> {
  const set = new Set<PlatformKey>();
  if (!Array.isArray(raw)) return set;
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const p = item as { type?: unknown; url?: unknown };
    if (typeof p.url !== 'string' || p.url.trim().length === 0) continue;
    if (p.type === 'youtube' || p.type === 'soop' || p.type === 'chzzk') {
      set.add(p.type);
    }
  }
  return set;
}

// ─────────────────────────────────────────────────────────────────────────────
// Card visuals
// ─────────────────────────────────────────────────────────────────────────────

const GRADE_GRADIENT: Record<CreatorGrade, string> = {
  A: 'from-purple-900/40 to-purple-600/20',
  B: 'from-indigo-900/40 to-indigo-600/20',
  C: 'from-blue-900/40 to-blue-600/20',
  D: 'from-teal-900/40 to-teal-600/20',
  E: 'from-slate-800/40 to-slate-600/20',
};

function safeGrade(g: string | null | undefined): CreatorGrade {
  if (g === 'A' || g === 'B' || g === 'C' || g === 'D' || g === 'E') return g;
  return 'E';
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
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ease-out border whitespace-nowrap cursor-pointer',
        active
          ? 'bg-ube text-white border-ube'
          : 'bg-transparent border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

interface CreatorCardData {
  row: CreatorRow;
  grade: CreatorGrade;
  platforms: Set<PlatformKey>;
}

function CreatorCard({ data }: { data: CreatorCardData }) {
  const { row, grade, platforms } = data;
  const initial = row.display_name.trim().charAt(0).toUpperCase() || '?';

  const handleViewProfile = () => {
    toast.info('크리에이터 프로필 페이지는 곧 추가됩니다');
  };

  return (
    <article className="bg-bg-card border border-white/[0.06] rounded-lg overflow-hidden hover:border-ube/40 transition-colors duration-150 ease-out flex flex-col">
      <div
        className={`relative h-24 bg-gradient-to-br ${GRADE_GRADIENT[grade]}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden
            className="w-12 h-12 rounded-full bg-bg-card border border-white/10 flex items-center justify-center text-base font-medium text-text-primary shadow-sm shadow-black/30"
          >
            {initial}
          </span>
        </div>
        <span className="absolute top-2 right-2">
          <Badge variant="ube" size="sm">
            {grade}
          </Badge>
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-sm font-medium text-text-primary truncate">
              {row.display_name}
            </h3>
            {row.is_verified && (
              <BadgeCheck
                size={13}
                className="text-ube-bright shrink-0"
                aria-label="인증"
              />
            )}
          </div>
          <p className="text-xs text-text-secondary truncate">{row.handle}</p>
        </div>

        {row.bio && (
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
            {row.bio}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 text-xs text-text-secondary tabular-nums">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>📺</span>
            <span className="text-text-primary font-medium">
              {formatSubscribers(row.subscribers)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>⭐</span>
            <span className="text-text-primary font-medium">
              {Number(row.rating).toFixed(1)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>🏆</span>
            <span className="text-text-primary font-medium">
              {row.completed_campaigns}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 min-h-[18px]">
          {platforms.size === 0 ? (
            <span className="text-[11px] text-text-muted">연결된 플랫폼 없음</span>
          ) : (
            (Array.from(platforms) as PlatformKey[]).map((key) => {
              const { label, Icon } = PLATFORM_META[key];
              return (
                <span
                  key={key}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-bg-elevated border border-white/10 text-text-secondary"
                  title={label}
                  aria-label={label}
                >
                  <Icon size={12} aria-hidden />
                </span>
              );
            })
          )}
        </div>

        <div className="mt-auto pt-2">
          <Button variant="ghost" size="sm" full onClick={handleViewProfile}>
            프로필 보기
          </Button>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function StudioCreatorDirectoryPage() {
  const { data: studio, loading: studioLoading } = useCurrentStudio();
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState<GradeFilter>('all');
  const [platform, setPlatform] = useState<PlatformFilter>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('subscribers');

  const fetchCreators = useCallback(async () => {
    if (!HAS_SUPABASE_ENV) {
      setCreators([]);
      setLoading(false);
      return;
    }
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('subscribers', { ascending: false });

    if (error) {
      toast.error(`크리에이터 조회 실패: ${error.message}`);
      setCreators([]);
    } else {
      setCreators(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCreators();
  }, [fetchCreators]);

  // Pre-compute card data once per fetch (parses platforms & normalizes grade).
  const cards = useMemo<CreatorCardData[]>(() => {
    return creators.map((row) => ({
      row,
      grade: safeGrade(row.grade),
      platforms: parseConnectedPlatforms(row.platforms),
    }));
  }, [creators]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = cards.filter((c) => {
      if (grade !== 'all' && c.grade !== grade) return false;
      if (platform !== 'all' && !c.platforms.has(platform)) return false;
      if (q) {
        const hay = `${c.row.display_name} ${c.row.handle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...items];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case 'rating':
          return Number(b.row.rating) - Number(a.row.rating);
        case 'campaigns':
          return b.row.completed_campaigns - a.row.completed_campaigns;
        case 'subscribers':
        default:
          return b.row.subscribers - a.row.subscribers;
      }
    });
    return sorted;
  }, [cards, grade, platform, search, sortKey]);

  const totalCreators = creators.length;
  const isInitialLoading = studioLoading || loading;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">불러오는 중…</span>
      </div>
    );
  }

  return (
    <WorkspaceLayout
      persona="studio"
      userName={studio?.name ?? '테스트 게임사 1'}
      userAvatar="🎮"
      userBadge="게임사"
      sidebarSections={getStudioSidebar('creators')}
      notificationCount={3}
    >
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ube-bright">
          게임사 · 탐색
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          크리에이터 목록
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          캠페인에 맞는 크리에이터를 찾아보세요
        </p>
      </header>

      {totalCreators > 0 && (
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {GRADE_FILTERS.map((f) => (
              <FilterPill
                key={f.id}
                active={grade === f.id}
                onClick={() => setGrade(f.id)}
              >
                {f.label}
              </FilterPill>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {PLATFORM_FILTERS.map((f) => (
              <FilterPill
                key={f.id}
                active={platform === f.id}
                onClick={() => setPlatform(f.id)}
              >
                {f.label}
              </FilterPill>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider text-text-muted mr-1">
                정렬
              </span>
              {SORT_OPTIONS.map((opt) => (
                <FilterPill
                  key={opt.id}
                  active={sortKey === opt.id}
                  onClick={() => setSortKey(opt.id)}
                >
                  {opt.label}
                </FilterPill>
              ))}
            </div>
            <div className="w-full md:w-auto md:min-w-[280px]">
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름 또는 핸들 검색"
                icon={<Search size={14} aria-hidden />}
              />
            </div>
          </div>
        </div>
      )}

      {totalCreators === 0 ? (
        <div className="border border-white/[0.06] rounded-lg bg-bg-card">
          <EmptyState
            icon={<UserSearch size={24} aria-hidden />}
            title="등록된 크리에이터가 없습니다"
            description="크리에이터가 가입하면 여기에 표시됩니다."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-white/[0.06] rounded-lg bg-bg-card">
          <EmptyState
            icon={<UserSearch size={24} aria-hidden />}
            title="조건에 맞는 크리에이터가 없습니다"
            description="필터를 변경해보세요."
          />
        </div>
      ) : (
        <>
          <div className="text-xs text-text-secondary mb-3 tabular-nums">
            전체 {totalCreators}명 중 {filtered.length}명
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((c) => (
              <CreatorCard key={c.row.id} data={c} />
            ))}
          </div>
        </>
      )}
    </WorkspaceLayout>
  );
}
