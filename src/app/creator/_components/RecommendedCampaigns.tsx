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
} from '@/lib/mockCampaigns';
import { CURRENT_CREATOR } from '@/lib/mockCreators';

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

const MATCH_BY_INDEX: Record<number, number> = {
  0: 94,
  1: 88,
};

const MISSION_LABELS = {
  shortform: 'Shortform',
  longform: 'Longform',
  live: 'Live',
} as const;

function applyFilter(list: Campaign[], filter: FilterId): Campaign[] {
  switch (filter) {
    case 'all':
      return list;
    case 'new':
      return list.filter((c) => c.isNew);
    case 'shortform':
      return list.filter((c) => c.missions.shortform);
    case 'live-ok':
      return list.filter((c) => c.missions.live);
    case 'rpg':
      return list.filter((c) => /RPG/i.test(c.genre));
    case 'casual':
      return list.filter((c) => /캐주얼|casual|힐링/i.test(c.genre));
    case 'high-rate':
      return [...list].sort((a, b) => b.rates[CURRENT_CREATOR.grade] - a.rates[CURRENT_CREATOR.grade]);
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

function RecommendedCard({
  campaign,
  matchScore,
  grade,
  onSelect,
}: {
  campaign: Campaign;
  matchScore?: number;
  grade: typeof CURRENT_CREATOR.grade;
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
        {typeof matchScore === 'number' && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-ube-bright bg-black/60 backdrop-blur-sm">
            <Sparkles size={11} aria-hidden />
            <span className="tabular-nums">{matchScore}%</span>
          </span>
        )}
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
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [filter, setFilter] = useState<FilterId>('all');

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

  const filtered = useMemo(() => applyFilter(campaigns, filter), [campaigns, filter]);

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
          {filtered.map((c, i) => (
            <RecommendedCard
              key={c.id}
              campaign={c}
              grade={CURRENT_CREATOR.grade}
              matchScore={MATCH_BY_INDEX[i]}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
