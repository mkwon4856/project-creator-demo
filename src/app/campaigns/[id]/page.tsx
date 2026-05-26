import { CampaignDetailContent } from '@/components/campaign/CampaignDetailContent';

interface PageProps {
  params: Promise<{ id: string }>;
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
