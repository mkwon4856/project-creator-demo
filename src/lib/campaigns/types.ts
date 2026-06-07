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

const MISSION_RATE_MULTIPLIER: Record<MissionKind, number> = {
  longform: 1,
  live: 0.75,
  shortform: 0.6,
};

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
