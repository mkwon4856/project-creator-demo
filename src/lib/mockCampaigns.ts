// Studio workspace mock data — independent from src/lib/mockData.ts so it can
// evolve separately as the studio routes mature.

export type CampaignStatus = 'live' | 'recruiting' | 'completed';
export type CampaignPlatform = 'mobile' | 'pc' | 'console';

export interface CampaignThumbnail {
  from: string;
  to: string;
  emoji: string;
}

export interface CampaignRates {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
}

export interface CampaignMissions {
  shortform: boolean;
  longform: boolean;
  live: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  developer: string;
  genre: string;
  status: CampaignStatus;
  isNew?: boolean;
  thumbnail: CampaignThumbnail;
  /** in won */
  totalBudget: number;
  spentBudget: number;
  target: number;
  joined: number;
  /** unit: 만원 (10,000 won) */
  rates: CampaignRates;
  missions: CampaignMissions;
  platform: CampaignPlatform[];
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-001',
    name: '로스트 소드',
    developer: '위메이드커넥트',
    genre: '서브컬처 · 2D 액션 RPG',
    status: 'live',
    thumbnail: { from: '#1a0a3e', to: '#4a1a6e', emoji: '⚔️' },
    totalBudget: 4_000_000,
    spentBudget: 2_900_000,
    target: 20,
    joined: 9,
    rates: { A: 140, B: 70, C: 30, D: 10, E: 5 },
    missions: { shortform: true, longform: true, live: false },
    platform: ['mobile'],
  },
  {
    id: 'camp-002',
    name: '갓앤데몬',
    developer: '컴투스',
    genre: '방치형 수집 RPG',
    status: 'live',
    thumbnail: { from: '#3a0a0a', to: '#7a1a1a', emoji: '⚡' },
    totalBudget: 8_000_000,
    spentBudget: 3_300_000,
    target: 25,
    joined: 12,
    rates: { A: 200, B: 90, C: 40, D: 15, E: 7 },
    missions: { shortform: true, longform: true, live: true },
    platform: ['mobile'],
  },
  {
    id: 'camp-003',
    name: '운빨존많겜',
    developer: '111퍼센트',
    genre: '2인 랜덤 타워디펜스',
    status: 'live',
    thumbnail: { from: '#0a2a3a', to: '#1a5a7a', emoji: '🎲' },
    totalBudget: 3_000_000,
    spentBudget: 2_500_000,
    target: 18,
    joined: 14,
    rates: { A: 120, B: 60, C: 25, D: 9, E: 4 },
    missions: { shortform: true, longform: false, live: true },
    platform: ['mobile', 'pc'],
  },
  {
    id: 'camp-004',
    name: '딸깍삼국',
    developer: '반지하게임즈',
    genre: '캐주얼 전략',
    status: 'recruiting',
    isNew: true,
    thumbnail: { from: '#3a1a0a', to: '#6a3a1a', emoji: '🐉' },
    totalBudget: 1_500_000,
    spentBudget: 150_000,
    target: 12,
    joined: 2,
    rates: { A: 50, B: 25, C: 12, D: 5, E: 2 },
    missions: { shortform: true, longform: false, live: false },
    platform: ['mobile'],
  },
  {
    id: 'camp-005',
    name: '로드나인',
    developer: '스마일게이트RPG',
    genre: 'MMORPG',
    status: 'completed',
    thumbnail: { from: '#0a0a3a', to: '#2a2a7a', emoji: '🛡️' },
    totalBudget: 15_000_000,
    spentBudget: 15_000_000,
    target: 30,
    joined: 30,
    rates: { A: 400, B: 180, C: 80, D: 30, E: 12 },
    missions: { shortform: true, longform: true, live: true },
    platform: ['mobile', 'pc'],
  },
  {
    id: 'camp-006',
    name: '어비스리움',
    developer: '위메이드커넥트',
    genre: '힐링 방치 아쿠아리움',
    status: 'recruiting',
    isNew: true,
    thumbnail: { from: '#0a2a2a', to: '#1a5a5a', emoji: '🐟' },
    totalBudget: 2_000_000,
    spentBudget: 200_000,
    target: 15,
    joined: 3,
    rates: { A: 80, B: 35, C: 18, D: 8, E: 3 },
    missions: { shortform: true, longform: true, live: false },
    platform: ['mobile'],
  },
];

export function formatBudget(amount: number): string {
  if (amount >= 100_000_000) return `₩${(amount / 100_000_000).toFixed(1)}억`;
  if (amount >= 10_000) return `₩${(amount / 10_000).toFixed(0)}만`;
  return `₩${amount.toLocaleString()}`;
}

export function formatRate(manwon: number): string {
  if (manwon >= 100) return `₩${(manwon / 100).toFixed(1)}억`;
  return `₩${manwon}만`;
}

export function getSpentPercent(c: Campaign): number {
  if (c.totalBudget <= 0) return 0;
  return Math.min(100, Math.round((c.spentBudget / c.totalBudget) * 100));
}

export function getProgressTone(percent: number): 'ube' | 'amber' | 'red' {
  if (percent <= 50) return 'ube';
  if (percent <= 80) return 'amber';
  return 'red';
}

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  live: 'Live',
  recruiting: 'Recruiting',
  completed: 'Completed',
};

export const PLATFORM_ICONS: Record<CampaignPlatform, string> = {
  mobile: '📱',
  pc: '🖥️',
  console: '🎮',
};
