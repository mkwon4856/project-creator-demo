'use client';

import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Input, toast } from '@/components/ui';
import type { Database } from '@/lib/db.types';
import { formatCompactKRW } from '@/lib/mockAdmin';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentProfile } from '@/lib/supabase/hooks';

import { getAdminSidebar } from '../_config/sidebar';

type StudioRow = Database['public']['Tables']['studios']['Row'];

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const GRID = 'grid-cols-[1.4fr_1.4fr_0.8fr_1fr_0.9fr]';

interface StudioWithCounts extends StudioRow {
  email: string;
  campaignsCount: number;
  totalBudget: number;
}

function formatJoinedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StudioAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span
      className="inline-flex w-8 h-8 rounded-md bg-bg-hover items-center justify-center text-xs font-medium text-text-secondary shrink-0"
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
      <span>Studio</span>
      <span>Email</span>
      <span className="text-right">Campaigns</span>
      <span className="text-right">Total budget</span>
      <span>Joined</span>
    </div>
  );
}

function Row({ item, last }: { item: StudioWithCounts; last: boolean }) {
  return (
    <div
      role="row"
      className={[
        `grid ${GRID} items-center gap-3 px-5 py-3 transition-colors duration-150 ease-out hover:bg-bg-hover`,
        last ? '' : 'border-b border-white/[0.06]',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 min-w-0">
        <StudioAvatar name={item.name} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-text-primary truncate">
            {item.name}
          </span>
          {item.description && (
            <span className="text-[11px] text-text-secondary truncate">
              {item.description}
            </span>
          )}
        </div>
      </div>

      <span className="text-xs text-text-secondary truncate">{item.email || '—'}</span>

      <span className="text-sm tabular-nums text-text-primary text-right">
        {item.campaignsCount}
      </span>

      <span className="text-sm font-medium tabular-nums text-text-primary text-right">
        {formatCompactKRW(item.totalBudget)}
      </span>

      <span className="text-xs text-text-secondary tabular-nums">
        {formatJoinedDate(item.created_at)}
      </span>
    </div>
  );
}

export default function AdminStudiosPage() {
  const { data: profile, loading: profileLoading } = useCurrentProfile();
  const [studios, setStudios] = useState<StudioWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudios = useCallback(async () => {
    if (!HAS_SUPABASE_ENV) {
      setStudios([]);
      setLoading(false);
      return;
    }
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from('studios')
      .select(
        `
        *,
        profiles ( email ),
        campaigns ( id, total_budget )
      `,
      )
      .order('created_at', { ascending: false });

    console.log('[ADMIN STUDIOS] data:', data?.length, 'error:', error);

    if (error) {
      toast.error(`스튜디오 조회 실패: ${error.message}`);
      setStudios([]);
      setLoading(false);
      return;
    }

    const rows: StudioWithCounts[] = (data ?? []).map((s) => {
      const raw = s as unknown as StudioRow & {
        profiles: { email?: string } | { email?: string }[] | null;
        campaigns: { id: string; total_budget: number }[] | null;
      };
      const profileRow = Array.isArray(raw.profiles)
        ? raw.profiles[0]
        : raw.profiles;
      const totalBudget = (raw.campaigns ?? []).reduce(
        (sum, c) => sum + (c.total_budget ?? 0),
        0,
      );
      return {
        ...(raw as StudioRow),
        email: profileRow?.email ?? '',
        campaignsCount: raw.campaigns?.length ?? 0,
        totalBudget,
      };
    });
    setStudios(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchStudios();
  }, [fetchStudios]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return studios;
    return studios.filter((s) => {
      const hay = `${s.name} ${s.description ?? ''} ${s.email}`.toLowerCase();
      return hay.includes(q);
    });
  }, [studios, search]);

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
      sidebarSections={getAdminSidebar('studios')}
      notificationCount={5}
    >
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ube-bright">
          Admin · Directory
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          Studios
        </h1>
        <p className="text-sm text-text-secondary mt-1">Registered game studios</p>
      </header>

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <span className="text-[11px] text-text-secondary tabular-nums">
          {studios.length} {studios.length === 1 ? 'studio' : 'studios'}
        </span>
        <div className="ml-auto w-full max-w-xs">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search studios"
            icon={<Search size={14} aria-hidden />}
          />
        </div>
      </div>

      <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-bg-card">
        <HeaderRow />
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-text-primary mb-1">
              {studios.length === 0
                ? 'No studios registered yet.'
                : 'No studios match your search.'}
            </p>
            <p className="text-xs text-text-secondary">
              {studios.length === 0
                ? 'Studios will appear here once they sign up.'
                : 'Try a different search query.'}
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
