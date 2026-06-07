'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { PageHeader, WorkspaceLayout } from '@/components/layout';
import { ProfileCompletion } from '@/components/creator/ProfileCompletion';
import {
  WelcomeModal,
  WELCOME_SEEN_KEY,
} from '@/components/onboarding/WelcomeModal';
import { Button, StatCard } from '@/components/ui';
import type { Database } from '@/lib/db.types';
import { CURRENT_CREATOR, type Creator, type CreatorGrade } from '@/lib/mockCreators';
import { useCurrentCreator } from '@/lib/supabase/hooks';

import { ActivityTable } from './_components/ActivityTable';
import { CreatorProfileBar } from './_components/CreatorProfileBar';
import { formatEarningsMoney, useEarningsStats } from './_components/EarningsOverview';
import { RecommendedCampaigns } from './_components/RecommendedCampaigns';
import { getCreatorSidebar } from './_config/sidebar';

type CreatorRow = Database['public']['Tables']['creators']['Row'];

function rowToCreator(row: CreatorRow): Creator {
  const grade = (['A', 'B', 'C', 'D', 'E'] as const).includes(
    row.grade as CreatorGrade,
  )
    ? (row.grade as CreatorGrade)
    : 'E';
  return {
    id: row.id,
    name: row.display_name,
    handle: row.handle,
    grade,
    emoji: '🐒',
    subscribers: row.subscribers ?? 0,
    avgViews: row.avg_views ?? 0,
    rating: Number(row.rating ?? 0),
    completedCampaigns: row.completed_campaigns ?? 0,
    isVerified: row.is_verified ?? false,
    bio: row.bio ?? '',
  };
}

function countConnectedPlatforms(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  let count = 0;
  for (const item of raw) {
    if (item && typeof item === 'object') {
      const url = (item as { url?: unknown }).url;
      if (typeof url === 'string' && url.trim().length > 0) count += 1;
    }
  }
  return count;
}

function SectionTitle({
  title,
  href,
  cta = '전체 보기',
}: {
  title: string;
  href?: string;
  cta?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="text-lg font-semibold text-text-primary leading-tight">{title}</h2>
      {href && (
        <Link href={href}>
          <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} iconPosition="right">
            {cta}
          </Button>
        </Link>
      )}
    </div>
  );
}

function CreatorDashboardStats() {
  const { stats, inProgressCount } = useEarningsStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      <StatCard
        label="진행 중 활동"
        value={String(inProgressCount)}
        sub="제작 중인 캠페인"
      />
      <StatCard
        label="검수 대기"
        value={String(stats.reviewCount)}
        sub={stats.reviewCount > 0 ? '검토 대기 중' : '대기 항목 없음'}
      />
      <StatCard
        label="이번 달 수익"
        value={formatEarningsMoney(stats.thisMonth)}
        sub={`${stats.thisMonthPaidCount}건 지급`}
      />
      <StatCard
        label="누적 수익"
        value={formatEarningsMoney(stats.allTime)}
        sub={`${stats.paidCount}건 완료`}
      />
    </div>
  );
}

export default function CreatorWorkspacePage() {
  const { data: row, loading } = useCurrentCreator();
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

  const connectedPlatforms = useMemo(
    () => countConnectedPlatforms(row?.platforms),
    [row?.platforms],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">불러오는 중…</span>
      </div>
    );
  }

  const creator: Creator = row ? rowToCreator(row) : CURRENT_CREATOR;

  return (
    <WorkspaceLayout
      persona="creator"
      userName={creator.name}
      userAvatar={creator.emoji}
      userBadge={`${creator.grade}티어`}
      sidebarSections={getCreatorSidebar('browse')}
      notificationCount={3}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-10">
        <PageHeader title="대시보드" />

        <CreatorProfileBar creator={creator} />

        {row && (
          <ProfileCompletion
            displayName={row.display_name}
            handle={row.handle}
            bio={row.bio ?? ''}
            connectedPlatforms={connectedPlatforms}
            subscribers={row.subscribers ?? 0}
          />
        )}

        <CreatorDashboardStats />

        <section>
          <SectionTitle title="추천 캠페인" href="/creator" />
          <RecommendedCampaigns />
        </section>

        <section>
          <SectionTitle title="최근 활동" href="/creator/activity" />
          <ActivityTable limit={5} />
        </section>
      </div>

      <WelcomeModal
        open={showWelcome}
        role="creator"
        userName={creator.name}
        onClose={closeWelcome}
      />
    </WorkspaceLayout>
  );
}
