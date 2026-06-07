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

import { Badge, Button, Card, statusToBadgeVariant } from '@/components/ui';
import { ApplyButton } from '@/components/campaign/ApplyButton';
import {
  transformDbCampaign,
  type CampaignWithMissions,
} from '@/lib/api/campaigns';
import {
  formatBudget,
  formatRate,
  getMissionRate,
  getSpentPercent,
  type Campaign,
  type CampaignMissions,
  type CampaignRates,
  type MissionKind,
} from '@/lib/campaigns/types';
import { CURRENT_CREATOR, type CreatorGrade } from '@/lib/mockCreators';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

const STATUS_LABEL = {
  live: '진행중',
  recruiting: '모집중',
  completed: '완료',
} as const;

const TIERS: CreatorGrade[] = ['A', 'B', 'C', 'D', 'E'];

const MISSIONS: ReadonlyArray<{
  id: keyof CampaignMissions;
  label: string;
  icon: LucideIcon;
}> = [
  { id: 'shortform', label: '숏폼', icon: Film },
  { id: 'longform', label: '롱폼', icon: Video },
  { id: 'live', label: '라이브', icon: Radio },
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
    <Card variant="default" padding="md" className="bg-bg-elevated flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </span>
      <span className={`text-xl font-medium tabular-nums leading-tight ${valueClass ?? 'text-text-primary'}`}>
        {value}
      </span>
      <span className="text-[11px] text-text-secondary">{sub}</span>
    </Card>
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
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="border border-border rounded-lg overflow-hidden min-w-[520px]">
      <div className="grid grid-cols-[140px_repeat(5,1fr)] bg-bg-elevated">
        <div className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
          미션
        </div>
        {TIERS.map((tier) => (
          <div
            key={tier}
            className={[
              'px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-center',
              tier === highlightTier ? 'text-primary bg-primary-dim' : 'text-text-secondary',
            ].join(' ')}
          >
            {tier}티어
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
              const value = enabled ? getMissionRate(rates[tier], m.id as MissionKind) : 0;
              const isHighlight = tier === highlightTier;
              return (
                <div
                  key={tier}
                  className={[
                    'px-3 py-3 text-sm tabular-nums text-center',
                    isHighlight
                      ? 'bg-primary-dim text-primary font-medium'
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
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
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
      <div className="p-10 text-center text-sm text-text-secondary">불러오는 중…</div>
    );
  }

  if (state.kind === 'not-found') {
    return (
      <div className="p-10 text-center">
        <p className="text-base text-text-primary mb-2">캠페인을 찾을 수 없습니다</p>
        <p className="text-sm text-text-secondary">
          캠페인 ID <code className="text-primary">{campaignId}</code>가 존재하지 않습니다.
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
            <span className="text-[64px] leading-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
              {campaign.thumbnail.emoji}
            </span>
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.25) 100%)',
          }}
          aria-hidden
        />

        {variant === 'modal' && onClose && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-3 right-3 w-8 h-8 p-0 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 hover:text-white"
          >
            <X size={16} aria-hidden />
          </Button>
        )}

        <div className="absolute left-5 bottom-4 right-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusToBadgeVariant(campaign.status)} size="sm">
              {STATUS_LABEL[campaign.status]}
            </Badge>
            <Badge variant="neutral" size="sm" className="bg-white/20 text-white backdrop-blur-sm">
              예산 {percent}% 사용
            </Badge>
            {copy.tags.map((t) => (
              <Badge key={t} variant="neutral" size="sm" className="bg-white/10 text-white/85 backdrop-blur-sm">
                {t}
              </Badge>
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
          aria-label="캠페인 섹션"
          className="flex items-center gap-1 border-b border-white/[0.06] -mx-6 px-6"
        >
          {(['개요', '미션 & 단가', '참여자', '제출 콘텐츠'] as const).map(
            (label, i) => {
              const active = i === 0;
              const isModalDisabled = variant === 'modal' && !active;
              return (
                <Button
                  key={label}
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isModalDisabled}
                  className={[
                    'rounded-none border-b-2 -mb-px px-3 py-2.5',
                    active ? 'text-text-primary border-primary' : 'border-transparent',
                  ].join(' ')}
                >
                  {label}
                </Button>
              );
            },
          )}
        </nav>

        <section
          aria-label="주요 지표"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <MetricCard
            label="총 예산"
            value={formatBudget(campaign.totalBudget)}
            sub="예약됨"
          />
          <MetricCard
            label="집행액"
            value={formatBudget(campaign.spentBudget)}
            sub={`${percent}% 사용`}
            valueClass="text-primary"
          />
          <MetricCard
            label="참여 크리에이터"
            value={`${campaign.joined} / ${campaign.target}`}
            sub={`${fillRatio}% 충원`}
          />
          <MetricCard
            label="제출 콘텐츠"
            value="12"
            sub="2건 검수 대기"
            valueClass="text-success"
          />
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            게임 소개
          </span>
          <p className="text-sm leading-relaxed text-text-primary">{copy.about}</p>
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              티어별 미션 단가
            </span>
            <span className="text-[11px] text-primary">
              내 티어 {myTier} · 강조 표시됨
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
            크리에이터 가이드
          </span>
          <p className="text-sm leading-relaxed text-text-primary">{copy.brief}</p>
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            일정
          </span>
          <Card padding="none" className="bg-bg-elevated overflow-hidden">
            <ScheduleRow label="모집 기간" value={copy.schedule.recruitment} />
            <ScheduleRow label="콘텐츠 제출 마감" value={copy.schedule.submission} />
            <ScheduleRow label="정산일" value={copy.schedule.settlement} />
          </Card>
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
        <span className="inline-flex items-center gap-1.5 text-xs text-primary">
          <Sparkles size={13} aria-hidden />
          <span className="tabular-nums">{matchScore}%</span>
          <span className="text-text-secondary">내 채널과 매칭</span>
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="md" icon={<Calendar size={14} />}>
            나중에 보기
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
