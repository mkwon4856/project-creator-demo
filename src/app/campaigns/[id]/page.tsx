import type { Metadata } from 'next';

import { CampaignDetailContent } from '@/components/campaign/CampaignDetailContent';
import { fetchCampaignById } from '@/lib/api/campaigns.server';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, truncateText } from '@/lib/siteConfig';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchCampaignById(id);

  if (!data) {
    return {
      title: '캠페인을 찾을 수 없습니다',
      description: SITE_DESCRIPTION,
    };
  }

  const { campaign, brief } = data;
  const description =
    truncateText(brief, 100) ||
    `${campaign.developer} · ${campaign.genre} 캠페인 — ${SITE_NAME}`;

  return {
    title: campaign.name,
    description,
    openGraph: {
      title: campaign.name,
      description,
      type: 'website',
      url: `${SITE_URL}/campaigns/${id}`,
    },
  };
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-bg-base">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="rounded-xl border border-white/10 bg-bg-card overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          <CampaignDetailContent campaignId={id} variant="page" />
        </div>
      </div>
    </main>
  );
}
