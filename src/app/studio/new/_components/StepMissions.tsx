'use client';

import { Film, Radio, Video, type LucideIcon } from 'lucide-react';
import type { ChangeEvent } from 'react';

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

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={[
        'relative inline-flex w-10 h-5 rounded-full transition-colors duration-150 ease-out cursor-pointer',
        on ? 'bg-ube' : 'bg-bg-hover border border-white/10',
      ].join(' ')}
    >
      <span
        aria-hidden
        className={[
          'absolute top-0.5 inline-block w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-150 ease-out',
          on ? 'left-[20px]' : 'left-0.5',
        ].join(' ')}
      />
    </button>
  );
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
          enabled ? 'bg-ube/10 border-ube/30' : 'bg-bg-elevated border-white/10',
        ].join(' ')}
      >
        <span
          className={[
            'inline-flex w-8 h-8 rounded-md items-center justify-center shrink-0',
            enabled ? 'bg-ube text-white' : 'bg-bg-hover text-text-secondary',
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
        <Toggle on={enabled} onChange={setEnabled} label={`${meta.label} enabled`} />
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
              {tier}-tier <span className="text-text-muted">({TIER_DESCRIPTION[tier]})</span>
            </span>
            <label className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-bg-card border border-white/10 focus-within:border-ube focus-within:shadow-[0_0_0_3px_var(--ube-tint)] transition-all duration-150 ease-out">
              <span className="text-xs text-text-muted">₩</span>
              <input
                type="number"
                min={0}
                value={config.rates[tier]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRate(tier, Number(e.target.value) || 0)}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm font-medium text-text-primary tabular-nums"
                aria-label={`${meta.label} rate for ${tier}-tier`}
              />
              <span className="text-xs text-text-muted">만</span>
            </label>
            <span className="text-[10px] text-ube-bright tabular-nums">
              Market avg ₩{MARKET_AVG[id][tier]}만
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
          Set missions and tier rates
        </h2>
        <p className="text-sm text-text-secondary">
          Pick which content types you accept and set per-tier compensation. Toggle off any mission you don&apos;t need.
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
