'use client';

import { Calendar } from 'lucide-react';

import { WorkspaceLayout } from '@/components/layout';
import { useCurrentProfile } from '@/lib/supabase/hooks';

import { ActivityFeed } from './_components/ActivityFeed';
import { GmvChart } from './_components/GmvChart';
import { HeroMetrics } from './_components/HeroMetrics';
import { ReviewQueue } from './_components/ReviewQueue';
import { TierDonut } from './_components/TierDonut';
import { getAdminSidebar } from './_config/sidebar';

export default function AdminOverviewPage() {
  const { data: profile, loading } = useCurrentProfile();

  if (loading) {
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
      sidebarSections={getAdminSidebar('overview')}
      notificationCount={5}
    >
      <header className="flex items-end justify-between gap-4 flex-wrap mb-7">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[22px] font-medium leading-tight text-text-primary">
            Platform overview
          </h1>
          <p className="text-sm text-text-secondary">
            Welcome back, {adminName}. Here&apos;s what&apos;s happening across the
            platform.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-card border border-white/10 text-xs text-text-secondary">
          <Calendar size={13} aria-hidden />
          <span>Last 30 days</span>
        </span>
      </header>

      <section className="mb-7">
        <HeroMetrics />
      </section>

      <section className="mb-7 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-w-0">
          <GmvChart />
        </div>
        <div className="min-w-0">
          <TierDonut />
        </div>
      </section>

      <section className="mb-7 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-w-0">
          <ReviewQueue />
        </div>
        <div className="min-w-0">
          <ActivityFeed />
        </div>
      </section>
    </WorkspaceLayout>
  );
}
