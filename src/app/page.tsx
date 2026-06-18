import { LandingPage } from '@/app/_components/landing/LandingPage';
import { fetchActiveCampaigns } from '@/lib/api/campaigns.server';
import { fetchShowcaseCreators } from '@/lib/api/creators.server';

export default async function HomePage() {
  const [{ creators, total: creatorTotal }, { campaigns, total: campaignTotal }] =
    await Promise.all([fetchShowcaseCreators(12), fetchActiveCampaigns(6)]);

  return (
    <LandingPage
      creators={creators}
      creatorTotal={creatorTotal}
      campaigns={campaigns}
      campaignTotal={campaignTotal}
    />
  );
}
