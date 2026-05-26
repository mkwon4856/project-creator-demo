'use client';

import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { CURRENT_CREATOR, type Creator, type CreatorGrade } from '@/lib/mockCreators';
import { useCurrentCreator } from '@/lib/supabase/hooks';
import type { Database } from '@/lib/db.types';

import { ActivityTable } from './_components/ActivityTable';
import { CreatorProfileBar } from './_components/CreatorProfileBar';
import { EarningsOverview } from './_components/EarningsOverview';
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

function SectionHeader({
  title,
  href,
  cta = 'See all',
}: {
  title: string;
  href?: string;
  cta?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <h2 className="text-base font-medium text-text-primary leading-tight">{title}</h2>
      {href && (
        <a
          href={href}
          className="inline-flex items-center gap-1 text-xs text-ube-bright hover:text-white transition-colors duration-150 ease-out"
        >
          {cta}
          <ArrowRight size={12} aria-hidden />
        </a>
      )}
    </div>
  );
}

export default function CreatorWorkspacePage() {
  const { data: row, loading } = useCurrentCreator();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">Loading…</span>
      </div>
    );
  }

  const creator: Creator = row ? rowToCreator(row) : CURRENT_CREATOR;

  return (
    <WorkspaceLayout
      persona="creator"
      userName={creator.name}
      userAvatar={creator.emoji}
      userBadge={`${creator.grade}-tier`}
      sidebarSections={getCreatorSidebar('browse')}
      notificationCount={3}
    >
      <CreatorProfileBar creator={creator} />

      <section className="mb-9">
        <SectionHeader title="Earnings overview" href="/creator/earnings" />
        <EarningsOverview />
      </section>

      <section className="mb-9">
        <SectionHeader title="Recommended for you" href="/creator/discover" />
        <RecommendedCampaigns />
      </section>

      <section className="mb-9">
        <SectionHeader title="My activity" href="/creator/activity" />
        <ActivityTable />
      </section>
    </WorkspaceLayout>
  );
}
