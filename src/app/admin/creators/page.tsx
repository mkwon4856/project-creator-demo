'use client';

import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { TopNav } from '@/components/layout/TopNav';
import { Badge, Card, Input, Pill, toast } from '@/components/ui';
import type { Grade, Creator, CreatorChannel } from '@/lib/db.types';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentProfile } from '@/lib/supabase/hooks';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const GRID = 'grid-cols-[1.6fr_0.6fr_0.9fr_0.7fr_0.9fr]';

// 등급 우선순위 (S가 최상)
const GRADE_ORDER: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E'];

type GradeFilter = 'all' | Grade;

const GRADE_FILTERS: { id: GradeFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  ...GRADE_ORDER.map((g) => ({ id: g as GradeFilter, label: `${g}티어` })),
];

interface CreatorWithChannels extends Creator {
  topGrade: Grade | null;
  totalSubscribers: number;
  channelCount: number;
}

function formatSubscribers(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return `${n}`;
}

function formatJoinedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function topGradeOf(channels: CreatorChannel[]): Grade | null {
  let best: Grade | null = null;
  for (const ch of channels) {
    if (best === null || GRADE_ORDER.indexOf(ch.grade) < GRADE_ORDER.indexOf(best)) {
      best = ch.grade;
    }
  }
  return best;
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
      className={`grid ${GRID} items-center gap-3 px-5 py-3 bg-bg-elevated text-xs font-medium text-text-secondary uppercase`}
    >
      <span>크리에이터</span>
      <span>등급</span>
      <span className="text-right">구독자</span>
      <span className="text-right">채널</span>
      <span>가입일</span>
    </div>
  );
}

function Row({ item, last }: { item: CreatorWithChannels; last: boolean }) {
  return (
    <div
      role="row"
      className={[
        `grid ${GRID} items-center gap-3 px-5 py-3 transition-colors duration-150 ease-out hover:bg-bg-hover`,
        last ? '' : 'border-b border-border',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 min-w-0">
        <CreatorAvatar name={item.name} />
        <span className="text-sm font-medium text-text-primary truncate">
          {item.name}
        </span>
      </div>

      <span>
        {item.topGrade ? (
          <Badge variant="primary" size="sm">
            {item.topGrade}
          </Badge>
        ) : (
          <span className="text-xs text-text-muted">미등록</span>
        )}
      </span>

      <span className="text-sm tabular-nums text-text-primary text-right">
        {item.channelCount > 0 ? formatSubscribers(item.totalSubscribers) : '—'}
      </span>

      <span className="text-sm tabular-nums text-text-secondary text-right">
        {item.channelCount}
      </span>

      <span className="text-xs text-text-secondary tabular-nums">
        {formatJoinedDate(item.created_at)}
      </span>
    </div>
  );
}

export default function AdminCreatorsPage() {
  const { loading: profileLoading } = useCurrentProfile();
  const [creators, setCreators] = useState<CreatorWithChannels[]>([]);
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
      .select('*, creator_channels(*)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(`크리에이터 조회 실패: ${error.message}`);
      setCreators([]);
      setLoading(false);
      return;
    }

    const rows: CreatorWithChannels[] = (data ?? []).map((c) => {
      const raw = c as unknown as Creator & { creator_channels: CreatorChannel[] | null };
      const channels = raw.creator_channels ?? [];
      return {
        ...(raw as Creator),
        topGrade: topGradeOf(channels),
        totalSubscribers: channels.reduce((s, ch) => s + (ch.subscribers ?? 0), 0),
        channelCount: channels.length,
      };
    });
    setCreators(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCreators();
  }, [fetchCreators]);

  const counts = useMemo(() => {
    const c: Record<GradeFilter, number> = {
      all: creators.length,
      S: 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
    };
    for (const r of creators) {
      if (r.topGrade) c[r.topGrade]++;
    }
    return c;
  }, [creators]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return creators.filter((c) => {
      if (gradeFilter !== 'all' && c.topGrade !== gradeFilter) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [creators, gradeFilter, search]);

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">불러오는 중…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <TopNav role="admin" />
      <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
          관리자 · 디렉터리
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          크리에이터
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          등록된 크리에이터 · 등급은 등록 채널 기준 최고 등급
        </p>
      </header>

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {GRADE_FILTERS.map((f) => (
            <Pill
              key={f.id}
              variant={gradeFilter === f.id ? 'active' : 'default'}
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
            </Pill>
          ))}
        </div>
        <div className="ml-auto w-full max-w-xs">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름으로 검색"
            icon={<Search size={14} aria-hidden />}
          />
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <HeaderRow />
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-text-primary mb-1">
              {creators.length === 0
                ? '크리에이터가 없습니다.'
                : '필터에 맞는 크리에이터가 없습니다.'}
            </p>
            <p className="text-xs text-text-secondary">
              {creators.length === 0
                ? '크리에이터가 가입하면 여기에 표시됩니다.'
                : '다른 등급이나 검색어를 시도해 보세요.'}
            </p>
          </div>
        ) : (
          filtered.map((item, i) => (
            <Row key={item.id} item={item} last={i === filtered.length - 1} />
          ))
        )}
      </Card>
      </div>
    </div>
  );
}
