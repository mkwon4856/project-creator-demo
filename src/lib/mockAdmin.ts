export interface PlatformMetrics {
  gmv: number;
  gmvGrowthPercent: number;
  platformFee: number;
  feeGrowthPercent: number;
  activeCampaigns: number;
  campaignsGrowth: string;
  verifiedCreators: number;
  creatorsGrowth: string;
}

export const PLATFORM_METRICS: PlatformMetrics = {
  gmv: 33_500_000,
  gmvGrowthPercent: 24.8,
  platformFee: 5_025_000,
  feeGrowthPercent: 24.8,
  activeCampaigns: 12,
  campaignsGrowth: '+3 new this week',
  verifiedCreators: 847,
  creatorsGrowth: '+47 this week',
};

export interface GmvHistoryPoint {
  month: string;
  gmv: number;
  fee: number;
}

export const GMV_HISTORY: GmvHistoryPoint[] = [
  { month: 'Dec', gmv: 12_000_000, fee: 1_800_000 },
  { month: 'Jan', gmv: 14_500_000, fee: 2_175_000 },
  { month: 'Feb', gmv: 18_000_000, fee: 2_700_000 },
  { month: 'Mar', gmv: 22_500_000, fee: 3_375_000 },
  { month: 'Apr', gmv: 28_500_000, fee: 4_275_000 },
  { month: 'May', gmv: 33_500_000, fee: 5_025_000 },
];

export type CreatorTierKey = 'A' | 'B' | 'C' | 'D' | 'E';

export interface CreatorTierBucket {
  tier: CreatorTierKey;
  label: string;
  count: number;
  color: string;
}

export const CREATOR_TIERS: CreatorTierBucket[] = [
  { tier: 'A', label: '500K+', count: 68, color: '#4A3470' },
  { tier: 'B', label: '100K~', count: 186, color: '#7B5EA7' },
  { tier: 'C', label: '30K~', count: 296, color: '#9B7EC8' },
  { tier: 'D', label: '10K~', count: 212, color: '#C4A8D8' },
  { tier: 'E', label: '5K~', count: 85, color: '#E4D5F0' },
];

export type ReviewMission = 'shortform' | 'longform' | 'live';

export interface ReviewItem {
  id: string;
  campaignName: string;
  campaignDeveloper: string;
  campaignThumbnail: { from: string; to: string; emoji: string };
  creatorName: string;
  creatorEmoji: string;
  creatorGrade: CreatorTierKey;
  mission: ReviewMission;
  submittedAgo: string;
  reward: number;
}

export const REVIEW_QUEUE: ReviewItem[] = [
  {
    id: 'rv-001',
    campaignName: '로스트 소드',
    campaignDeveloper: '위메이드커넥트',
    campaignThumbnail: { from: '#1a0a3e', to: '#4a1a6e', emoji: '⚔️' },
    creatorName: '몽키매직',
    creatorEmoji: '🐒',
    creatorGrade: 'B',
    mission: 'longform',
    submittedAgo: '2h ago',
    reward: 3_000_000,
  },
  {
    id: 'rv-002',
    campaignName: '갓앤데몬',
    campaignDeveloper: '컴투스',
    campaignThumbnail: { from: '#0a1a3e', to: '#1a3a7e', emoji: '⚡' },
    creatorName: '강퀴',
    creatorEmoji: '⚡',
    creatorGrade: 'B',
    mission: 'shortform',
    submittedAgo: '4h ago',
    reward: 500_000,
  },
  {
    id: 'rv-003',
    campaignName: '운빨존많겜',
    campaignDeveloper: '111퍼센트',
    campaignThumbnail: { from: '#1a2a0a', to: '#3a5a1a', emoji: '🎲' },
    creatorName: '쫀쫀',
    creatorEmoji: '✨',
    creatorGrade: 'B',
    mission: 'live',
    submittedAgo: '7h ago',
    reward: 1_500_000,
  },
  {
    id: 'rv-004',
    campaignName: '딸깍삼국',
    campaignDeveloper: '반지하게임즈',
    campaignThumbnail: { from: '#2a1a0a', to: '#5a3a1a', emoji: '⚔️' },
    creatorName: '발젭',
    creatorEmoji: '🗺️',
    creatorGrade: 'B',
    mission: 'longform',
    submittedAgo: '1d ago',
    reward: 4_000_000,
  },
];

export const REVIEW_PENDING_COUNT = 8;

export const MISSION_LABELS: Record<ReviewMission, string> = {
  shortform: 'Shortform',
  longform: 'Longform',
  live: 'Live',
};

export function formatCompactKRW(amount: number): string {
  if (amount >= 100_000_000) return `₩${(amount / 100_000_000).toFixed(1)}억`;
  if (amount >= 1_000_000) return `₩${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 10_000) return `₩${(amount / 10_000).toFixed(0)}만`;
  return `₩${amount.toLocaleString()}`;
}
