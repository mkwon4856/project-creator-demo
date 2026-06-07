'use client';



import { Panel } from './Panel';



const RADIUS = 40;

const STROKE = 14;

const CIRC = 2 * Math.PI * RADIUS;



export type CreatorTierKey = 'A' | 'B' | 'C' | 'D' | 'E';

export type TierCounts = Record<CreatorTierKey, number>;



const TIER_BUCKETS: ReadonlyArray<{

  tier: CreatorTierKey;

  label: string;

  color: string;

}> = [

  { tier: 'A', label: '500K+', color: '#5C4A9A' },

  { tier: 'B', label: '100K~', color: '#7C6AE8' },

  { tier: 'C', label: '30K~', color: '#A78BFA' },

  { tier: 'D', label: '10K~', color: '#B89FFC' },

  { tier: 'E', label: '5K~', color: '#DDD6FE' },

];



const EMPTY_TIER_COUNTS: TierCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };



export interface TierDonutProps {

  /** Per-tier creator counts from Supabase. */

  tierCounts?: TierCounts;

}



export function TierDonut({ tierCounts }: TierDonutProps = {}) {

  const counts = tierCounts ?? EMPTY_TIER_COUNTS;



  const buckets = TIER_BUCKETS.map((t) => ({

    tier: t.tier,

    label: t.label,

    color: t.color,

    count: counts[t.tier],

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

          {total > 0 &&

            segments.map((s) => (

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

              fill="var(--color-text-secondary)"

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

              fill="var(--color-text-primary)"

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

