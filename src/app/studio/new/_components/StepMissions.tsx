'use client';

import { Film, Radio, Video, type LucideIcon } from 'lucide-react';
import type { ChangeEvent } from 'react';

import { Input, Switch } from '@/components/ui';

import {
  MARKET_AVG,
  MISSIONS_META,
  TIER_DESCRIPTION,
  TIERS,
  type MissionId,
  type TierKey,
  type WizardData,
} from '../_types';

const ICON_MAP: Record<'film' | 'video' | 'radio', LucideIcon> = {
  film: Film,
  video: Video,
  radio: Radio,
};

interface StepMissionsProps {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}

function MissionGroup({
  id,
  data,
  onChange,
}: {
  id: MissionId;
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}) {
  const meta = MISSIONS_META[id];
  const Icon = ICON_MAP[meta.iconKey];
  const config = data.missions[id];
  const enabled = config.enabled;

  const setEnabled = (next: boolean) => {
    onChange({
      missions: {
        ...data.missions,
        [id]: { ...config, enabled: next },
      },
    });
  };

  const setRate = (tier: TierKey, value: number) => {
    onChange({
      missions: {
        ...data.missions,
        [id]: {
          ...config,
          rates: { ...config.rates, [tier]: value },
        },
      },
    });
  };

  return (
    <div className="flex flex-col">
      <div
        className={[
          'flex items-center gap-3 px-4 py-3.5 rounded-t-lg border',
          enabled ? 'bg-primary-dim border-primary/30' : 'bg-bg-elevated border-border',
        ].join(' ')}
      >
        <span
          className={[
            'inline-flex w-8 h-8 rounded-md items-center justify-center shrink-0',
            enabled ? 'bg-primary text-bg' : 'bg-surface-hover text-text-secondary',
          ].join(' ')}
          aria-hidden
        >
          <Icon size={16} />
        </span>
        <div className="flex flex-col flex-1 min-w-0">
          <span
            className={[
              'text-sm font-medium leading-tight',
              enabled ? 'text-text-primary' : 'text-text-secondary',
            ].join(' ')}
          >
            {meta.label}
          </span>
          <span className="text-[11px] text-text-secondary">{meta.description}</span>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label={`${meta.label} 사용`}
        />
      </div>

      <div
        className={[
          'grid grid-cols-1 sm:grid-cols-5 border-x border-b border-white/10 rounded-b-lg overflow-hidden',
          enabled ? '' : 'opacity-40 pointer-events-none',
        ].join(' ')}
      >
        {TIERS.map((tier, i) => (
          <div
            key={tier}
            className={[
              'flex flex-col gap-1.5 p-3',
              i < TIERS.length - 1 ? 'sm:border-r border-white/[0.06]' : '',
            ].join(' ')}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {tier}티어 <span className="text-text-muted">({TIER_DESCRIPTION[tier]})</span>
            </span>
            <Input
              type="number"
              min={0}
              value={config.rates[tier]}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setRate(tier, Number(e.target.value) || 0)
              }
              icon={<span className="text-xs">₩</span>}
              suffix="만"
              aria-label={`${meta.label} ${tier}티어 단가`}
              containerClassName="[&_input]:text-sm [&_input]:font-medium [&_input]:tabular-nums"
            />
            <span className="text-[10px] text-primary tabular-nums">
              시장 평균 ₩{MARKET_AVG[id][tier]}만
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StepMissions({ data, onChange }: StepMissionsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px] font-medium text-text-primary leading-tight">
          미션 및 티어 단가 설정
        </h2>
        <p className="text-sm text-text-secondary">
          원하는 콘텐츠 유형을 선택하고 티어별 단가를 설정하세요. 필요 없는 미션은 끄면 됩니다.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {(['shortform', 'longform', 'live'] as const).map((id) => (
          <MissionGroup key={id} id={id} data={data} onChange={onChange} />
        ))}
      </div>
    </div>
  );
}
