'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Card } from '@/components/ui';
import { fetchCampaigns, transformDbCampaign } from '@/lib/api/campaigns';
import type { Campaign } from '@/lib/campaigns/types';

import { CampaignCard } from '../_components/CampaignCard';
import { CampaignToolbar, type StatusFilter } from '../_components/CampaignToolbar';
import { getStudioSidebar } from '../_config/sidebar';

export default function StudioExplorePage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    void fetchCampaigns().then((rows) => {
      if (cancelled) return;
      setCampaigns(rows.map(transformDbCampaign));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (status !== 'all' && c.status !== status) return false;
      if (q && !`${c.name} ${c.developer} ${c.genre}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [campaigns, status, search]);

  const handleCardClick = (c: Campaign) => {
    router.push(`/campaigns/${c.id}`);
  };

  return (
    <WorkspaceLayout
      persona="studio"
      userName="테스트 게임사 1"
      userAvatar="🎮"
      userBadge="게임사"
      sidebarSections={getStudioSidebar('explore')}
      notificationCount={3}
    >
      <div className="flex flex-col gap-6">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ube-bright">
              게임사 · 둘러보기
            </span>
            <h1 className="text-[22px] font-medium leading-tight text-text-primary">
              전체 캠페인 둘러보기
            </h1>
            <p className="text-sm text-text-secondary">
              다른 게임사들의 예산 집행 현황을 확인하고 경쟁력 있게 예산을 설정하세요.
            </p>
          </div>
        </header>

        <CampaignToolbar
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="게임사, 장르 검색…"
        />

        {loading ? (
          <Card padding="lg" className="text-center text-sm text-text-secondary">
            불러오는 중…
          </Card>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-6 py-16 text-center text-sm text-text-secondary">
            {campaigns.length === 0
              ? '등록된 캠페인이 없습니다.'
              : '필터에 맞는 캠페인이 없습니다.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                footer="private"
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
