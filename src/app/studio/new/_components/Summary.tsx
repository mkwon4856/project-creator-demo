'use client';

import { formatBudget } from '@/lib/mockCampaigns';

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

function formatWizardRate(manwon: number): string {
  return `₩${manwon.toLocaleString()}만`;
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
      aria-label="캠페인 요약"
      className="border-l border-white/[0.06] bg-bg-elevated p-7 flex flex-col gap-5 overflow-y-auto"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        캠페인 요약
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
          1단계에서 게임을 선택하면 요약이 표시됩니다.
        </div>
      )}

      <div className="flex flex-col">
        <SummaryRow
          label="총 예산"
          value={<span className="text-ube-bright">{formatBudget(data.totalBudget)}</span>}
        />
        <SummaryRow
          label="활성 미션"
          value={
            enabledMissions.length === 0
              ? '—'
              : enabledMissions.map((id) => MISSIONS_META[id].label.split(' ')[0]).join(' · ')
          }
        />
        <SummaryRow
          label="최고 티어 단가 (A)"
          value={highestA > 0 ? formatWizardRate(highestA) : '—'}
        />
        <SummaryRow
          label="최저 티어 단가 (E)"
          value={lowestE > 0 ? formatWizardRate(lowestE) : '—'}
        />
        <SummaryRow
          label="예상 크리에이터 수"
          value={estimatedCreators > 0 ? `~${estimatedCreators}` : '—'}
        />
      </div>

      <div
        className="rounded-lg p-4 border border-ube/30 flex flex-col gap-1"
        style={{ background: 'var(--ube-tint)' }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ube-bright">
          플랫폼 수수료 (15%)
        </span>
        <span className="text-2xl text-ube-bright font-medium tabular-nums leading-tight">
          {formatBudget(platformFee)}
        </span>
        <span className="text-[11px] text-ube-bright/85">정산 지급 성공 시 부과됩니다</span>
      </div>
    </aside>
  );
}
