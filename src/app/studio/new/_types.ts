import type {
  CampaignMissions,
  CampaignPlatform,
  CampaignRates,
  CampaignThumbnail,
} from '@/lib/mockCampaigns';

export type MissionId = keyof CampaignMissions;

export interface MissionConfig {
  enabled: boolean;
  rates: CampaignRates;
}

export interface ContentGuidelines {
  sponsorship: boolean;
  gameplay: boolean;
  noCompare: boolean;
  matureOk: boolean;
}

/**
 * Snapshot of the game selected in step 1. Captures the values needed to
 * write a campaign row to the DB without re-resolving by id, so we don't
 * care whether the source was the mock library or a DB game.
 */
export interface SelectedGame {
  /** Original id if the game came from `mockCampaigns` — used as a select key only. */
  sourceId?: string;
  name: string;
  developer: string;
  genre: string;
  thumbnail: CampaignThumbnail;
  platform: CampaignPlatform[];
}

export interface WizardData {
  game?: SelectedGame;
  totalBudget: number;
  recruitStart: string;
  recruitEnd: string;
  submitDeadline: string;
  payoutDays: number;
  missions: Record<MissionId, MissionConfig>;
  brief: string;
  hashtags: string[];
  guidelines: ContentGuidelines;
}

export const initialData: WizardData = {
  totalBudget: 4_000_000,
  recruitStart: '2026-06-01',
  recruitEnd: '2026-06-30',
  submitDeadline: '2026-07-15',
  payoutDays: 7,
  missions: {
    shortform: { enabled: true, rates: { A: 140, B: 70, C: 30, D: 10, E: 5 } },
    longform: { enabled: true, rates: { A: 400, B: 200, C: 80, D: 30, E: 15 } },
    live: { enabled: false, rates: { A: 0, B: 0, C: 0, D: 0, E: 0 } },
  },
  brief: '',
  hashtags: ['#로스트소드', '#LostSword'],
  guidelines: { sponsorship: true, gameplay: true, noCompare: true, matureOk: false },
};

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export const STEP_LABELS: Record<WizardStep, string> = {
  1: '게임',
  2: '예산',
  3: '미션 & 단가',
  4: '브리프',
  5: '검토',
};

export const TIERS = ['A', 'B', 'C', 'D', 'E'] as const;
export type TierKey = (typeof TIERS)[number];

export const TIER_DESCRIPTION: Record<TierKey, string> = {
  A: '500K+',
  B: '100K~',
  C: '30K~',
  D: '10K~',
  E: '5K~',
};

export const MISSIONS_META: Record<MissionId, { label: string; description: string; iconKey: 'film' | 'video' | 'radio' }> = {
  shortform: { label: '숏폼 영상', description: '최대 90초 · TikTok / Reels / YouTube Shorts', iconKey: 'film' },
  longform: { label: '롱폼 영상', description: '8분 이상 · YouTube / SOOP', iconKey: 'video' },
  live: { label: '라이브 방송', description: '5시간 이상 라이브 · 치지직 / SOOP / YouTube', iconKey: 'radio' },
};

export const MARKET_AVG: Record<MissionId, CampaignRates> = {
  shortform: { A: 135, B: 65, C: 28, D: 9, E: 4 },
  longform: { A: 380, B: 190, C: 75, D: 28, E: 14 },
  live: { A: 320, B: 160, C: 70, D: 22, E: 10 },
};

export const SUGGESTED_BUDGETS: ReadonlyArray<{ value: number; label: string; tag?: string }> = [
  { value: 1_000_000, label: '₩1M' },
  { value: 2_000_000, label: '₩2M' },
  { value: 4_000_000, label: '₩4M', tag: '인디 RPG 추천' },
  { value: 8_000_000, label: '₩8M' },
  { value: 15_000_000, label: '₩15M+' },
];

export interface GuidelineSpec {
  id: keyof ContentGuidelines;
  title: string;
  description: (checked: boolean) => string;
}

export const GUIDELINES: GuidelineSpec[] = [
  {
    id: 'sponsorship',
    title: '영상 시작 부분에 광고임을 고지',
    description: () => 'FTC 및 YouTube 정책상 필수',
  },
  {
    id: 'gameplay',
    title: '실제 게임플레이 노출',
    description: () => '전체 길이의 70% 이상',
  },
  {
    id: 'noCompare',
    title: '경쟁 게임과 비교 금지',
    description: () => '이 게임에만 집중',
  },
  {
    id: 'matureOk',
    title: '성인 콘텐츠 허용',
    description: (checked) =>
      checked
        ? '이 캠페인에서는 성인 주제와 언어 사용이 가능합니다'
        : '꺼짐 — 전체 이용가 콘텐츠로 유지',
  },
];

export const BRIEF_TEMPLATES: ReadonlyArray<{ id: string; label: string; body: string }> = [
  {
    id: 'first-impressions',
    label: '+ 첫인상 영상',
    body: '게임을 처음 켰을 때의 솔직한 인상을 5분 안에 정리해 주세요. 좋은 점 3가지, 아쉬운 점 1가지를 자연스러운 톤으로 풀어내면 좋습니다.',
  },
  {
    id: 'tutorial',
    label: '+ 튜토리얼 플레이',
    body: '신규 유저 입장에서 처음 1시간 동안 진행하는 모습을 풀어주세요. 막히는 구간이 있다면 그대로 보여주는 편이 도움이 됩니다.',
  },
  {
    id: 'boss',
    label: '+ 보스전 하이라이트',
    body: '챕터 보스전 / 레이드 하이라이트 위주로 3~5분 클립을 만들어 주세요. 컨트롤이 돋보이는 구간을 슬로우/리플레이로 강조하면 좋습니다.',
  },
  {
    id: 'character',
    label: '+ 캐릭터 리뷰',
    body: '대표 캐릭터 1~2명을 골라 외형, 스킬, 운영 팁을 소개해 주세요. 광고임을 자연스럽게 밝혀 주시면 됩니다.',
  },
  {
    id: 'beginner',
    label: '+ 초보자 가이드',
    body: '입문자가 알아야 할 핵심 포인트를 8분 내외 롱폼으로 정리해 주세요. 챕터 마커를 넣으면 시청 유지율이 올라갑니다.',
  },
];

export function calcPlatformFee(total: number): number {
  return Math.round(total * 0.15);
}

export function calcEstimatedCreators(data: WizardData): number {
  const enabledMissions = (Object.entries(data.missions) as Array<[MissionId, MissionConfig]>)
    .filter(([, m]) => m.enabled);
  if (enabledMissions.length === 0) return 0;
  const avgRate =
    enabledMissions.reduce((sum, [, m]) => {
      const tierAvg =
        (m.rates.A + m.rates.B * 2 + m.rates.C * 3 + m.rates.D * 4 + m.rates.E * 5) / 15;
      return sum + tierAvg;
    }, 0) / enabledMissions.length;
  if (avgRate <= 0) return 0;
  return Math.max(1, Math.round(data.totalBudget / 10_000 / avgRate));
}

export function getRateBounds(data: WizardData): { highestA: number; lowestE: number } {
  let highestA = 0;
  let lowestE = Number.POSITIVE_INFINITY;
  for (const m of Object.values(data.missions)) {
    if (!m.enabled) continue;
    if (m.rates.A > highestA) highestA = m.rates.A;
    if (m.rates.E > 0 && m.rates.E < lowestE) lowestE = m.rates.E;
  }
  return {
    highestA,
    lowestE: lowestE === Number.POSITIVE_INFINITY ? 0 : lowestE,
  };
}
