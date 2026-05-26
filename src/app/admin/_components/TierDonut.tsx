'use client';

import { CREATOR_TIERS } from '@/lib/mockAdmin';

import { Panel } from './Panel';

const RADIUS = 40;
const STROKE = 14;
const CIRC = 2 * Math.PI * RADIUS;

export function TierDonut() {
  const total = CREATOR_TIERS.reduce((sum, t) => sum + t.count, 0);

  let offset = 0;
  const segments = CREATOR_TIERS.map((t) => {
    const ratio = t.count / total;
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
    <Panel title="Creators by tier" ctaHref="/admin/creators" cta="View all">
      <div className="flex items-center gap-6">
        <svg
          viewBox="0 0 100 100"
          width={120}
          height={120}
          role="img"
          aria-label="Creators by tier — donut chart"
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
              Total
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
          {CREATOR_TIERS.map((t) => (
            <li key={t.tier} className="flex items-center gap-2.5 text-xs">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: t.color }}
                aria-hidden
              />
              <span className="text-text-secondary truncate">
                {t.tier}-tier <span className="text-text-muted">({t.label})</span>
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
