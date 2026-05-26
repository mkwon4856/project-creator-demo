'use client';

import { Film, Radio, Video, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Card, Pill, toast } from '@/components/ui';
import type {
  MissionType,
  PaymentRow,
  SubmissionStatus,
} from '@/lib/db.types';
import { formatCompactKRW } from '@/lib/mockAdmin';
import { CURRENT_CREATOR } from '@/lib/mockCreators';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentCreator } from '@/lib/supabase/hooks';

import { EarningsOverview } from '../_components/EarningsOverview';
import { getCreatorSidebar } from '../_config/sidebar';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const PLATFORM_FEE_RATE = 0.15;

const GRID =
  'grid-cols-[1.5fr_0.9fr_0.8fr_0.8fr_0.9fr_0.9fr_0.9fr_0.9fr]';

const MISSION_META: Record<MissionType, { label: string; icon: LucideIcon }> = {
  shortform: { label: 'Shortform', icon: Film },
  longform: { label: 'Longform', icon: Video },
  live: { label: 'Live', icon: Radio },
};

interface EarningRow {
  id: string;
  status: SubmissionStatus;
  reward: number;
  submittedAt: string | null;
  reviewedAt: string | null;
  campaignName: string;
  developer: string;
  mission: MissionType;
}

interface MonthBucket {
  key: string;
  label: string;
  amount: number;
}

function formatShortDate(s: string | null): string {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function StatusPill({ status }: { status: SubmissionStatus }) {
  if (status === 'making') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none border bg-bg-hover text-text-secondary border-white/10 whitespace-nowrap">
        제작 중
      </span>
    );
  }
  if (status === 'review') {
    return (
      <Pill variant="status" status="review" size="sm">
        검수 중
      </Pill>
    );
  }
  if (status === 'approved') {
    return (
      <Pill variant="status" status="live" size="sm">
        승인됨
      </Pill>
    );
  }
  if (status === 'paid') {
    return (
      <Pill variant="status" status="paid" size="sm">
        정산 완료
      </Pill>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none border bg-red-500/15 text-red-400 border-red-500/30 whitespace-nowrap">
      거절됨
    </span>
  );
}

