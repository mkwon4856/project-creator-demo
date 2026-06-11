'use client';



import { Plus } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { useEffect, useMemo, useState } from 'react';



import { PageHeader, WorkspaceLayout } from '@/components/layout';

import {

  WelcomeModal,

  WELCOME_SEEN_KEY,

} from '@/components/onboarding/WelcomeModal';

import { Button, Card, EmptyState, StatCard } from '@/components/ui';

import { formatCompactKRW } from '@/lib/formatCurrency';
import { fetchMyCampaigns, transformDbCampaign } from '@/lib/api/campaigns';
import type { Campaign } from '@/lib/campaigns/types';
import { useAppStore } from '@/lib/store';

import { useCurrentStudio } from '@/lib/supabase/hooks';



import { CampaignCard } from './_components/CampaignCard';

import { CampaignToolbar, type StatusFilter } from './_components/CampaignToolbar';

import { getStudioSidebar } from './_config/sidebar';



export default function StudioMyCampaignsPage() {

  const router = useRouter();

  const { data: studio, loading } = useCurrentStudio();

  const reviewQueue = useAppStore((s) => s.reviewQueue);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  const [status, setStatus] = useState<StatusFilter>('all');

  const [search, setSearch] = useState('');

  const [showWelcome, setShowWelcome] = useState(false);



  useEffect(() => {

    if (typeof window === 'undefined') return;

    if (!window.localStorage.getItem(WELCOME_SEEN_KEY)) {

      setShowWelcome(true);

    }

  }, []);

  useEffect(() => {
    if (!studio?.id) {
      setCampaigns([]);
      setCampaignsLoading(false);
      return;
    }
    let cancelled = false;
    setCampaignsLoading(true);
    void fetchMyCampaigns(studio.id).then((rows) => {
      if (cancelled) return;
      setCampaigns(rows.map(transformDbCampaign));
      setCampaignsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [studio?.id]);

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



  const stats = useMemo(() => {

    const live = campaigns.filter((c) => c.status === 'live');

    const recruiting = campaigns.filter((c) => c.status === 'recruiting');

    const newApplicants = recruiting.reduce((sum, c) => sum + c.joined, 0);

    const monthlySettlement = live.reduce((sum, c) => sum + c.spentBudget, 0);

    return {

      liveCount: live.length,

      newApplicants,

      reviewPending: reviewQueue.length,

      monthlySettlement,

    };

  }, [campaigns, reviewQueue.length]);



  const handleCardClick = (c: Campaign) => {

    router.push(`/campaigns/${c.id}`);

  };



  if (loading || campaignsLoading) {

    return (

      <div className="min-h-screen bg-bg-base flex items-center justify-center">

        <span className="text-text-secondary text-sm">불러오는 중…</span>

      </div>

    );

  }



  return (

    <WorkspaceLayout

      persona="studio"

      userName={studio?.company_name ?? '테스트 게임사 1'}

      userAvatar="🎮"

      userBadge="게임사"

      sidebarSections={getStudioSidebar('my-campaigns')}

      notificationCount={3}

    >

      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-10">

        <PageHeader

          title="대시보드"

          description="캠페인 현황을 한눈에 확인하고 지원자·검수를 관리하세요."

          actions={

            <Button

              variant="primary"

              size="md"

              icon={<Plus size={16} />}

              onClick={() => router.push('/studio/new')}

            >

              새 캠페인

            </Button>

          }

        />



        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">

          <StatCard

            label="진행 중 캠페인"

            value={String(stats.liveCount)}

            sub="live 상태"

          />

          <StatCard

            label="신규 지원자"

            value={String(stats.newApplicants)}

            sub="모집 중 캠페인"

          />

          <StatCard

            label="검수 대기"

            value={String(stats.reviewPending)}

            sub="제출 콘텐츠"

          />

          <StatCard

            label="이번 달 정산액"

            value={formatCompactKRW(stats.monthlySettlement)}

            sub="집행 예산 기준"

          />

        </div>



        <section>

          <h2 className="text-lg font-semibold text-text-primary mb-4">내 캠페인</h2>



          {campaigns.length > 0 && (

            <div className="mb-4">

              <CampaignToolbar

                status={status}

                onStatusChange={setStatus}

                search={search}

                onSearchChange={setSearch}

              />

            </div>

          )}



          {campaigns.length === 0 ? (

            <Card padding="none">

              <EmptyState

                title="아직 캠페인이 없습니다"

                description="첫 캠페인을 만들고 크리에이터들의 지원을 받아보세요. 평균 3일 안에 지원자가 모입니다."

                primaryAction={{ label: '캠페인 만들기', href: '/studio/new' }}

              />

            </Card>

          ) : filtered.length === 0 ? (

            <Card padding="lg" className="text-center">

              <p className="text-sm text-text-secondary">

                필터에 맞는 캠페인이 없습니다.

              </p>

            </Card>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

              {filtered.map((c) => (

                <CampaignCard key={c.id} campaign={c} onClick={handleCardClick} />

              ))}

            </div>

          )}

        </section>

      </div>



      <WelcomeModal

        open={showWelcome}

        role="studio"

        userName={studio?.company_name ?? '게임사'}

        onClose={closeWelcome}

      />

    </WorkspaceLayout>

  );

}

