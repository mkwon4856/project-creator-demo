'use client';



import { Panel } from './Panel';



const VIEW_W = 600;

const VIEW_H = 200;

const PAD_X = 50;

const PAD_TOP = 40;

const PAD_BOTTOM = 20;

const CHART_H = VIEW_H - PAD_TOP - PAD_BOTTOM; // 140



export interface GmvDataPoint {

  month: string;

  gmv: number;

  fee: number;

}



export interface GmvChartProps {

  /** Monthly GMV series (oldest first, newest last). */

  monthlyData?: GmvDataPoint[];

}



function xFor(i: number, n: number): number {

  if (n <= 1) return PAD_X;

  const step = (VIEW_W - PAD_X * 2) / (n - 1);

  return PAD_X + i * step;

}



function yFor(value: number, yMax: number): number {

  if (yMax <= 0) return PAD_TOP + CHART_H;

  const ratio = Math.min(1, value / yMax);

  return PAD_TOP + (1 - ratio) * CHART_H;

}



function buildLinePath(values: number[], yMax: number): string {

  return values

    .map(

      (v, i) =>

        `${i === 0 ? 'M' : 'L'} ${xFor(i, values.length).toFixed(1)} ${yFor(v, yMax).toFixed(1)}`,

    )

    .join(' ');

}



function buildAreaPath(values: number[], yMax: number): string {

  const top = buildLinePath(values, yMax);

  const lastX = xFor(values.length - 1, values.length);

  const baseY = PAD_TOP + CHART_H;

  return `${top} L ${lastX.toFixed(1)} ${baseY} L ${PAD_X} ${baseY} Z`;

}



function niceCeil(value: number): number {

  if (value <= 0) return 1_000_000;

  const exp = Math.floor(Math.log10(value));

  const step = Math.pow(10, exp);

  return Math.ceil(value / step) * step;

}



function buildGridLines(yMax: number): number[] {

  if (yMax <= 0) return [];

  const step = yMax / 4;

  return [step, step * 2, step * 3, step * 4];

}



function formatTick(value: number): string {

  if (value >= 100_000_000) return `₩${(value / 100_000_000).toFixed(1)}억`;

  if (value >= 1_000_000) {

    const m = value / 1_000_000;

    return `₩${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;

  }

  if (value >= 10_000) return `₩${(value / 10_000).toFixed(0)}만`;

  return `₩${value.toLocaleString()}`;

}



function emptyMonthlySeries(): GmvDataPoint[] {

  const now = new Date();

  const months: GmvDataPoint[] = [];

  for (let i = 5; i >= 0; i -= 1) {

    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

    months.push({

      month: d.toLocaleDateString('ko-KR', { month: 'short' }),

      gmv: 0,

      fee: 0,

    });

  }

  return months;

}



export function GmvChart({ monthlyData }: GmvChartProps = {}) {

  const source: GmvDataPoint[] =

    monthlyData && monthlyData.length > 0 ? monthlyData : emptyMonthlySeries();



  const months = source.map((p) => p.month);

  const gmv = source.map((p) => p.gmv);

  const fee = source.map((p) => p.fee);



  const rawMax = Math.max(...gmv, ...fee, 0);

  const yMax = niceCeil(rawMax * 1.1);

  const gridLines = buildGridLines(yMax);



  return (

    <Panel title="GMV 추이 — 최근 6개월" ctaHref="/admin/revenue" cta="전체 보고서">

      <div className="flex items-center gap-4 text-[11px] text-text-secondary mb-4">

        <span className="inline-flex items-center gap-1.5">

          <span className="inline-block w-2 h-2 rounded-full bg-primary" aria-hidden />

          GMV

        </span>

        <span className="inline-flex items-center gap-1.5">

          <span

            aria-hidden

            className="inline-block w-4 h-px"

            style={{

              backgroundImage:

                'linear-gradient(90deg, var(--color-primary-hover) 50%, transparent 50%)',

              backgroundSize: '4px 1px',

            }}

          />

          플랫폼 수수료

        </span>

      </div>



      <svg

        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}

        width="100%"

        height={VIEW_H}

        role="img"

        aria-label="최근 6개월 GMV 추이 차트"

        className="block"

      >

        <defs>

          <linearGradient id="gmv-area" x1="0" y1="0" x2="0" y2="1">

            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />

            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />

          </linearGradient>

        </defs>



        {gridLines.map((g) => (

          <g key={g}>

            <line

              x1={PAD_X}

              x2={VIEW_W - PAD_X / 2}

              y1={yFor(g, yMax)}

              y2={yFor(g, yMax)}

              stroke="rgba(255,255,255,0.05)"

              strokeWidth={1}

            />

            <text

              x={PAD_X - 8}

              y={yFor(g, yMax) + 3}

              fontSize="10"

              fill="var(--color-text-muted)"

              textAnchor="end"

            >

              {formatTick(g)}

            </text>

          </g>

        ))}



        {rawMax > 0 && (

          <>

            <path d={buildAreaPath(gmv, yMax)} fill="url(#gmv-area)" />

            <path

              d={buildLinePath(gmv, yMax)}

              fill="none"

              stroke="var(--color-primary)"

              strokeWidth={2}

              strokeLinecap="round"

              strokeLinejoin="round"

            />

            <path

              d={buildLinePath(fee, yMax)}

              fill="none"

              stroke="var(--color-primary-hover)"

              strokeWidth={1.5}

              strokeDasharray="4 4"

            />

            {gmv.map((v, i) => (

              <circle

                key={`gmv-${i}`}

                cx={xFor(i, gmv.length)}

                cy={yFor(v, yMax)}

                r={3}

                fill="var(--color-bg)"

                stroke="var(--color-primary-hover)"

                strokeWidth={1.5}

              />

            ))}

          </>

        )}



        {months.map((m, i) => (

          <text

            key={`${m}-${i}`}

            x={xFor(i, months.length)}

            y={VIEW_H - 4}

            textAnchor="middle"

            fontSize="10"

            fill="var(--color-text-muted)"

          >

            {m}

          </text>

        ))}

      </svg>

    </Panel>

  );

}

