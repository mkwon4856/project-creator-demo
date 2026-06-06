'use client';

import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Badge, Card, Pill, type BadgeVariant } from '@/components/ui';
import {
  CAMPAIGNS as MOCK_CAMPAIGNS,
  formatRate,
  getMissionRate,
  STATUS_LABELS,
  type Campaign,
  type CampaignRates,
  type MissionKind,
} from '@/lib/mockCampaigns';
import { CURRENT_CREATOR, type CreatorGrade } from '@/lib/mockCreators';
import { useCurrentCreator } from '@/lib/supabase/hooks';

type FilterId =
  | 'all'
  | 'high-rate'
  | 'shortform'
  | 'rpg'
  | 'big-budget'
  | 'live'
  | 'recruiting'
  | 'completed';

const STATUS_FILTERS: ReadonlyArray<{ id: FilterId; label: string }> = [
  { id: 'live', label: '진행중' },
  { id: 'recruiting', label: '곧 예정' },
  { id: 'completed', label: '마무리됨' },
];

const ATTRIBUTE_FILTERS: ReadonlyArray<{ id: FilterId; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'high-rate', label: '고단가' },
  { id: 'shortform', label: '숏폼' },
  { id: 'rpg', label: 'RPG' },
  { id: 'big-budget', label: '고예산' },
];

const STATUS_TO_PILL = {
  live: 'live',
  recruiting: 'recruiting',
  completed: 'completed',
} as const;

const MISSION_LABELS = {
  shortform: '숏폼',
  longform: '롱폼',
  live: '라이브',
} as const;

export interface MatchCreator {
  grade: CreatorGrade;
  subscribers: number;
  platforms: unknown;
}

export type ScoredCampaign = Campaign & { matchScore: number };

function safeGrade(g: string | null | undefined): CreatorGrade {
  if (g === 'A' || g === 'B' || g === 'C' || g === 'D' || g === 'E') return g;
  return 'E';
}

/** Return platform type strings that have a non-empty URL in the jsonb array. */
function connectedPlatformTypes(platforms: unknown): string[] {
  if (!Array.isArray(platforms)) return [];
  const types: string[] = [];
  for (const item of platforms) {
    if (!item || typeof item !== 'object') continue;
    const p = item as { type?: unknown; url?: unknown };
    if (typeof p.url === 'string' && p.url.trim().length > 0 && typeof p.type === 'string') {
      types.push(p.type);
    }
  }
  return types;
}

/**
 * Score how well a campaign fits the creator (0–100).
 * Weights: grade rate (40), open status (20), mission variety (15), platforms (25).
 */
export function calculateMatchScore(creator: MatchCreator, campaign: Campaign): number {
  let score = 0;

  const gradeKey = creator.grade as keyof CampaignRates;
  const myRate = campaign.rates[gradeKey] ?? 0;
  if (myRate > 0) score += 40;

  if (campaign.status === 'live' || campaign.status === 'recruiting') {
    score += 20;
  }

  const missionCount = [
    campaign.missions.shortform,
    campaign.missions.longform,
    campaign.missions.live,
  ].filter(Boolean).length;
  score += missionCount * 5;

  const creatorPlatforms = connectedPlatformTypes(creator.platforms);
  if (creatorPlatforms.length > 0) score += 15;
  if (creatorPlatforms.length >= 2) score += 10;

  return Math.min(score, 100);
}

function sortByMatchAndRate(
  items: ScoredCampaign[],
  grade: CreatorGrade,
): ScoredCampaign[] {
  return [...items].sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return (b.rates[grade] ?? 0) - (a.rates[grade] ?? 0);
  });
}

