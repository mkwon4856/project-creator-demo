'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type Campaign } from '@/lib/campaigns/types';
import { CURRENT_CREATOR } from '@/lib/mockCreators';

export type ActivityStatus = 'making' | 'review' | 'paid' | 'rejected';
export type ActivityMission = 'shortform' | 'longform' | 'live';

export interface UserActivity {
  id: string;
  campaignId: string;
  campaignName: string;
  developer: string;
  thumbnail: { from: string; to: string; emoji: string };
  mission: ActivityMission;
  status: ActivityStatus;
  /** in won */
  reward: number;
  submittedUrl?: string;
  appliedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  /** Auto-generated title shown in tables/feeds. */
  title: string;
}

export interface ReviewItem {
  activityId: string;
  campaignId: string;
  campaignName: string;
  developer: string;
  thumbnail: { from: string; to: string; emoji: string };
  creatorName: string;
  creatorEmoji: string;
  creatorGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  mission: ActivityMission;
  submittedAgo: string;
  /** in won */
  reward: number;
  submittedUrl: string;
}

interface AppState {
  activities: UserActivity[];
  reviewQueue: ReviewItem[];
  /**
   * Apply to a campaign. Caller provides the full Campaign object so this
   * action works for both mock-seeded and DB-backed campaigns (the store
   * itself stays decoupled from the data source).
   */
  applyToCampaign: (campaign: Campaign, mission: ActivityMission) => UserActivity | null;
  submitUrl: (activityId: string, url: string) => void;
  approveContent: (activityId: string) => void;
  rejectContent: (activityId: string) => void;
  /** Reset to seeded demo data (3 activities + 4 review-queue items). */
  resetDemo: () => void;
  /** Clear everything to a pristine empty state. */
  clearDemo: () => void;
}

const seedActivities: UserActivity[] = [
  {
    id: 'act-001',
    campaignId: 'camp-001',
    campaignName: '로스트 소드',
    developer: '위메이드커넥트',
    thumbnail: { from: '#1a0a3e', to: '#4a1a6e', emoji: '⚔️' },
    mission: 'shortform',
    status: 'paid',
    reward: 500_000,
    appliedAt: '2026-04-08',
    submittedAt: '2026-04-11',
    approvedAt: '2026-04-12',
    title: '로스트 소드 첫인상 쇼츠',
  },
  {
    id: 'act-002',
    campaignId: 'camp-002',
    campaignName: '갓앤데몬',
    developer: '컴투스',
    thumbnail: { from: '#3a0a0a', to: '#7a1a1a', emoji: '⚡' },
    mission: 'longform',
    status: 'paid',
    reward: 2_000_000,
    appliedAt: '2026-05-09',
    submittedAt: '2026-05-13',
    approvedAt: '2026-05-14',
    title: '갓앤데몬 풀 가이드',
  },
  {
    id: 'act-003',
    campaignId: 'camp-001',
    campaignName: '로스트 소드',
    developer: '위메이드커넥트',
    thumbnail: { from: '#1a0a3e', to: '#4a1a6e', emoji: '⚔️' },
    mission: 'longform',
    status: 'review',
    reward: 700_000,
    appliedAt: '2026-05-13',
    submittedAt: '2026-05-15',
    submittedUrl: 'https://youtube.com/watch?v=demo',
    title: '인디 유튜버가 빠진 함정',
  },
];

const seedReviewQueue: ReviewItem[] = [
  {
    activityId: 'rv-001',
    campaignId: 'camp-001',
    campaignName: '로스트 소드',
    developer: '위메이드커넥트',
    thumbnail: { from: '#1a0a3e', to: '#4a1a6e', emoji: '⚔️' },
    creatorName: '몽키매직',
    creatorEmoji: '🐒',
    creatorGrade: 'B',
    mission: 'longform',
    submittedAgo: '2시간 전',
    reward: 3_000_000,
    submittedUrl: 'https://youtube.com/watch?v=rv1',
  },
  {
    activityId: 'rv-002',
    campaignId: 'camp-002',
    campaignName: '갓앤데몬',
    developer: '컴투스',
    thumbnail: { from: '#3a0a0a', to: '#7a1a1a', emoji: '⚡' },
    creatorName: '강퀴',
    creatorEmoji: '⚡',
    creatorGrade: 'B',
    mission: 'shortform',
    submittedAgo: '4시간 전',
    reward: 500_000,
    submittedUrl: 'https://youtube.com/watch?v=rv2',
  },
  {
    activityId: 'rv-003',
    campaignId: 'camp-003',
    campaignName: '운빨존많겜',
    developer: '111퍼센트',
    thumbnail: { from: '#0a2a3a', to: '#1a5a7a', emoji: '🎲' },
    creatorName: '쫀쫀',
    creatorEmoji: '✨',
    creatorGrade: 'B',
    mission: 'live',
    submittedAgo: '7시간 전',
    reward: 1_500_000,
    submittedUrl: 'https://chzzk.naver.com/demo',
  },
  {
    activityId: 'rv-004',
    campaignId: 'camp-004',
    campaignName: '딸깍삼국',
    developer: '반지하게임즈',
    thumbnail: { from: '#3a1a0a', to: '#6a3a1a', emoji: '🐉' },
    creatorName: '발젭',
    creatorEmoji: '🗺️',
    creatorGrade: 'B',
    mission: 'longform',
    submittedAgo: '1일 전',
    reward: 4_000_000,
    submittedUrl: 'https://youtube.com/watch?v=rv4',
  },
];