function MonthlyChart({ data }: { data: MonthBucket[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-3 h-48 px-2">
      {data.map((m) => {
        const heightPct = max > 0 ? (m.amount / max) * 100 : 0;
        return (
          <div key={m.key} className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <span className="text-[10px] text-text-secondary tabular-nums">
              {m.amount > 0 ? formatCompactKRW(m.amount) : '—'}
            </span>
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-sm transition-[height] duration-500 ease-out"
                style={{
                  height: `${Math.max(heightPct, m.amount > 0 ? 4 : 0)}%`,
                  background:
                    m.amount > 0
                      ? 'linear-gradient(180deg, var(--ube-bright), var(--ube))'
                      : 'rgba(255,255,255,0.04)',
                  minHeight: m.amount > 0 ? '4px' : '0',
                }}
              />
            </div>
            <span className="text-[11px] text-text-muted">{m.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function HeaderRow() {
  return (
    <div
      role="row"
      className={`grid ${GRID} items-center gap-3 px-5 py-3 bg-bg-elevated text-[11px] uppercase tracking-wider text-text-secondary`}
    >
      <span>Campaign</span>
      <span>Mission</span>
      <span>Submitted</span>
      <span>Approved</span>
      <span className="text-right">Amount</span>
      <span className="text-right">Fee (15%)</span>
      <span className="text-right">Net</span>
      <span>Status</span>
    </div>
  );
}

function Row({
  item,
  last,
  fee,
  net,
}: {
  item: EarningRow;
  last: boolean;
  fee: number;
  net: number;
}) {
  const meta = MISSION_META[item.mission];
  const Icon = meta.icon;

  return (
    <div
      role="row"
      className={[
        `grid ${GRID} items-center gap-3 px-5 py-3 transition-colors duration-150 ease-out hover:bg-bg-hover`,
        last ? '' : 'border-b border-white/[0.06]',
      ].join(' ')}
    >
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">
          {item.campaignName}
        </span>
        <span className="text-[11px] text-text-secondary truncate">{item.developer}</span>
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
        <Icon size={12} aria-hidden />
        {meta.label}
      </span>

      <span className="text-xs text-text-secondary">{formatShortDate(item.submittedAt)}</span>
      <span className="text-xs text-text-secondary">{formatShortDate(item.reviewedAt)}</span>

      <span className="text-sm font-medium tabular-nums text-text-primary text-right">
        {formatCompactKRW(item.reward)}
      </span>
      <span className="text-sm tabular-nums text-text-secondary text-right">
        −{formatCompactKRW(fee)}
      </span>
      <span
        className={[
          'text-sm font-medium tabular-nums text-right',
          item.status === 'paid' ? 'text-green-400' : 'text-text-primary',
        ].join(' ')}
      >
        {formatCompactKRW(net)}
      </span>

      <StatusPill status={item.status} />
    </div>
  );
}

export default function CreatorEarningsPage() {
  const { data: creator, loading: creatorLoading } = useCurrentCreator();
  const [rows, setRows] = useState<EarningRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = useCallback(async () => {
    if (!HAS_SUPABASE_ENV || !creator) {
      setRows([]);
      setPayments([]);
      setLoading(false);
      return;
    }
    const supabase = createBrowserSupabaseClient();

    const [submissionsRes, paymentsRes] = await Promise.all([
      supabase
        .from('submissions')
        .select(
          `
          id,
          status,
          reward,
          submitted_at,
          reviewed_at,
          campaigns ( name, developer ),
          applications ( missions ( type ) )
        `,
        )
        .eq('creator_id', creator.id)
        .order('submitted_at', { ascending: false }),
      supabase
        .from('payments')
        .select('*')
        .eq('creator_id', creator.id)
        .order('paid_at', { ascending: false }),
    ]);

    if (submissionsRes.error) {
      toast.error(`정산 내역 조회 실패: ${submissionsRes.error.message}`);
    }
    if (paymentsRes.error) {
      toast.error(`정산 기록 조회 실패: ${paymentsRes.error.message}`);
    }

    const subs = submissionsRes.data ?? [];
    const mapped: EarningRow[] = subs.map((s) => {
      const raw = s as unknown as {
        id: string;
        status: SubmissionStatus;
        reward: number;
        submitted_at: string | null;
        reviewed_at: string | null;
        campaigns:
          | { name?: string; developer?: string }
          | { name?: string; developer?: string }[]
          | null;
        applications:
          | { missions: { type?: string | null } | { type?: string | null }[] | null }
          | { missions: { type?: string | null } | { type?: string | null }[] | null }[]
          | null;
      };

      const campaign = Array.isArray(raw.campaigns) ? raw.campaigns[0] : raw.campaigns;
      const application = Array.isArray(raw.applications)
        ? raw.applications[0]
        : raw.applications;
      const mission =
        application && application.missions
          ? Array.isArray(application.missions)
            ? application.missions[0]
            : application.missions
          : null;

      const missionType: MissionType =
        mission?.type === 'shortform' ||
        mission?.type === 'longform' ||
        mission?.type === 'live'
          ? (mission.type as MissionType)
          : 'shortform';

      return {
        id: raw.id,
        status: raw.status,
        reward: raw.reward,
        submittedAt: raw.submitted_at,
        reviewedAt: raw.reviewed_at,
        campaignName: campaign?.name ?? 'Unknown campaign',
        developer: campaign?.developer ?? '',
        mission: missionType,
      };
    });

    setRows(mapped);
    setPayments(paymentsRes.data ?? []);
    setLoading(false);
  }, [creator]);

  useEffect(() => {
    if (creatorLoading) return;
    void fetchEarnings();
  }, [creatorLoading, fetchEarnings]);

  // submission_id → payment lookup (정확한 platform_fee 사용)
  const paymentBySubmission = useMemo(() => {
    const map = new Map<string, PaymentRow>();
    for (const p of payments) map.set(p.submission_id, p);
    return map;
  }, [payments]);

  // 월별 차트 데이터 — paid 시점(`paid_at`) 기준 최근 6개월.
  const monthlyData = useMemo<MonthBucket[]>(() => {
    const buckets: MonthBucket[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        amount: 0,
      });
    }
    for (const p of payments) {
      if (!p.paid_at) continue;
      const pd = new Date(p.paid_at);
      const key = `${pd.getFullYear()}-${pd.getMonth()}`;
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.amount += p.amount;
    }
    return buckets;
  }, [payments]);

  if (creatorLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">Loading…</span>
      </div>
    );
  }

  const userName = creator?.display_name || CURRENT_CREATOR.name;
  const userAvatar = CURRENT_CREATOR.emoji;
  const userBadge = `${creator?.grade ?? CURRENT_CREATOR.grade}-tier`;

  return (
    <WorkspaceLayout
      persona="creator"
      userName={userName}
      userAvatar={userAvatar}
      userBadge={userBadge}
      sidebarSections={getCreatorSidebar('earnings')}
    >
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ube-bright">
          Creator · Earnings
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          Earnings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Track your income from campaigns
        </p>
      </header>

      {!creator && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-xs text-amber-300 mb-6">
          크리에이터 프로필이 없습니다. 회원가입 시 role을 <code>creator</code>로 선택해야
          이 페이지가 작동합니다.
        </div>
      )}

      <section className="mb-9">
        <EarningsOverview />
      </section>

      <section className="mb-9">
        <div className="flex items-end justify-between gap-3 mb-4">
          <h2 className="text-base font-medium text-text-primary leading-tight">
            Monthly earnings
          </h2>
          <span className="text-[11px] text-text-secondary">Last 6 months · paid only</span>
        </div>
        <Card variant="default" padding="lg">
          <MonthlyChart data={monthlyData} />
        </Card>
      </section>

      <section className="mb-12">
        <div className="flex items-end justify-between gap-3 mb-4">
          <h2 className="text-base font-medium text-text-primary leading-tight">
            Settlement history
          </h2>
          <span className="text-[11px] text-text-secondary tabular-nums">
            {rows.length} {rows.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-bg-card">
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <HeaderRow />
              {rows.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <p className="text-sm text-text-primary mb-1">No earnings yet.</p>
                  <p className="text-xs text-text-secondary">
                    Apply to a campaign and submit content to start earning.
                  </p>
                </div>
              ) : (
                rows.map((item, i) => {
                  const payment = paymentBySubmission.get(item.id);
                  // 실제 payments row가 있으면 그 수치를, 없으면 15% 가정으로 추정.
                  const fee = payment
                    ? payment.platform_fee
                    : Math.round(item.reward * PLATFORM_FEE_RATE);
                  const net = payment ? payment.amount : item.reward - fee;
                  return (
                    <Row
                      key={item.id}
                      item={item}
                      last={i === rows.length - 1}
                      fee={fee}
                      net={net}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </WorkspaceLayout>
  );
}
