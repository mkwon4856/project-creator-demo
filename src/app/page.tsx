import { LandingPage } from '@/app/_components/landing/LandingPage';
import { fetchLiveCampaigns } from '@/lib/api/campaigns.server';

export default async function HomePage() {
  const liveCampaigns = await fetchLiveCampaigns(6);

  return <LandingPage liveCampaigns={liveCampaigns} />;
}
