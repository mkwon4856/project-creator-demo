'use client';

import { formatBudget, formatRate } from '@/lib/mockCampaigns';

import {
  calcEstimatedCreators,
  calcPlatformFee,
  getRateBounds,
  MISSIONS_META,
  type MissionId,
  type WizardData,
} from '../_types';

export interface SummaryProps {
  data: WizardData;
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.06] text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium tabular-nums text-right">{value}</span>
    </div>
  );
}

export function Summary({ data }: SummaryProps) {
  const game = data.game;
  const enabledMissions = (Object.keys(data.missions) as MissionId[]).filter(
    (id) => data.missions[id].enabled,
  );
  const { highestA, lowestE } = getRateBounds(data);
  const estimatedCreators = calcEstimatedCreators(data);
  const platformFee = calcPlatformFee(data.totalBudget);

  return (
    <aside
      aria-label="Campaign summary"
      className="border-l border-white/[0.06] bg-bg-elevated p-7 flex flex-col gap-5 overflow-y-auto"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        Campaign summary
      </span>

      {game ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-card border border-white/[0.06]">
          <span
            className="inline-flex w-10 h-10 rounded-md items-center justify-center text-xl leading-none shrink-0"
            style={{
              background: `linear-gradient(135deg, ${game.thumbnail.from}, ${game.thumbnail.to})`,
            }}
            aria-hidden
          >
            {game.thumbnail.emoji}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-text-primary truncate">{game.name}</span>
            <span className="text-xs text-text-secondary truncate">{game.developer}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/15 p-4 text-center text-xs text-text-secondary">
          Select a game in step 1 to see a summary.
        </div>
      )}

      <div className="flex flex-col">
        <SummaryRow
          label="Total budget"
          value={<span className="text-ube-bright">{formatBudget(data.totalBudget)}</span>}
        />
        <SummaryRow
          label="Active missions"
          value={
            enabledMissions.length === 0
              ? '—'
              : enabledMissions.map((id) => MISSIONS_META[id].label.split(' ')[0]).join(' · ')
          }
        />
        <SummaryRow
          label="Highest tier rate (A)"
          value={highestA > 0 ? formatRate(highestA) : '—'}
        />
        <SummaryRow
          label="Lowest tier rate (E)"
          value={lowestE > 0 ? formatRate(lowestE) : '—'}
        />
        <SummaryRow
          label="Estimated creators"
          value={estimatedCreators > 0 ? `~${estimatedCreators}` : '—'}
        />
      </div>

      <div
        className="rounded-lg p-4 border border-ube/30 flex flex-col gap-1"
        style={{ background: 'var(--ube-tint)' }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ube-bright">
          Platform fee (15%)
        </span>
        <span className="text-2xl text-ube-bright font-medium tabular-nums leading-tight">
          {formatBudget(platformFee)}
        </span>
        <span className="text-[11px] text-ube-bright/85">Charged on successful payouts</span>
      </div>
    </aside>
  );
}
