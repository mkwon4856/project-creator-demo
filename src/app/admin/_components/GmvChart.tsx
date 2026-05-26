'use client';

import { GMV_HISTORY } from '@/lib/mockAdmin';

import { Panel } from './Panel';

const VIEW_W = 600;
const VIEW_H = 200;
const PAD_X = 50;
const PAD_TOP = 40;
const PAD_BOTTOM = 20;
const CHART_H = VIEW_H - PAD_TOP - PAD_BOTTOM; // 140
const Y_MAX = 40_000_000;

function xFor(i: number, n: number): number {
  if (n <= 1) return PAD_X;
  const step = (VIEW_W - PAD_X * 2) / (n - 1);
  return PAD_X + i * step;
}

function yFor(value: number): number {
  const ratio = Math.min(1, value / Y_MAX);
  return PAD_TOP + (1 - ratio) * CHART_H;
}

function buildLinePath(values: number[]): string {
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i, values.length).toFixed(1)} ${yFor(v).toFixed(1)}`)
    .join(' ');
}

function buildAreaPath(values: number[]): string {
  const top = buildLinePath(values);
  const lastX = xFor(values.length - 1, values.length);
  const baseY = PAD_TOP + CHART_H;
  return `${top} L ${lastX.toFixed(1)} ${baseY} L ${PAD_X} ${baseY} Z`;
}

export function GmvChart() {
  const months = GMV_HISTORY.map((p) => p.month);
  const gmv = GMV_HISTORY.map((p) => p.gmv);
  const fee = GMV_HISTORY.map((p) => p.fee);

  const gridLines = [10_000_000, 20_000_000, 30_000_000, 40_000_000];

  return (
    <Panel title="GMV growth — last 6 months" ctaHref="/admin/revenue" cta="Full report">
      <div className="flex items-center gap-4 text-[11px] text-text-secondary mb-4">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-ube" aria-hidden />
          GMV
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block w-4 h-px"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #C4A8D8 50%, transparent 50%)',
              backgroundSize: '4px 1px',
            }}
          />
          Platform fee
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        height={VIEW_H}
        role="img"
        aria-label="GMV growth chart over the last 6 months"
        className="block"
      >
        <defs>
          <linearGradient id="gmv-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B7EC8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#9B7EC8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g) => (
          <g key={g}>
            <line
              x1={PAD_X}
              x2={VIEW_W - PAD_X / 2}
              y1={yFor(g)}
              y2={yFor(g)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
            <text
              x={PAD_X - 8}
              y={yFor(g) + 3}
              fontSize="10"
              fill="#71717A"
              textAnchor="end"
            >
              ₩{g / 1_000_000}M
            </text>
          </g>
        ))}

        <path d={buildAreaPath(gmv)} fill="url(#gmv-area)" />
        <path
          d={buildLinePath(gmv)}
          fill="none"
          stroke="#9B7EC8"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={buildLinePath(fee)}
          fill="none"
          stroke="#C4A8D8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        {gmv.map((v, i) => (
          <circle
            key={`gmv-${i}`}
            cx={xFor(i, gmv.length)}
            cy={yFor(v)}
            r={3}
            fill="#0A0A0F"
            stroke="#B89AD8"
            strokeWidth={1.5}
          />
        ))}

        {months.map((m, i) => (
          <text
            key={m}
            x={xFor(i, months.length)}
            y={VIEW_H - 4}
            textAnchor="middle"
            fontSize="10"
            fill="#71717A"
          >
            {m}
          </text>
        ))}
      </svg>
    </Panel>
  );
}
