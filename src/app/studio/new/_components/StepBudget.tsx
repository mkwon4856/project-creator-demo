'use client';

import { Calendar } from 'lucide-react';
import type { ChangeEvent } from 'react';

import { Card, Input, Pill } from '@/components/ui';

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
    <Input
      label={label}
      type="date"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      icon={<Calendar size={14} aria-hidden />}
      helper={helper}
    />
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

      <Card padding="lg" className="flex flex-col gap-4">
        <span className="text-sm text-text-secondary">총 예산 (원)</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-medium text-primary leading-none">₩</span>
          <input
            type="text"
            inputMode="numeric"
            value={data.totalBudget.toLocaleString()}
            onChange={handleBudget}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-3xl font-medium tracking-tight text-primary tabular-nums leading-none placeholder:text-text-muted"
            aria-label="총 예산"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-border">
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
      </Card>

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
        <Input
          label="정산 지급 기한"
          type="number"
          min={1}
          max={30}
          value={data.payoutDays}
          onChange={(e) => onChange({ payoutDays: Number(e.target.value) || 0 })}
          suffix="일 이내 (승인 후)"
          helper="크리에이터에게 자동 정산됩니다. 기본 7일."
        />
      </div>
    </div>
  );
}
