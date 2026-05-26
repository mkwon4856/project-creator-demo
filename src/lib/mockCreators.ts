export type CreatorGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Creator {
  id: string;
  name: string;
  handle: string;
  grade: CreatorGrade;
  emoji: string;
  subscribers: number;
  avgViews: number;
  rating: number;
  completedCampaigns: number;
  isVerified: boolean;
  bio: string;
}

export const CURRENT_CREATOR: Creator = {
  id: 'cr-006',
  name: '몽키매직',
  handle: '@monkeymagic_game',
  grade: 'B',
  emoji: '🐒',
  subscribers: 310_000,
  avgViews: 72_000,
  rating: 4.6,
  completedCampaigns: 28,
  isVerified: true,
  bio: '31만 구독자. 인디·캐주얼 게임 특화. 중소 게임사 협업 경험 풍부.',
};

export function formatSubscribers(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(n >= 100_000 ? 0 : 1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
