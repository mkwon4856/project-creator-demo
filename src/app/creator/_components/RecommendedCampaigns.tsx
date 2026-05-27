'use client';

import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Card, Pill } from '@/components/ui';
import { fetchCampaigns, transformDbCampaign } from '@/lib/api/campaigns';
import {
  CAMPAIGNS as MOCK_CAMPAIGNS,
  formatRate,
  STATUS_LABELS,
  type Campaign,
  type CampaignRates,
} from '@/lib/mockCampaigns';
import { CURRENT_CREATOR, type CreatorGrade } from '@/lib/mockCreators';
import { useCurrentCreator } from '@/lib/supabase/hooks';

type FilterId =
  | 'all'
  | 'high-rate'
  | 'new'
  | 'shortform'
  | 'live-ok'
  | 'rpg'
  | 'casual';

const FILTERS: ReadonlyArray<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'high-rate', label: 'High rate' },
  { id: 'new', label: 'New' },
  { id: 'shortform', label: 'Shortform' },
  { id: 'live-ok', label: 'Live OK' },
  { id: 'rpg', label: 'RPG' },
  { id: 'casual', label: 'Casual' },
];

const STATUS_TO_PILL = {
  live: 'live',
  recruiting: 'recruiting',
  completed: 'completed',
} as const;

const MISSION_LABELS = {
  shortform: 'Shortform',
  longform: 'Longform',
  live: 'Live',
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
    case 'new':
      return list.filter((c) => c.status === 'recruiting');
    case 'shortform':
      return list.filter((c) => c.missions.shortform);
    case 'live-ok':
      return list.filter((c) => c.missions.live);
    case 'rpg':
      return list.filter((c) => /RPG/i.test(c.genre));
    case 'casual':
      return list.filter((c) => /캐주얼|casual|힐링/i.test(c.genre));
    case 'high-rate': {
      const withRates = list.map((c) => ({ c, rate: c.rates[grade] ?? 0 }));
      withRates.sort((a, b) => b.rate - a.rate);
      const topCount = Math.max(1, Math.ceil(withRates.length * 0.3));
      const topIds = new Set(withRates.slice(0, topCount).map((x) => x.c.id));
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
  const rate = campaign.rates[grade];
  const primaryMission = campaign.missions.shortform
    ? 'shortform'
    : campaign.missions.longform
      ? 'longform'
      : campaign.missions.live
        ? 'live'
        : 'shortform';

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
          aspectRatio: '16 / 10',
          background: `linear-gradient(135deg, ${campaign.thumbnail.from}, ${campaign.thumbnail.to})`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            {campaign.thumbnail.emoji}
          </span>
        </div>
        <div className="absolute top-2 left-2">
          <Pill variant="status" status={STATUS_TO_PILL[campaign.status]} size="sm">
            {STATUS_LABELS[campaign.status]}
          </Pill>
        </div>
        <MatchBadge score={matchScore} />
      </div>

      <div className="p-3 flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-medium text-text-primary truncate">{campaign.name}</h3>
          <p className="text-[11px] text-text-secondary truncate">
            {campaign.developer} · {campaign.genre}
          </p>
        </div>

        <div className="rounded-md p-2.5 bg-ube/10 border border-ube/30 flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.06em] text-ube-bright font-semibold">
            YOUR RATE ({grade}-tier)
          </span>
          <span className="text-sm font-medium text-ube-bright tabular-nums">
            {formatRate(rate)} / {primaryMission}
          </span>
        </div>

        <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-text-secondary">
          <span className="tabular-nums">
            {campaign.joined}/{campaign.target} joined
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
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
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

  useEffect(() => {
    let cancelled = false;
    void fetchCampaigns().then((rows) => {
      if (cancelled) return;
      if (rows.length > 0) setCampaigns(rows.map(transformDbCampaign));
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {FILTERS.map((f) => (
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

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 px-6 py-12 text-center text-sm text-text-secondary">
          No campaigns match this filter.
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
