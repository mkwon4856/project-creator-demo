'use client';

import {
  Calendar,
  Film,
  Radio,
  Sparkles,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { Button, Pill } from '@/components/ui';
import { ApplyButton } from '@/components/campaign/ApplyButton';
import {
  transformDbCampaign,
  type CampaignWithMissions,
} from '@/lib/api/campaigns';
import {
  CAMPAIGNS,
  formatBudget,
  formatRate,
  getSpentPercent,
  type Campaign,
  type CampaignMissions,
  type CampaignRates,
} from '@/lib/mockCampaigns';
import { CURRENT_CREATOR, type CreatorGrade } from '@/lib/mockCreators';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

const STATUS_TO_PILL = {
  live: 'live',
  recruiting: 'recruiting',
  completed: 'completed',
} as const;

const STATUS_LABEL = {
  live: 'Live',
  recruiting: 'Recruiting',
  completed: 'Completed',
} as const;

const TIERS: CreatorGrade[] = ['A', 'B', 'C', 'D', 'E'];

const MISSIONS: ReadonlyArray<{
  id: keyof CampaignMissions;
  label: string;
  icon: LucideIcon;
}> = [
  { id: 'shortform', label: 'Shortform', icon: Film },
  { id: 'longform', label: 'Longform', icon: Video },
  { id: 'live', label: 'Live', icon: Radio },
];

interface CampaignCopy {
  about: string;
  brief: string;
  schedule: { recruitment: string; submission: string; settlement: string };
  tags: string[];
}

function getCampaignCopy(c: Campaign): CampaignCopy {
  return {
    about: `${c.name}는 ${c.developer}가 선보이는 ${c.genre} 신작입니다. 입체적인 캐릭터와 짜임새 있는 콘텐츠 루프, 그리고 한국 게이머의 취향에 맞춘 빠른 진행감을 담아냈습니다.`,
    brief: `자유로운 톤으로 ${c.name}의 첫인상과 핵심 매력을 전달해 주세요. 자랑하기보다 솔직한 플레이 경험을 공유하는 콘텐츠를 권장합니다. 광고 표기는 영상 시작 5초 이내 자연스럽게 노출되어야 합니다.`,
    schedule: {
      recruitment: '2026.05.10 — 2026.05.31',
      submission: '2026.06.07',
      settlement: '2026.06.15',
    },
    tags: [c.genre.split('·')[0]?.trim() ?? c.genre, ...c.platform.map((p) => p.toUpperCase())],
  };
}

function MetricCard({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string;
  value: ReactNode;
  sub: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-bg-elevated p-4 flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </span>
      <span className={`text-xl font-medium tabular-nums leading-tight ${valueClass ?? 'text-text-primary'}`}>
        {value}
      </span>
      <span className="text-[11px] text-text-secondary">{sub}</span>
    </div>
  );
}

function ScheduleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-3 px-4 py-3 border-b border-white/[0.06] last:border-0 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary tabular-nums">{value}</span>
    </div>
  );
}

