'use client';

import { Card } from '@/components/ui';
import { formatBudget } from '@/lib/campaigns/types';

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
        <Card padding="sm" className="flex items-center gap-3">
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
        </Card>
      ) : (
        <Card padding="md" className="border-dashed text-center text-xs text-text-secondary">
          1단계에서 게임을 선택하면 요약이 표시됩니다.
        </Card>
      )}

      <div className="flex flex-col">
        <SummaryRow
          label="총 예산"
          value={<span className="text-primary">{formatBudget(data.totalBudget)}</span>}
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

      <Card variant="featured" padding="md" className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          플랫폼 수수료 (15%)
        </span>
        <span className="text-2xl text-primary font-medium tabular-nums leading-tight">
          {formatBudget(platformFee)}
        </span>
        <span className="text-[11px] text-text-secondary">정산 지급 성공 시 부과됩니다</span>
      </Card>
    </aside>
  );
}
