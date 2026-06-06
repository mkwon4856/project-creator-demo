'use client';

import { Plus, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import {
  WelcomeModal,
  WELCOME_SEEN_KEY,
} from '@/components/onboarding/WelcomeModal';
import { Button, EmptyState } from '@/components/ui';
import { CAMPAIGNS as MOCK_CAMPAIGNS, type Campaign } from '@/lib/mockCampaigns';
import { useCurrentStudio } from '@/lib/supabase/hooks';

import { CampaignCard } from './_components/CampaignCard';
import { CampaignToolbar, type StatusFilter } from './_components/CampaignToolbar';
import { getStudioSidebar } from './_config/sidebar';

export default function StudioMyCampaignsPage() {
  const router = useRouter();
  const { data: studio, loading } = useCurrentStudio();
  // Demo: always render the local CAMPAIGNS mock. DB fetch is intentionally
  // disabled so edits to mockCampaigns.ts show up without stale DB rows.
  const [campaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem(WELCOME_SEEN_KEY)) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    }
    setShowWelcome(false);
  };

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

  if (loading) {
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
      sidebarSections={getStudioSidebar('my-campaigns')}
      notificationCount={3}
    >
      <div className="flex flex-col gap-6">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ube-bright">
              게임사 · 내 캠페인
            </span>
            <h1 className="text-[22px] font-medium leading-tight text-text-primary">
              내 캠페인
            </h1>
            <p className="text-sm text-text-secondary">
              직접 만든 캠페인을 관리하고 지원자를 검토하세요.
            </p>
          </div>
          <Button
            variant="launch"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => router.push('/studio/new')}
          >
            새 캠페인
          </Button>
        </header>

        {campaigns.length > 0 && (
          <CampaignToolbar
            status={status}
            onStatusChange={setStatus}
            search={search}
            onSearchChange={setSearch}
          />
        )}

        {campaigns.length === 0 ? (
          <EmptyState
            icon={<Rocket size={24} aria-hidden />}
            title="아직 캠페인이 없습니다"
            description="첫 캠페인을 만들고 크리에이터들의 지원을 받아보세요. 평균 3일 안에 지원자가 모입니다."
            primaryAction={{ label: '캠페인 만들기', href: '/studio/new' }}
            secondaryAction={{
              label: '다른 캠페인 둘러보기',
              href: '/studio/explore',
            }}
            tip="상세한 게임 소개와 가이드라인을 작성하면 더 좋은 콘텐츠를 받을 수 있어요."
          />
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-6 py-16 text-center text-sm text-text-secondary">
            필터에 맞는 캠페인이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} onClick={handleCardClick} />
            ))}
          </div>
        )}
      </div>

      <WelcomeModal
        open={showWelcome}
        role="studio"
        userName={studio?.name ?? '게임사'}
        onClose={closeWelcome}
      />
    </WorkspaceLayout>
  );
}
