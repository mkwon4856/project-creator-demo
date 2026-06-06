'use client';

import { Lock } from 'lucide-react';

import { Badge, Card, Pill } from '@/components/ui';
import {
  formatBudget,
  formatRate,
  getProgressTone,
  getSpentPercent,
  PLATFORM_ICONS,
  STATUS_LABELS,
  type Campaign,
} from '@/lib/mockCampaigns';

const PROGRESS_BAR_COLOR: Record<'ube' | 'amber' | 'red', string> = {
  ube: 'bg-ube',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const STATUS_PILL_STATUS = {
  live: 'live',
  recruiting: 'recruiting',
  completed: 'completed',
} as const;

export type CampaignCardFooter = 'joined' | 'private';

export interface CampaignCardProps {
  campaign: Campaign;
  footer?: CampaignCardFooter;
  onClick?: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, footer = 'joined', onClick }: CampaignCardProps) {
  const percent = getSpentPercent(campaign);
  const tone = getProgressTone(percent);

  const rateEntries = (
    [
      ['A', campaign.rates.A],
      ['B', campaign.rates.B],
      ['C', campaign.rates.C],
      ['D', campaign.rates.D],
      ['E', campaign.rates.E],
    ] as const
  ).filter(([, v]) => v > 0);

  const visibleRates = rateEntries.slice(0, 2);
  const moreCount = rateEntries.length - visibleRates.length;

  return (
    <Card
      variant="default"
      padding="none"
      hover
      onClick={onClick ? () => onClick(campaign) : undefined}
      className="overflow-hidden flex flex-col"
    >
      <div
        className="relative w-full"
        style={{
          aspectRatio: '16 / 10',
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
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <Pill
            variant="status"
            status={STATUS_PILL_STATUS[campaign.status]}
            size="sm"
          >
            {STATUS_LABELS[campaign.status]}
          </Pill>
          {campaign.isNew && (
            <Badge variant="ube-glow" size="xs">
              신규
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 text-[11px] text-white/80">
          {campaign.platform.map((p) => (
            <span key={p} title={p} aria-label={p}>
              {PLATFORM_ICONS[p]}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-medium text-text-primary truncate">{campaign.name}</h3>
          <p className="text-xs text-text-secondary truncate">
            {campaign.developer} · {campaign.genre}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {visibleRates.map(([grade, rate]) => (
            <Badge key={grade} variant="ube" size="xs">
              {grade} {formatRate(rate)}
            </Badge>
          ))}
          {moreCount > 0 && (
            <Badge variant="neutral" size="xs">
              +{moreCount}개 더
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.06em] text-text-muted">예산</span>
            <span className="text-[11px] tabular-nums text-text-secondary">
              <span className="text-text-primary font-medium">{formatBudget(campaign.spentBudget)}</span>
              <span className="text-text-muted"> / {formatBudget(campaign.totalBudget)}</span>
            </span>
          </div>
          <div className="h-[3px] w-full bg-bg-hover rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${PROGRESS_BAR_COLOR[tone]}`}
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className="pt-1 border-t border-white/[0.06]">
          {footer === 'joined' ? (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-muted">참여</span>
              <span className="tabular-nums text-text-secondary">
                <span className="text-text-primary font-medium">{campaign.joined}</span>
                <span className="text-text-muted"> / {campaign.target}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
              <Lock size={11} aria-hidden />
              <span>크리에이터 목록 비공개</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
