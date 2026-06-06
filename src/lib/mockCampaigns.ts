// Studio workspace mock data — independent from src/lib/mockData.ts so it can
// evolve separately as the studio routes mature.

export type CampaignStatus = 'live' | 'recruiting' | 'completed';
export type CampaignPlatform = 'mobile' | 'pc' | 'console';

export interface CampaignThumbnail {
  from: string;
  to: string;
  emoji: string;
  imageUrl?: string;
  type?: 'url' | 'gradient';
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
    name: '리그 오브 레전드 신규 시즌 크리에이터 모집',
    developer: '라이엇 게임즈',
    genre: '5v5 MOBA · e스포츠',
    status: 'live',
    thumbnail: { from: '#0a1428', to: '#c89b3c', emoji: '⚔️', imageUrl: '/games/lol.jpg', type: 'url' },
    totalBudget: 30_000_000,
    spentBudget: 18_500_000,
    target: 40,
    joined: 36,
    rates: { A: 90, B: 55, C: 28, D: 12, E: 6 },
    missions: { shortform: true, longform: true, live: true },
    platform: ['pc'],
  },
  {
    id: 'camp-002',
    name: '발로란트 신규 에피소드 하이라이트 챌린지',
    developer: '라이엇 게임즈',
    genre: '택티컬 5v5 FPS',
    status: 'live',
    thumbnail: { from: '#0f1923', to: '#ff4655', emoji: '🎯', imageUrl: '/games/valorant.jpg', type: 'url' },
    totalBudget: 22_000_000,
    spentBudget: 9_800_000,
    target: 35,
    joined: 19,
    rates: { A: 80, B: 48, C: 24, D: 10, E: 5 },
    missions: { shortform: true, longform: false, live: true },
    platform: ['pc'],
  },
  {
    id: 'camp-003',
    name: '배틀그라운드 치킨각 클립 캠페인',
    developer: '크래프톤',
    genre: '배틀로얄 슈터',
    status: 'live',
    thumbnail: { from: '#2b2b2b', to: '#f2a900', emoji: '🪂', imageUrl: '/games/pubg.jpg', type: 'url' },
    totalBudget: 18_000_000,
    spentBudget: 16_800_000,
    target: 30,
    joined: 22,
    rates: { A: 75, B: 45, C: 22, D: 9, E: 4 },
    missions: { shortform: true, longform: true, live: true },
    platform: ['pc', 'console'],
  },
  {
    id: 'camp-004',
    name: '서든어택 시즌 클랜전 크리에이터 모집',
    developer: '넥슨',
    genre: 'FPS · 클랜 대전',
    status: 'recruiting',
    isNew: true,
    thumbnail: { from: '#161616', to: '#5a6a2a', emoji: '🔫', imageUrl: '/games/suddenattack.jpg', type: 'url' },
    totalBudget: 9_000_000,
    spentBudget: 700_000,
    target: 20,
    joined: 4,
    rates: { A: 45, B: 30, C: 15, D: 7, E: 3 },
    missions: { shortform: true, longform: false, live: false },
    platform: ['pc'],
  },
  {
    id: 'camp-005',
    name: 'FC 온라인 신규 시즌 골 모음 캠페인',
    developer: '넥슨',
    genre: '축구 스포츠',
    status: 'live',
    thumbnail: { from: '#0a3a1a', to: '#1a8a3a', emoji: '⚽', imageUrl: '/games/fconline.jpg', type: 'url' },
    totalBudget: 14_000_000,
    spentBudget: 6_100_000,
    target: 28,
    joined: 15,
    rates: { A: 65, B: 38, C: 18, D: 8, E: 4 },
    missions: { shortform: true, longform: true, live: false },
    platform: ['pc'],
  },
  {
    id: 'camp-006',
    name: '로스트아크 신규 군단장 레이드 공략 캠페인',
    developer: '스마일게이트RPG',
    genre: '핵앤슬래시 MMORPG',
    status: 'recruiting',
    isNew: false,
    thumbnail: { from: '#0a2a2a', to: '#c8a44a', emoji: '🛡️', imageUrl: '/games/lostark.jpg', type: 'url' },
    totalBudget: 25_000_000,
    spentBudget: 3_200_000,
    target: 32,
    joined: 7,
    rates: { A: 85, B: 50, C: 25, D: 11, E: 5 },
    missions: { shortform: true, longform: true, live: true },
    platform: ['pc'],
  },
  {
    id: 'camp-007',
    name: '메이플스토리 신규 직업 육성 챌린지',
    developer: '넥슨',
    genre: '2D 횡스크롤 MMORPG',
    status: 'live',
    thumbnail: { from: '#e87a00', to: '#ffd24a', emoji: '🍄', imageUrl: '/games/maplestory.jpg', type: 'url' },
    totalBudget: 11_000_000,
    spentBudget: 8_700_000,
    target: 24,
    joined: 21,
    rates: { A: 55, B: 32, C: 16, D: 7, E: 3 },
    missions: { shortform: true, longform: true, live: false },
    platform: ['pc'],
  },
  {
    id: 'camp-008',
    name: '던전앤파이터 신규 에픽 던전 캠페인',
    developer: '넥슨',
    genre: '벨트스크롤 액션 RPG',
    status: 'completed',
    thumbnail: { from: '#2a0a0a', to: '#8a1a1a', emoji: '👊', imageUrl: '/games/dnf.jpg', type: 'url' },
    totalBudget: 16_000_000,
    spentBudget: 16_000_000,
    target: 30,
    joined: 30,
    rates: { A: 70, B: 42, C: 20, D: 9, E: 4 },
    missions: { shortform: true, longform: true, live: true },
    platform: ['pc'],
  },
  {
    id: 'camp-009',
    name: '오버워치 2 신규 영웅 플레이 캠페인',
    developer: '블리자드 엔터테인먼트',
    genre: '히어로 슈터 FPS',
    status: 'recruiting',
    isNew: true,
    thumbnail: { from: '#1a3a5a', to: '#f99e1a', emoji: '🦸', imageUrl: '/games/overwatch2.jpg', type: 'url' },
    totalBudget: 20_000_000,
    spentBudget: 1_400_000,
    target: 30,
    joined: 5,
    rates: { A: 78, B: 46, C: 23, D: 10, E: 5 },
    missions: { shortform: true, longform: false, live: true },
    platform: ['pc', 'console'],
  },
  {
    id: 'camp-010',
    name: '디아블로 IV 신규 시즌 빌드 공략 캠페인',
    developer: '블리자드 엔터테인먼트',
    genre: '핵앤슬래시 액션 RPG',
    status: 'live',
    thumbnail: { from: '#1a0a0a', to: '#6a0a0a', emoji: '🔥', imageUrl: '/games/diablo4.jpg', type: 'url' },
    totalBudget: 24_000_000,
    spentBudget: 13_600_000,
    target: 34,
    joined: 21,
    rates: { A: 88, B: 52, C: 26, D: 11, E: 6 },
    missions: { shortform: true, longform: true, live: true },
    platform: ['pc', 'console'],
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

export type MissionKind = 'shortform' | 'longform' | 'live';

// Tier `rates` are treated as the longform base. Live and shortform pay less.
const MISSION_RATE_MULTIPLIER: Record<MissionKind, number> = {
  longform: 1,
  live: 0.75,
  shortform: 0.6,
};

/**
 * Convert a tier base rate (만원, treated as the longform rate) into the
 * per-mission rate, rounded to whole 만원. Display-only — does not mutate data.
 */
export function getMissionRate(baseRate: number, mission: MissionKind): number {
  return Math.round(baseRate * MISSION_RATE_MULTIPLIER[mission]);
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
  live: '진행중',
  recruiting: '모집중',
  completed: '완료',
};

export const PLATFORM_ICONS: Record<CampaignPlatform, string> = {
  mobile: '📱',
  pc: '🖥️',
  console: '🎮',
};
