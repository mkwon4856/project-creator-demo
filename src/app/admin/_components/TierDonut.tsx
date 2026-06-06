'use client';

import { CREATOR_TIERS, type CreatorTierKey } from '@/lib/mockAdmin';

import { Panel } from './Panel';

const RADIUS = 40;
const STROKE = 14;
const CIRC = 2 * Math.PI * RADIUS;

export type TierCounts = Record<CreatorTierKey, number>;

export interface TierDonutProps {
  /** Per-tier creator counts. If undefined, falls back to mock. */
  tierCounts?: TierCounts;
}

export function TierDonut({ tierCounts }: TierDonutProps = {}) {
  // If tierCounts is provided but everything is zero, use mock as a fallback so the
  // donut doesn't render as a flat circle in an empty demo DB.
  const useDb =
    tierCounts !== undefined &&
    Object.values(tierCounts).some((n) => n > 0);

  const buckets = CREATOR_TIERS.map((t) => ({
    tier: t.tier,
    label: t.label,
    color: t.color,
    count: useDb ? tierCounts![t.tier] : t.count,
  }));

  const total = buckets.reduce((sum, t) => sum + t.count, 0);
  const safeTotal = total === 0 ? 1 : total;

  let offset = 0;
  const segments = buckets.map((t) => {
    const ratio = t.count / safeTotal;
    const length = ratio * CIRC;
    const seg = {
      tier: t.tier,
      color: t.color,
      length,
      offset,
    };
    offset += length;
    return seg;
  });

  return (
    <Panel title="티어별 크리에이터" ctaHref="/admin/creators" cta="전체 보기">
      <div className="flex items-center gap-6">
        <svg
          viewBox="0 0 100 100"
          width={120}
          height={120}
          role="img"
          aria-label="티어별 크리에이터 — 도넛 차트"
          className="shrink-0 -rotate-90"
        >
          <circle
            cx={50}
            cy={50}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={STROKE}
          />
          {segments.map((s) => (
            <circle
              key={s.tier}
              cx={50}
              cy={50}
              r={RADIUS}
              fill="none"
              stroke={s.color}
              strokeWidth={STROKE}
              strokeDasharray={`${s.length} ${CIRC - s.length}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
            />
          ))}
          <g className="rotate-90 origin-center">
            <text
              x={50}
              y={47}
              textAnchor="middle"
              fontSize="9"
              fill="#A1A1AA"
              transform="rotate(90 50 50)"
            >
              합계
            </text>
            <text
              x={50}
              y={59}
              textAnchor="middle"
              fontSize="14"
              fontWeight={500}
              fill="#F4F4F5"
              transform="rotate(90 50 50)"
            >
              {total.toLocaleString()}
            </text>
          </g>
        </svg>

        <ul className="flex flex-col gap-2.5 flex-1 min-w-0">
          {buckets.map((t) => (
            <li key={t.tier} className="flex items-center gap-2.5 text-xs">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: t.color }}
                aria-hidden
              />
              <span className="text-text-secondary truncate">
                {t.tier}티어 <span className="text-text-muted">({t.label})</span>
              </span>
              <span className="ml-auto font-medium tabular-nums text-text-primary">
                {t.count}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
