'use client';

import { Calendar } from 'lucide-react';
import type { ChangeEvent } from 'react';

import { Pill } from '@/components/ui';

import { SUGGESTED_BUDGETS, type WizardData } from '../_types';

interface StepBudgetProps {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}

function DateField({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <label className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-bg-card border border-white/10 focus-within:border-ube focus-within:shadow-[0_0_0_3px_var(--ube-tint)] transition-all duration-150 ease-out">
        <Calendar size={14} aria-hidden className="text-text-muted shrink-0" />
        <input
          type="date"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-text-primary"
        />
      </label>
      <span className="text-[11px] text-text-secondary">{helper}</span>
    </div>
  );
}

export function StepBudget({ data, onChange }: StepBudgetProps) {
  const handleBudget = (e: ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, '');
    onChange({ totalBudget: Number(cleaned || 0) });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px] font-medium text-text-primary leading-tight">
          캠페인 예산 설정
        </h2>
        <p className="text-sm text-text-secondary">
          예산은 에스크로에 예치되며 승인 시 크리에이터에게 지급됩니다. 플랫폼 수수료 15%가 적용됩니다.
        </p>
      </div>

      <div className="bg-bg-card border border-white/10 rounded-lg p-6 flex flex-col gap-4">
        <span className="text-sm text-text-secondary">총 예산 (원)</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-medium text-ube-bright leading-none">₩</span>
          <input
            type="text"
            inputMode="numeric"
            value={data.totalBudget.toLocaleString()}
            onChange={handleBudget}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-3xl font-medium tracking-tight text-ube-bright tabular-nums leading-none placeholder:text-text-muted"
            aria-label="총 예산"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/[0.06]">
          {SUGGESTED_BUDGETS.map((s) => {
            const active = data.totalBudget === s.value;
            return (
              <Pill
                key={s.value}
                variant={active ? 'active' : 'default'}
                size="sm"
                onClick={() => onChange({ totalBudget: s.value })}
              >
                <span className="tabular-nums">{s.label}</span>
                {s.tag && <span className="ml-1 text-[10px] opacity-80">· {s.tag}</span>}
              </Pill>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateField
          label="모집 시작"
          helper="크리에이터가 지원을 시작할 수 있는 날짜"
          value={data.recruitStart}
          onChange={(v) => onChange({ recruitStart: v })}
        />
        <DateField
          label="모집 마감"
          helper="이후로는 새 지원을 받지 않습니다"
          value={data.recruitEnd}
          onChange={(v) => onChange({ recruitEnd: v })}
        />
        <DateField
          label="콘텐츠 제출 마감"
          helper="크리에이터의 최종 제출 기한"
          value={data.submitDeadline}
          onChange={(v) => onChange({ submitDeadline: v })}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-text-secondary">정산 지급 기한</span>
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-bg-card border border-white/10 focus-within:border-ube focus-within:shadow-[0_0_0_3px_var(--ube-tint)] transition-all duration-150 ease-out">
            <input
              type="number"
              min={1}
              max={30}
              value={data.payoutDays}
              onChange={(e) => onChange({ payoutDays: Number(e.target.value) || 0 })}
              className="w-16 bg-transparent border-none outline-none text-sm text-text-primary tabular-nums"
              aria-label="정산 지급 일수"
            />
            <span className="text-sm text-text-secondary">일 이내 (승인 후)</span>
          </label>
          <span className="text-[11px] text-text-secondary">
            크리에이터에게 자동 정산됩니다. 기본 7일.
          </span>
        </div>
      </div>
    </div>
  );
}