function applyFilter(
  list: ScoredCampaign[],
  filter: FilterId,
  grade: CreatorGrade,
): ScoredCampaign[] {
  switch (filter) {
    case 'all':
      return list;
    case 'live':
      return list.filter((c) => c.status === 'live');
    case 'recruiting':
      return list.filter((c) => c.status === 'recruiting');
    case 'completed':
      return list.filter((c) => c.status === 'completed');
    case 'shortform':
      return list.filter((c) => c.missions.shortform);
    case 'rpg':
      return list.filter((c) => /RPG/i.test(c.genre));
    case 'high-rate': {
      const withRates = list.map((c) => ({ c, rate: c.rates[grade] ?? 0 }));
      withRates.sort((a, b) => b.rate - a.rate);
      const topCount = Math.max(1, Math.ceil(withRates.length * 0.3));
      const topIds = new Set(withRates.slice(0, topCount).map((x) => x.c.id));
      return list.filter((c) => topIds.has(c.id));
    }
    case 'big-budget': {
      const withBudget = list.map((c) => ({ c, budget: c.totalBudget ?? 0 }));
      withBudget.sort((a, b) => b.budget - a.budget);
      const topCount = Math.max(1, Math.ceil(withBudget.length * 0.3));
      const topIds = new Set(withBudget.slice(0, topCount).map((x) => x.c.id));
      return list.filter((c) => topIds.has(c.id));
    }
    default:
      return list;
  }
}

function describeMissions(missions: Campaign['missions']): string {
  return (
    [
      missions.shortform && MISSION_LABELS.shortform,
      missions.longform && MISSION_LABELS.longform,
      missions.live && MISSION_LABELS.live,
    ]
      .filter(Boolean)
      .join(' · ') || '—'
  );
}

function MatchBadge({ score }: { score: number }) {
  if (score >= 70) {
    return (
      <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-ube-bright bg-black/60 backdrop-blur-sm">
        <Sparkles size={11} aria-hidden />
        <span className="tabular-nums">{score}%</span>
      </span>
    );
  }
  if (score >= 50) {
    return (
      <span className="absolute top-2 right-2 text-[10px] font-medium tabular-nums text-text-secondary bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
        {score}%
      </span>
    );
  }
  return null;
}

const SHORT_MISSION_LABELS: Record<MissionKind, string> = {
  shortform: '숏폼',
  longform: '롱폼',
  live: '라이브',
};

const MISSION_ORDER: MissionKind[] = ['shortform', 'longform', 'live'];

// Sales-flair tag derived from participation / budget / status, by priority.
function getDynamicTag(
  campaign: Campaign,
): { label: string; variant: BadgeVariant } | null {
  const joinRatio = campaign.target > 0 ? campaign.joined / campaign.target : 0;
  const spentRatio =
    campaign.totalBudget > 0 ? campaign.spentBudget / campaign.totalBudget : 0;

  if (campaign.status === 'completed') return { label: '완료 ✅', variant: 'neutral' };
  if (joinRatio >= 0.85) return { label: '종료임박 🔥', variant: 'danger' };
  if (spentRatio >= 0.9) return { label: '마감임박', variant: 'warning' };
  if (campaign.isNew) return { label: '신규 🆕', variant: 'ube-glow' };
  if (campaign.status === 'recruiting' && joinRatio < 0.3) {
    return { label: '모집중 ✨', variant: 'success' };
  }
  return null;
}

