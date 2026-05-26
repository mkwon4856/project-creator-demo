export type ActivityMission = 'shortform' | 'longform' | 'live';
export type ActivityStatus = 'making' | 'review' | 'paid' | 'rejected';

export interface ActivityThumbnail {
  from: string;
  to: string;
  emoji: string;
}

export interface Activity {
  id: string;
  campaignId: string;
  campaignName: string;
  developer: string;
  thumbnail: ActivityThumbnail;
  mission: ActivityMission;
  submittedDate: string;
  status: ActivityStatus;
  reward: number;
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'act-001',
    campaignId: 'camp-001',
    campaignName: '로스트 소드 첫인상 쇼츠',
    developer: '위메이드커넥트',
    thumbnail: { from: '#1a0a3e', to: '#4a1a6e', emoji: '⚔️' },
    mission: 'shortform',
    submittedDate: '2026-05-11',
    status: 'paid',
    reward: 500_000,
  },
  {
    id: 'act-002',
    campaignId: 'camp-002',
    campaignName: '갓앤데몬 풀 가이드',
    developer: '컴투스',
    thumbnail: { from: '#0a1a3e', to: '#1a3a7e', emoji: '⚡' },
    mission: 'longform',
    submittedDate: '2026-05-13',
    status: 'paid',
    reward: 3_000_000,
  },
  {
    id: 'act-003',
    campaignId: 'camp-001',
    campaignName: '인디 유튜버가 빠진 함정',
    developer: '위메이드커넥트',
    thumbnail: { from: '#1a0a3e', to: '#4a1a6e', emoji: '⚔️' },
    mission: 'longform',
    submittedDate: '2026-05-15',
    status: 'review',
    reward: 3_000_000,
  },
];

export const STATUS_LABELS: Record<ActivityStatus, string> = {
  making: 'Making',
  review: 'In review',
  paid: 'Paid',
  rejected: 'Rejected',
};

export const MISSION_LABELS: Record<ActivityMission, string> = {
  shortform: 'Shortform',
  longform: 'Longform',
  live: 'Live',
};