function nextActivityId(activities: UserActivity[]): string {
  let max = seedActivities.length;
  for (const a of activities) {
    const m = /^act-(\d+)$/.exec(a.id);
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return `act-${String(max + 1).padStart(3, '0')}`;
}

const MISSION_TITLE_PREFIX: Record<ActivityMission, string> = {
  shortform: '쇼츠',
  longform: '롱폼 리뷰',
  live: '라이브 방송',
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activities: [],
      reviewQueue: [],

      applyToCampaign: (campaign, mission) => {
        const grade = CURRENT_CREATOR.grade;
        const rate = campaign.rates[grade];
        if (rate <= 0) return null;

        let created: UserActivity | null = null;
        set((state) => {
          const activity: UserActivity = {
            id: nextActivityId(state.activities),
            campaignId: campaign.id,
            campaignName: campaign.name,
            developer: campaign.developer,
            thumbnail: campaign.thumbnail,
            mission,
            status: 'making',
            reward: rate * 10_000,
            appliedAt: todayISO(),
            title: `${campaign.name} ${MISSION_TITLE_PREFIX[mission]}`,
          };
          created = activity;
          return { activities: [activity, ...state.activities] };
        });
        return created;
      },

      submitUrl: (activityId, url) => {
        set((state) => {
          const activity = state.activities.find((a) => a.id === activityId);
          if (!activity) return state;

          const updatedActivities = state.activities.map((a) =>
            a.id === activityId
              ? {
                  ...a,
                  status: 'review' as const,
                  submittedUrl: url,
                  submittedAt: todayISO(),
                }
              : a,
          );

          const newReviewItem: ReviewItem = {
            activityId,
            campaignId: activity.campaignId,
            campaignName: activity.campaignName,
            developer: activity.developer,
            thumbnail: activity.thumbnail,
            creatorName: CURRENT_CREATOR.name,
            creatorEmoji: CURRENT_CREATOR.emoji,
            creatorGrade: CURRENT_CREATOR.grade,
            mission: activity.mission,
            submittedAgo: '방금 전',
            reward: activity.reward,
            submittedUrl: url,
          };

          return {
            activities: updatedActivities,
            reviewQueue: [newReviewItem, ...state.reviewQueue],
          };
        });
      },

      approveContent: (activityId) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === activityId
              ? { ...a, status: 'paid', approvedAt: todayISO() }
              : a,
          ),
          reviewQueue: state.reviewQueue.filter(
            (r) => r.activityId !== activityId,
          ),
        }));
      },

      rejectContent: (activityId) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === activityId ? { ...a, status: 'rejected' } : a,
          ),
          reviewQueue: state.reviewQueue.filter(
            (r) => r.activityId !== activityId,
          ),
        }));
      },

      resetDemo: () => {
        set({
          activities: seedActivities.map((a) => ({ ...a })),
          reviewQueue: seedReviewQueue.map((r) => ({ ...r })),
        });
      },

      clearDemo: () => {
        set({ activities: [], reviewQueue: [] });
      },
    }),
    {
      name: 'project-creator-demo-store',
      version: 1,
      // Only persist data — actions/functions are recreated on every load.
      partialize: (state) => ({
        activities: state.activities,
        reviewQueue: state.reviewQueue,
      }),
    },
  ),
);

// ---- Selectors / computed helpers ----

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface EarningsSummary {
  thisMonth: number;
  pending: number;
  allTime: number;
  avg: number;
  thisMonthPaidCount: number;
  thisMonthReviewCount: number;
  paidCount: number;
}

export function computeEarnings(activities: UserActivity[]): EarningsSummary {
  const now = Date.now();
  const thirtyAgo = now - 30 * MS_PER_DAY;

  let thisMonth = 0;
  let pending = 0;
  let allTime = 0;
  let thisMonthPaidCount = 0;
  let thisMonthReviewCount = 0;
  let paidCount = 0;

  for (const a of activities) {
    if (a.status === 'paid') {
      paidCount += 1;
      allTime += a.reward;
      const ts = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
      if (ts >= thirtyAgo) {
        thisMonth += a.reward;
        thisMonthPaidCount += 1;
      }
    } else if (a.status === 'review') {
      pending += a.reward;
      const ts = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      if (ts >= thirtyAgo) thisMonthReviewCount += 1;
    }
  }

  const avg = paidCount > 0 ? Math.round(allTime / paidCount) : 0;

  return {
    thisMonth,
    pending,
    allTime,
    avg,
    thisMonthPaidCount,
    thisMonthReviewCount,
    paidCount,
  };
}