function RecommendedCard({
  campaign,
  matchScore,
  grade,
  onSelect,
}: {
  campaign: Campaign;
  matchScore: number;
  grade: CreatorGrade;
  onSelect?: (c: Campaign) => void;
}) {
  const baseRate = campaign.rates[grade];
  const activeMissions = MISSION_ORDER.filter((m) => campaign.missions[m]);
  const dynamicTag = getDynamicTag(campaign);

  return (
    <Card
      variant="default"
      padding="none"
      hover
      onClick={onSelect ? () => onSelect(campaign) : undefined}
      className="overflow-hidden flex flex-col"
    >
      <div
        className="relative w-full"
        style={{
          aspectRatio: '16 / 7',
          background: `linear-gradient(135deg, ${campaign.thumbnail.from}, ${campaign.thumbnail.to})`,
        }}
      >
        {campaign.thumbnail.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.thumbnail.imageUrl}
            alt={campaign.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
              {campaign.thumbnail.emoji}
            </span>
          </div>
        )}
        <MatchBadge score={matchScore} />
      </div>

      <div className="p-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Pill variant="status" status={STATUS_TO_PILL[campaign.status]} size="sm">
            {STATUS_LABELS[campaign.status]}
          </Pill>
          {dynamicTag && (
            <Badge variant={dynamicTag.variant} size="sm">
              {dynamicTag.label}
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-medium text-text-primary truncate">{campaign.name}</h3>
          <p className="text-[11px] text-text-secondary truncate">
            {campaign.developer} · {campaign.genre}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.06em] text-ube-bright font-semibold">
            예상 단가
          </span>
          {activeMissions.length > 0 ? (
            <div className="flex items-stretch gap-1.5">
              {activeMissions.map((m) => (
                <div
                  key={m}
                  className="flex-1 rounded-md px-2 py-1.5 bg-ube/10 border border-ube/30 flex flex-col items-center gap-0.5 text-center"
                >
                  <span className="text-[10px] text-text-secondary">
                    {SHORT_MISSION_LABELS[m]}
                  </span>
                  <span className="text-sm font-semibold text-ube-bright tabular-nums">
                    {formatRate(getMissionRate(baseRate, m))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md px-2.5 py-2 bg-ube/10 border border-ube/30 text-[11px] text-text-muted">
              미션 미정
            </div>
          )}
        </div>

        <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-text-secondary">
          <span className="tabular-nums">
            {campaign.joined}/{campaign.target} 참여
          </span>
          <span className="truncate ml-2">{describeMissions(campaign.missions)}</span>
        </div>
      </div>
    </Card>
  );
}

export function RecommendedCampaigns() {
  const router = useRouter();
  const { data: creatorRow } = useCurrentCreator();
  // Demo: always render the local CAMPAIGNS mock. DB fetch is intentionally
  // disabled so edits to mockCampaigns.ts show up without stale DB rows.
  const [campaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [filter, setFilter] = useState<FilterId>('all');

  const creator: MatchCreator = useMemo(() => {
    if (creatorRow) {
      return {
        grade: safeGrade(creatorRow.grade),
        subscribers: creatorRow.subscribers ?? 0,
        platforms: creatorRow.platforms,
      };
    }
    return {
      grade: CURRENT_CREATOR.grade,
      subscribers: CURRENT_CREATOR.subscribers,
      platforms: [],
    };
  }, [creatorRow]);

  const scoredAndSorted = useMemo(() => {
    const scored: ScoredCampaign[] = campaigns.map((c) => ({
      ...c,
      matchScore: calculateMatchScore(creator, c),
    }));
    return sortByMatchAndRate(scored, creator.grade);
  }, [campaigns, creator]);

  const filtered = useMemo(
    () => applyFilter(scoredAndSorted, filter, creator.grade),
    [scoredAndSorted, filter, creator.grade],
  );

  const handleSelect = (c: Campaign) => {
    router.push(`/campaigns/${c.id}`);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <Pill
              key={f.id}
              variant={filter === f.id ? 'active' : 'default'}
              size="md"
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Pill>
          ))}
        </div>
        <div className="h-5 w-px bg-white/10 mx-1" aria-hidden />
        <div className="flex items-center gap-1.5 flex-wrap">
          {ATTRIBUTE_FILTERS.map((f) => (
            <Pill
              key={f.id}
              variant={filter === f.id ? 'active' : 'default'}
              size="md"
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Pill>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 px-6 py-12 text-center text-sm text-text-secondary">
          조건에 맞는 캠페인이 없어요.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <RecommendedCard
              key={c.id}
              campaign={c}
              grade={creator.grade}
              matchScore={c.matchScore}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
