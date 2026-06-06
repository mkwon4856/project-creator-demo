'use client';

import {
  Check,
  Edit3,
  FileText,
  Gamepad2,
  ListChecks,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { formatBudget, formatRate } from '@/lib/mockCampaigns';

import {
  GUIDELINES,
  MISSIONS_META,
  TIERS,
  type WizardData,
  type WizardStep,
} from '../_types';

interface StepReviewProps {
  data: WizardData;
  onJump: (step: WizardStep) => void;
  confirmed: boolean;
  onConfirm: (next: boolean) => void;
}

function ReviewSection({
  title,
  icon: Icon,
  onEdit,
  children,
}: {
  title: string;
  icon: LucideIcon;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-white/[0.06] bg-bg-card overflow-hidden">
      <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-white/[0.06]">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex w-6 h-6 rounded-md bg-bg-hover items-center justify-center text-text-secondary">
            <Icon size={13} aria-hidden />
          </span>
          <h3 className="text-sm font-medium text-text-primary leading-tight">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs text-ube-bright hover:text-white transition-colors duration-150 ease-out cursor-pointer"
        >
          <Edit3 size={12} aria-hidden />
          수정
        </button>
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-baseline gap-3 py-1.5">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-sm text-text-primary tabular-nums">{value}</span>
    </div>
  );
}

export function StepReview({ data, onJump, confirmed, onConfirm }: StepReviewProps) {
  const game = data.game;
  const enabledMissions = (Object.keys(data.missions) as Array<keyof typeof data.missions>).filter(
    (m) => data.missions[m].enabled,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px] font-medium text-text-primary leading-tight">
          검토 후 시작
        </h2>
        <p className="text-sm text-text-secondary">
          아래 내용을 모두 확인하세요. 시작 후에는 일시중지는 가능하지만 단가를 낮출 수 없습니다.
        </p>
      </div>

      <ReviewSection title="게임" icon={Gamepad2} onEdit={() => onJump(1)}>
        {game ? (
          <Row
            label="선택됨"
            value={
              <span className="inline-flex items-center gap-2.5">
                <span
                  className="inline-flex w-7 h-7 rounded-md items-center justify-center text-base leading-none"
                  style={{
                    background: `linear-gradient(135deg, ${game.thumbnail.from}, ${game.thumbnail.to})`,
                  }}
                  aria-hidden
                >
                  {game.thumbnail.emoji}
                </span>
                <span className="text-text-primary">{game.name}</span>
                <span className="text-text-secondary text-xs">
                  {game.developer} · {game.genre}
                </span>
              </span>
            }
          />
        ) : (
          <p className="text-sm text-text-secondary">선택된 게임이 없습니다.</p>
        )}
      </ReviewSection>

      <ReviewSection title="예산 & 일정" icon={Wallet} onEdit={() => onJump(2)}>
        <Row label="총 예산" value={<span className="text-ube-bright">{formatBudget(data.totalBudget)}</span>} />
        <Row label="모집 시작" value={data.recruitStart} />
        <Row label="모집 마감" value={data.recruitEnd} />
        <Row label="제출 마감" value={data.submitDeadline} />
        <Row label="정산 지급 기한" value={`승인 후 ${data.payoutDays}일 이내`} />
      </ReviewSection>

      <ReviewSection title="미션 & 단가" icon={ListChecks} onEdit={() => onJump(3)}>
        {enabledMissions.length === 0 ? (
          <p className="text-sm text-text-secondary">활성화된 미션이 없습니다.</p>
        ) : (
          enabledMissions.map((id) => {
            const m = data.missions[id];
            return (
              <div key={id} className="py-2 border-b border-white/[0.06] last:border-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-text-primary">
                    {MISSIONS_META[id].label}
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    {MISSIONS_META[id].description}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {TIERS.map((t) => (
                    <div
                      key={t}
                      className="flex flex-col items-center bg-bg-elevated rounded-md py-1.5 border border-white/[0.06]"
                    >
                      <span className="text-[10px] uppercase text-text-muted">{t}</span>
                      <span className="text-text-primary tabular-nums">
                        {m.rates[t] > 0 ? formatRate(m.rates[t]) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </ReviewSection>

      <ReviewSection title="브리프" icon={FileText} onEdit={() => onJump(4)}>
        <Row
          label="메시지"
          value={
            data.brief.trim() ? (
              <span className="block whitespace-pre-wrap text-text-primary">{data.brief}</span>
            ) : (
              <span className="text-text-secondary">— 아직 작성되지 않음</span>
            )
          }
        />
        <Row
          label="해시태그"
          value={
            data.hashtags.length > 0 ? (
              <span className="flex flex-wrap gap-1">
                {data.hashtags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] text-ube-bright bg-ube/15 border border-ube/30"
                  >
                    {t}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-text-secondary">—</span>
            )
          }
        />
        <div className="grid grid-cols-[160px_1fr] items-start gap-3 py-1.5">
          <span className="text-xs text-text-secondary">가이드라인</span>
          <ul className="flex flex-col gap-1 text-sm">
            {GUIDELINES.map((g) => {
              const checked = data.guidelines[g.id];
              return (
                <li key={g.id} className="inline-flex items-start gap-2">
                  <span
                    className={[
                      'mt-0.5 inline-flex w-3.5 h-3.5 rounded items-center justify-center shrink-0',
                      checked ? 'bg-ube text-white' : 'border border-white/30 text-transparent',
                    ].join(' ')}
                    aria-hidden
                  >
                    <Check size={9} />
                  </span>
                  <span className={checked ? 'text-text-primary' : 'text-text-muted line-through'}>
                    {g.title}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </ReviewSection>

      <ConfirmBox
        amount={data.totalBudget}
        days={data.payoutDays}
        confirmed={confirmed}
        onConfirm={onConfirm}
      />
    </div>
  );
}

function ConfirmBox({
  amount,
  days,
  confirmed,
  onConfirm,
}: {
  amount: number;
  days: number;
  confirmed: boolean;
  onConfirm: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onConfirm(!confirmed)}
      aria-pressed={confirmed}
      className="text-left rounded-lg p-4 border border-ube/30 flex items-start gap-3 hover:border-ube transition-colors duration-150 ease-out cursor-pointer"
      style={{ background: 'var(--ube-tint)' }}
    >
      <span
        aria-hidden
        className={[
          'mt-0.5 inline-flex w-[18px] h-[18px] rounded items-center justify-center shrink-0 transition-colors duration-150 ease-out',
          confirmed ? 'bg-ube text-white' : 'border border-white/30',
        ].join(' ')}
      >
        {confirmed && <Check size={11} aria-hidden />}
      </span>
      <span className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-sm font-medium text-ube-bright leading-tight">
          {formatBudget(amount)}을(를) 에스크로에 예치하는 데 동의합니다.
        </span>
        <span className="text-[11px] text-ube-bright/85">
          승인 {days}일 후 크리에이터에게 자동으로 지급됩니다. 플랫폼 수수료는 15%입니다.
        </span>
      </span>
    </button>
  );
}
