/**
 * Project Creator demo seed data (UTF-8-safe: Korean enum values via \\u escapes).
 */
export type Tier = 'A' | 'B' | 'C' | 'D';

export type MissionType = 'short' | 'long' | 'live';

export const TIER_INFO: Record<Tier, { min: number; label: string }> = {
  A: { min: 300000, label: '300k+ subscribers' },
  B: { min: 100000, label: '100k+ subscribers' },
  C: { min: 50000, label: '50k+ subscribers' },
  D: { min: 10000, label: '10k+ subscribers' },
};

export const MISSION_RATES: Record<MissionType, Record<Tier, number>> = {
  short: { D: 50000, C: 100000, B: 150000, A: 300000 },
  long: { D: 250000, C: 450000, B: 700000, A: 1400000 },
  live: { D: 200000, C: 350000, B: 500000, A: 1000000 },
};

export const MISSION_LABELS: Record<MissionType, string> = {
  short: 'Short-form x1',
  long: 'Long-form x1 (8+ min)',
  live: 'Live stream (5+ hours)',
};

export type Game = {
  id: string;
  name: string;
  genre: string;
  publisher: string;
  publisherType: '\uC778\uB514' | '\uC911\uC18C' | '\uC911\uACAC';
  thumbnail: string;
  description: string;
};

export const GAMES: Game[] = [
  {
    id: 'neon-riders',
    name: 'Neon Riders',
    genre: 'Cyberpunk racing',
    publisher: 'Pulse Games',
    publisherType: '\uC778\uB514',
    thumbnail: '\u{1F3CE}\uFE0F',
    description: 'High-speed racing through a neon city in 2099',
  },
  {
    id: 'dungeon-bakery',
    name: 'Dungeon Bakery',
    genre: 'Management + roguelike',
    publisher: 'Crumb Studio',
    publisherType: '\uC911\uC18C',
    thumbnail: '\u{1F956}',
    description: 'Bake bread by day, conquer dungeons by night',
  },
  {
    id: 'overclock',
    name: 'Overclock',
    genre: '5v5 tactical shooter',
    publisher: 'Vortex Interactive',
    publisherType: '\uC911\uACAC',
    thumbnail: '\u{1F3AF}',
    description: 'A next-gen tactical FPS about reflexes and strategy',
  },
];

export type Creator = {
  id: string;
  nickname: string;
  tier: Tier;
  subscribers: number;
  platform: 'YouTube' | '\uCE58\uC9C0\uC9C1' | 'SOOP';
  avatar: string;
  specialty: string;
};

export const CREATORS: Creator[] = [
  { id: 'c1', nickname: 'RacingFinale', tier: 'A', subscribers: 520000, platform: 'YouTube', avatar: '\u{1F3C1}', specialty: 'Racing / Action' },
  { id: 'c2', nickname: 'GameKnowHo', tier: 'A', subscribers: 380000, platform: 'YouTube', avatar: '\u{1F3AE}', specialty: 'Reviews' },
  { id: 'c3', nickname: 'TacticMaster', tier: 'B', subscribers: 180000, platform: 'SOOP', avatar: '\u{1F3AF}', specialty: 'FPS / Strategy' },
  { id: 'c4', nickname: 'BreadSur', tier: 'B', subscribers: 120000, platform: '\uCE58\uC9C0\uC9C1', avatar: '\u{1F950}', specialty: 'Management sim' },
  { id: 'c5', nickname: 'DopamineRunner', tier: 'C', subscribers: 78000, platform: 'YouTube', avatar: '\u{26A1}', specialty: 'Indie' },
  { id: 'c6', nickname: 'LateNightPlay', tier: 'C', subscribers: 62000, platform: '\uCE58\uC9C0\uC9C1', avatar: '\u{1F319}', specialty: 'Live play' },
  { id: 'c7', nickname: 'PixelLover', tier: 'D', subscribers: 28000, platform: 'YouTube', avatar: '\u{1F47E}', specialty: 'Retro / Indie' },
  { id: 'c8', nickname: 'ClipSmith', tier: 'D', subscribers: 14000, platform: 'SOOP', avatar: '\u{2702}\uFE0F', specialty: 'Highlights' },
];

export type Campaign = {
  id: string;
  gameId: string;
  budget: number;
  status: 'open' | 'progress' | 'completed';
  targetCreators: number;
  joinedCreators: string[];
  createdAt: string;
};

export const SAMPLE_CAMPAIGN: Campaign = {
  id: 'camp-001',
  gameId: 'neon-riders',
  budget: 3000000,
  status: 'progress',
  targetCreators: 19,
  joinedCreators: ['c1', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'],
  createdAt: '2026-05-15',
};

export type Submission = {
  id: string;
  campaignId: string;
  creatorId: string;
  mission: MissionType;
  status: 'pending' | 'approved' | 'paid';
  url?: string;
  amount: number;
  submittedAt: string;
};

export const SUBMISSIONS: Submission[] = [
  { id: 's1', campaignId: 'camp-001', creatorId: 'c1', mission: 'long', status: 'paid', url: 'https://youtube.com/watch?v=demo1', amount: 1400000, submittedAt: '2026-05-12' },
  { id: 's2', campaignId: 'camp-001', creatorId: 'c3', mission: 'live', status: 'approved', url: 'https://sooplive.co.kr/demo2', amount: 500000, submittedAt: '2026-05-13' },
  { id: 's3', campaignId: 'camp-001', creatorId: 'c4', mission: 'short', status: 'paid', url: 'https://chzzk.naver.com/demo3', amount: 150000, submittedAt: '2026-05-13' },
  { id: 's4', campaignId: 'camp-001', creatorId: 'c5', mission: 'short', status: 'pending', url: 'https://youtube.com/watch?v=demo4', amount: 100000, submittedAt: '2026-05-14' },
  { id: 's5', campaignId: 'camp-001', creatorId: 'c7', mission: 'short', status: 'approved', url: 'https://youtube.com/watch?v=demo5', amount: 50000, submittedAt: '2026-05-14' },
];

export function formatKRW(amount: number): string {
  if (amount >= 100000000) return `\u20A9${(amount / 100000000).toFixed(1)}\uC5B5`;
  if (amount >= 10000) return `\u20A9${(amount / 10000).toFixed(0)}\uB9CC`;
  return `\u20A9${amount.toLocaleString()}`;
}

export function formatSubs(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(0)}\uB9CC`;
  return count.toLocaleString();
}
