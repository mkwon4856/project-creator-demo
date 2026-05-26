'use client';

import { Check, Search, Star, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Badge, Input, toast } from '@/components/ui';
import type { CreatorGrade, Database } from '@/lib/db.types';
import { formatSubscribers } from '@/lib/mockCreators';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentProfile } from '@/lib/supabase/hooks';

import { getAdminSidebar } from '../_config/sidebar';

type CreatorRow = Database['public']['Tables']['creators']['Row'];

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const GRID =
  'grid-cols-[1.4fr_1fr_0.5fr_0.9fr_0.9fr_0.7fr_0.7fr_0.6fr_0.9fr]';

type GradeFilter = 'all' | CreatorGrade;

const GRADE_FILTERS: { id: GradeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'A', label: 'A-tier' },
  { id: 'B', label: 'B-tier' },
  { id: 'C', label: 'C-tier' },
  { id: 'D', label: 'D-tier' },
  { id: 'E', label: 'E-tier' },
];

function formatJoinedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
      <span>Creator</span>
      <span>Handle</span>
      <span>Grade</span>
      <span className="text-right">Subscribers</span>
      <span className="text-right">Avg views</span>
      <span className="text-right">Rating</span>
      <span className="text-right">Campaigns</span>
      <span className="text-center">Verified</span>
      <span>Joined</span>
    </div>
  );
}

function Row({ item, last }: { item: CreatorRow; last: boolean }) {
  return (
    <div
      role="row"
      className={[
        `grid ${GRID} items-center gap-3 px-5 py-3 transition-colors duration-150 ease-out hover:bg-bg-hover`,
        last ? '' : 'border-b border-white/[0.06]',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 min-w-0">
        <CreatorAvatar name={item.display_name} />
        <span className="text-sm font-medium text-text-primary truncate">
          {item.display_name}
        </span>
      </div>

      <span className="text-xs text-text-secondary truncate">{item.handle}</span>

      <Badge variant="ube" size="sm">
        {item.grade}
      </Badge>

      <span className="text-sm tabular-nums text-text-primary text-right">
        {formatSubscribers(item.subscribers)}
      </span>

      <span className="text-sm tabular-nums text-text-secondary text-right">
        {formatSubscribers(item.avg_views)}
      </span>

      <span className="inline-flex items-center justify-end gap-1 text-sm tabular-nums text-text-primary">
        <Star size={12} className="text-amber-400 fill-amber-400" aria-hidden />
        {Number(item.rating).toFixed(1)}
      </span>

      <span className="text-sm tabular-nums text-text-secondary text-right">
        {item.completed_campaigns}
      </span>

      <span className="flex items-center justify-center">
        {item.is_verified ? (
          <Check size={14} className="text-green-400" aria-hidden />
        ) : (
          <X size={14} className="text-text-muted" aria-hidden />
        )}
      </span>

      <span className="text-xs text-text-secondary tabular-nums">
        {formatJoinedDate(item.created_at)}
      </span>
    </div>
  );
}

export default function AdminCreatorsPage() {
  const { data: profile, loading: profileLoading } = useCurrentProfile();
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [search, setSearch] = useState('');

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

    console.log('[ADMIN CREATORS] data:', data?.length, 'error:', error);

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

  const counts = useMemo(() => {
    const c: Record<GradeFilter, number> = {
      all: creators.length,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
    };
    for (const r of creators) {
      const g = r.grade as CreatorGrade;
      if (g === 'A' || g === 'B' || g === 'C' || g === 'D' || g === 'E') {
        c[g]++;
      }
    }
    return c;
  }, [creators]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return creators.filter((c) => {
      if (gradeFilter !== 'all' && c.grade !== gradeFilter) return false;
      if (q) {
        const hay = `${c.display_name} ${c.handle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [creators, gradeFilter, search]);

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">Loading…</span>
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
      userBadge="Admin"
      sidebarSections={getAdminSidebar('creators')}
      notificationCount={5}
    >
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ube-bright">
          Admin · Directory
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          Creators
        </h1>
        <p className="text-sm text-text-secondary mt-1">Manage registered creators</p>
      </header>

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {GRADE_FILTERS.map((f) => (
            <FilterPill
              key={f.id}
              active={gradeFilter === f.id}
              onClick={() => setGradeFilter(f.id)}
            >
              {f.label}
              <span
                className={[
                  'ml-1.5 tabular-nums',
                  gradeFilter === f.id ? 'text-white/70' : 'text-text-muted',
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
            placeholder="Search by name or handle"
            icon={<Search size={14} aria-hidden />}
          />
        </div>
      </div>

      <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-bg-card">
        <HeaderRow />
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-text-primary mb-1">
              {creators.length === 0
                ? 'No creators found.'
                : 'No creators match your filter.'}
            </p>
            <p className="text-xs text-text-secondary">
              {creators.length === 0
                ? 'Creators will appear here once they sign up.'
                : 'Try a different grade or search query.'}
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
