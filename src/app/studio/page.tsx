'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { fetchMyCampaigns, transformDbCampaign } from '@/lib/api/campaigns';
import { CAMPAIGNS as MOCK_CAMPAIGNS, type Campaign } from '@/lib/mockCampaigns';
import { useCurrentStudio } from '@/lib/supabase/hooks';

import { CampaignCard } from './_components/CampaignCard';
import { CampaignToolbar, type StatusFilter } from './_components/CampaignToolbar';
import { getStudioSidebar } from './_config/sidebar';

export default function StudioMyCampaignsPage() {
  const router = useRouter();
  const { data: studio, loading } = useCurrentStudio();
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (loading || !studio) return;
    let cancelled = false;
    void fetchMyCampaigns(studio.id).then((rows) => {
      if (cancelled) return;
      if (rows.length > 0) setCampaigns(rows.map(transformDbCampaign));
    });
    return () => {
      cancelled = true;
    };
  }, [loading, studio]);

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
        <span className="text-text-secondary text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <WorkspaceLayout
      persona="studio"
      userName={studio?.name ?? 'Pulse Games'}
      userAvatar="🎮"
      userBadge="Studio"
      sidebarSections={getStudioSidebar('my-campaigns')}
      notificationCount={3}
    >
      <div className="flex flex-col gap-6">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ube-bright">
              Studio · My campaigns
            </span>
            <h1 className="text-[22px] font-medium leading-tight text-text-primary">
              Your campaigns
            </h1>
            <p className="text-sm text-text-secondary">
              Manage your own campaigns and review applicants.
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

        <CampaignToolbar
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
        />

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 px-6 py-16 text-center text-sm text-text-secondary">
            No campaigns match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} onClick={handleCardClick} />
            ))}
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
