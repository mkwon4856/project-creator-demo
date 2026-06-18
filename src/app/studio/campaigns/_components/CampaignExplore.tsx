'use client';

import { useMemo, useState } from 'react';

import { CampaignPreviewCard } from '@/components/campaign/CampaignPreviewCard';
import { TopNav } from '@/components/layout/TopNav';
import type { ExploreCampaign } from '@/lib/api/campaigns.server';

interface Props {
  campaigns: ExploreCampaign[];
  total: number;
}

type SortKey = 'popular' | 'recent' | 'deadline';

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'popular', label: '참여 많은 순' },
  { id: 'recent', label: '최신순' },
  { id: 'deadline', label: '마감 임박순' },
];

// Supabase nested(to-one) 관계는 객체 또는 배열로 올 수 있어 안전하게 단일화.
function studioName(c: ExploreCampaign): string | null {
  const s = c.studios;
  if (!s) return null;
  return Array.isArray(s) ? (s[0]?.company_name ?? null) : s.company_name;
}

function participantCount(c: ExploreCampaign): number {
  return c.applications?.[0]?.count ?? 0;
}

function deadlineValue(c: ExploreCampaign): number {
  // 마감일 없는(상시 모집) 캠페인은 가장 뒤로
  return c.deadline ? new Date(`${c.deadline}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
}

export function CampaignExplore({ campaigns, total }: Props) {
  const [sort, setSort] = useState<SortKey>('popular');

  const sorted = useMemo(() => {
    const arr = campaigns.slice();
    switch (sort) {
      case 'popular':
        return arr.sort((a, b) => participantCount(b) - participantCount(a));
      case 'deadline':
        return arr.sort((a, b) => deadlineValue(a) - deadlineValue(b));
      case 'recent':
      default:
        return arr.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }
  }, [campaigns, sort]);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <TopNav role="studio" />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* 헤더 */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
              캠페인 둘러보기
            </h1>
            <p className="text-sm text-white/40 mt-1">
              지금 다른 게임사들은 이렇게 크리에이터 마케팅을 진행하고 있어요
            </p>
          </div>
          <div className="text-sm text-white/40">
            <span className="text-[#E5B567] font-bold">{total.toLocaleString()}</span>개 진행 중
          </div>
        </div>

        {/* 정렬 토글 */}
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                sort === s.id ? 'bg-[#9B7EC8] text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* 그리드 */}
        {sorted.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-12 text-center border border-dashed border-white/10">
            <p className="text-white/40 text-sm">진행 중인 캠페인이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((c) => (
              <CampaignPreviewCard
                key={c.id}
                campaign={c}
                explore
                studioName={studioName(c)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
