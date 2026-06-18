import { fetchAllActiveCampaigns } from '@/lib/api/campaigns.server';

import { CampaignExplore } from './_components/CampaignExplore';

// 게임사 전용 전체 캠페인 둘러보기. 서버에서 활성 캠페인을 받아 클라이언트에서 정렬.
export default async function StudioCampaignsPage() {
  const { campaigns, total } = await fetchAllActiveCampaigns();
  return <CampaignExplore campaigns={campaigns} total={total} />;
}