function RateMatrix({
  rates,
  missions,
  highlightTier,
}: {
  rates: CampaignRates;
  missions: CampaignMissions;
  highlightTier?: CreatorGrade;
}) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <div className="grid grid-cols-[140px_repeat(5,1fr)] bg-bg-elevated">
        <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
          Mission
        </div>
        {TIERS.map((tier) => (
          <div
            key={tier}
            className={[
              'px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-center',
              tier === highlightTier ? 'text-ube-bright bg-ube/10' : 'text-text-secondary',
            ].join(' ')}
          >
            {tier}-tier
          </div>
        ))}
      </div>
      {MISSIONS.map((m) => {
        const enabled = missions[m.id];
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className="grid grid-cols-[140px_repeat(5,1fr)] border-t border-white/[0.06] items-center"
          >
            <div className="px-4 py-3 inline-flex items-center gap-2 text-sm text-text-primary">
              <Icon size={14} aria-hidden className="text-text-secondary" />
              <span>{m.label}</span>
            </div>
            {TIERS.map((tier) => {
              const value = enabled ? rates[tier] : 0;
              const isHighlight = tier === highlightTier;
              return (
                <div
                  key={tier}
                  className={[
                    'px-3 py-3 text-sm tabular-nums text-center',
                    isHighlight
                      ? 'bg-ube/10 text-ube-bright font-medium'
                      : enabled
                        ? 'text-text-primary'
                        : 'text-text-muted',
                  ].join(' ')}
                >
                  {enabled && value > 0 ? formatRate(value) : '—'}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export interface CampaignDetailContentProps {
  campaignId: string;
  variant?: 'modal' | 'page';
  /** Modal close handler — only renders close button when provided. */
  onClose?: () => void;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'found'; campaign: Campaign }
  | { kind: 'not-found' };

const HAS_SUPABASE_ENV =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fetchCampaignFromDb(id: string): Promise<Campaign | null> {
  if (!HAS_SUPABASE_ENV) return null;
  try {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, missions (*)')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return transformDbCampaign(data as CampaignWithMissions);
  } catch (e) {
    console.error('fetchCampaignFromDb:', e);
    return null;
  }
}

export function CampaignDetailContent({
  campaignId,
  variant = 'page',
  onClose,
}: CampaignDetailContentProps) {
  // Cheap synchronous mock lookup first — covers all legacy ids without a roundtrip.
  const [state, setState] = useState<LoadState>(() => {
    const mock = CAMPAIGNS.find((c) => c.id === campaignId);
    return mock ? { kind: 'found', campaign: mock } : { kind: 'loading' };
  });

  useEffect(() => {
    // Re-evaluate when the requested id changes.
    const mock = CAMPAIGNS.find((c) => c.id === campaignId);
    if (mock) {
      setState({ kind: 'found', campaign: mock });
      return;
    }
    setState({ kind: 'loading' });

    let cancelled = false;
    void fetchCampaignFromDb(campaignId).then((c) => {
      if (cancelled) return;
      setState(c ? { kind: 'found', campaign: c } : { kind: 'not-found' });
    });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  if (state.kind === 'loading') {
    return (
      <div className="p-10 text-center text-sm text-text-secondary">Loading…</div>
    );
  }

  if (state.kind === 'not-found') {
    return (
      <div className="p-10 text-center">
        <p className="text-base text-text-primary mb-2">Campaign not found</p>
        <p className="text-sm text-text-secondary">
          The campaign id <code className="text-ube-bright">{campaignId}</code> doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const campaign = state.campaign;
  const copy = getCampaignCopy(campaign);
  const percent = getSpentPercent(campaign);
  const fillRatio = Math.round((campaign.joined / campaign.target) * 100);
  const matchScore = 94; // demo: pretend we computed it
  const myTier = CURRENT_CREATOR.grade;

  const isModal = variant === 'modal';

  return (
    <article className={`flex flex-col ${isModal ? 'flex-1 min-h-0' : ''}`}>
      <header
        className="relative w-full h-[200px] flex-shrink-0 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${campaign.thumbnail.from}, ${campaign.thumbnail.to})`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[64px] leading-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
            {campaign.thumbnail.emoji}
          </span>
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 70%)',
          }}
          aria-hidden
        />

        {variant === 'modal' && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 inline-flex w-8 h-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors duration-150 ease-out"
          >
            <X size={16} aria-hidden />
          </button>
        )}

        <div className="absolute left-5 bottom-4 right-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Pill variant="status" status={STATUS_TO_PILL[campaign.status]} size="sm">
              {STATUS_LABEL[campaign.status]}
            </Pill>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-white bg-white/20 backdrop-blur-sm">
              {percent}% budget used
            </span>
            {copy.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] text-white/85 bg-white/10 backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-medium text-white leading-tight">{campaign.name}</h1>
          <p className="text-sm text-white/85">
            {campaign.developer} · {campaign.genre}
          </p>
        </div>
      </header>

      <div
        className={[
          'p-6 flex flex-col gap-6',
          isModal ? 'flex-1 overflow-y-auto min-h-0' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <nav
          aria-label="Campaign sections"
          className="flex items-center gap-1 border-b border-white/[0.06] -mx-6 px-6"
        >
          {(['Overview', 'Missions & rates', 'Participants', 'Submitted content'] as const).map(
            (label, i) => {
              const active = i === 0;
              const isModalDisabled = variant === 'modal' && !active;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={isModalDisabled}
                  className={[
                    'px-3 py-2.5 text-sm transition-colors duration-150 ease-out',
                    'border-b-2 -mb-px',
                    active
                      ? 'text-text-primary border-ube'
                      : 'text-text-secondary border-transparent hover:text-text-primary',
                    isModalDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                  ].join(' ')}
                >
                  {label}
                </button>
              );
            },
          )}
        </nav>

        <section
          aria-label="Key metrics"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <MetricCard
            label="Total budget"
            value={formatBudget(campaign.totalBudget)}
            sub="Reserved"
          />
          <MetricCard
            label="Spent"
            value={formatBudget(campaign.spentBudget)}
            sub={`${percent}% used`}
            valueClass="text-ube-bright"
          />
          <MetricCard
            label="Creators joined"
            value={`${campaign.joined} / ${campaign.target}`}
            sub={`${fillRatio}% filled`}
          />
          <MetricCard
            label="Content submitted"
            value="12"
            sub="2 pending review"
            valueClass="text-green-400"
          />
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            About the game
          </span>
          <p className="text-sm leading-relaxed text-text-primary">{copy.about}</p>
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              Mission rates by tier
            </span>
            <span className="text-[11px] text-ube-bright">
              You&apos;re {myTier}-tier · highlighted column
            </span>
          </div>
          <RateMatrix
            rates={campaign.rates}
            missions={campaign.missions}
            highlightTier={myTier}
          />
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            Brief for creators
          </span>
          <p className="text-sm leading-relaxed text-text-primary">{copy.brief}</p>
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            Schedule
          </span>
          <div className="rounded-lg border border-white/[0.06] bg-bg-elevated overflow-hidden">
            <ScheduleRow label="Recruitment period" value={copy.schedule.recruitment} />
            <ScheduleRow label="Content submission deadline" value={copy.schedule.submission} />
            <ScheduleRow label="Settlement" value={copy.schedule.settlement} />
          </div>
        </section>
      </div>

      <footer
        className={[
          'flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.06] bg-bg-card',
          isModal ? 'flex-shrink-0' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="inline-flex items-center gap-1.5 text-xs text-ube-bright">
          <Sparkles size={13} aria-hidden />
          <span className="tabular-nums">{matchScore}%</span>
          <span className="text-text-secondary">match with your channel</span>
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="md" icon={<Calendar size={14} />}>
            Save for later
          </Button>
          <ApplyButton
            campaignId={campaign.id}
            campaign={campaign}
            onAppliedClose={onClose}
          />
        </div>
      </footer>
    </article>
  );
}
