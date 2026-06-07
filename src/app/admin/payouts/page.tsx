'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Badge, Button, Card, Pill, statusToBadgeVariant, toast } from '@/components/ui';
import type { CreatorGrade, PaymentStatus } from '@/lib/db.types';
import { formatCompactKRW } from '@/lib/formatCurrency';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentProfile } from '@/lib/supabase/hooks';

import { getAdminSidebar } from '../_config/sidebar';
import { useAdminBadgeCounts } from '../_hooks/useAdminBadgeCounts';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const GRID =
  'grid-cols-[1fr_1.2fr_0.9fr_0.9fr_0.9fr_0.7fr_0.9fr_140px]';

type StatusFilter = 'all' | PaymentStatus;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'pending', label: '대기' },
  { id: 'completed', label: '완료' },
];

interface PayoutRow {
  id: string;
  amount: number;
  platformFee: number;
  status: PaymentStatus;
  paidAt: string | null;
  reward: number;
  creatorName: string;
  creatorGrade: CreatorGrade;
  campaignName: string;
  developer: string;
}

function formatDate(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: '대기',
  completed: '완료',
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={statusToBadgeVariant(status)} size="sm">
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Card variant={highlight ? 'featured' : 'default'} padding="lg">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <span
          className={[
            'text-2xl font-medium tracking-tight tabular-nums leading-tight',
            highlight ? 'text-primary' : 'text-text-primary',
          ].join(' ')}
        >
          {value}
        </span>
        {sub && <span className="text-xs text-text-secondary">{sub}</span>}
      </div>
    </Card>
  );
}

function HeaderRow() {
  return (
    <div
      role="row"
      className={`grid ${GRID} items-center gap-3 px-5 py-3 bg-bg-elevated text-xs font-medium text-text-secondary uppercase`}
    >
      <span>크리에이터</span>
      <span>캠페인</span>
      <span className="text-right">금액</span>
      <span className="text-right">수수료</span>
      <span className="text-right">실수령액</span>
      <span>상태</span>
      <span>날짜</span>
      <span className="text-right">작업</span>
    </div>
  );
}

function Row({
  item,
  last,
  busy,
  onMarkCompleted,
}: {
  item: PayoutRow;
  last: boolean;
  busy: boolean;
  onMarkCompleted: (id: string) => void;
}) {
  return (
    <div
      role="row"
      className={[
        `grid ${GRID} items-center gap-3 px-5 py-3 transition-colors duration-150 ease-out hover:bg-bg-hover`,
        last ? '' : 'border-b border-border',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-text-primary truncate">{item.creatorName}</span>
        <Badge variant="primary" size="sm">
          {item.creatorGrade}
        </Badge>
      </div>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">
          {item.campaignName}
        </span>
        <span className="text-[11px] text-text-secondary truncate">{item.developer}</span>
      </div>

      <span className="text-sm font-medium tabular-nums text-text-primary text-right">
        {formatCompactKRW(item.reward)}
      </span>

      <span className="text-sm tabular-nums text-success text-right">
        +{formatCompactKRW(item.platformFee)}
      </span>

      <span className="text-sm font-medium tabular-nums text-text-secondary text-right">
        {formatCompactKRW(item.amount)}
      </span>

      <StatusBadge status={item.status} />

      <span className="text-xs text-text-secondary tabular-nums">
        {formatDate(item.paidAt)}
      </span>

      <div className="flex items-center justify-end">
        {item.status === 'pending' ? (
          <Button
            variant="primary"
            size="sm"
            disabled={busy}
            onClick={() => onMarkCompleted(item.id)}
          >
            완료 처리
          </Button>
        ) : (
          <span className="text-[11px] text-text-muted">—</span>
        )}
      </div>
    </div>
  );
}

export default function AdminPayoutsPage() {
  const { data: profile, loading: profileLoading } = useCurrentProfile();
  const badgeCounts = useAdminBadgeCounts();
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchPayouts = useCallback(async () => {
    if (!HAS_SUPABASE_ENV) {
      setPayouts([]);
      setLoading(false);
      return;
    }
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from('payments')
      .select(
        `
        id, amount, platform_fee, status, paid_at,
        creators ( display_name, grade ),
        submissions (
          reward,
          campaigns ( name, developer )
        )
      `,
      )
      .order('paid_at', { ascending: false });

    if (error) {
      toast.error(`정산 조회 실패: ${error.message}`);
      setPayouts([]);
      setLoading(false);
      return;
    }

    const rows: PayoutRow[] = (data ?? []).map((p) => {
      const raw = p as unknown as {
        id: string;
        amount: number;
        platform_fee: number;
        status: PaymentStatus;
        paid_at: string | null;
        creators:
          | { display_name?: string; grade?: string | null }
          | { display_name?: string; grade?: string | null }[]
          | null;
        submissions:
          | {
              reward?: number;
              campaigns:
                | { name?: string; developer?: string }
                | { name?: string; developer?: string }[]
                | null;
            }
          | {
              reward?: number;
              campaigns: unknown;
            }[]
          | null;
      };

      const creator = Array.isArray(raw.creators) ? raw.creators[0] : raw.creators;
      const submission = Array.isArray(raw.submissions)
        ? raw.submissions[0]
        : raw.submissions;
      const campaign = submission
        ? Array.isArray((submission as { campaigns?: unknown }).campaigns)
          ? ((submission as { campaigns: { name?: string; developer?: string }[] })
              .campaigns[0])
          : ((submission as { campaigns: { name?: string; developer?: string } | null })
              .campaigns)
        : null;

      const grade = (creator?.grade as CreatorGrade | undefined) ?? 'E';

      return {
        id: raw.id,
        amount: raw.amount,
        platformFee: raw.platform_fee,
        status: raw.status,
        paidAt: raw.paid_at,
        reward:
          (submission as { reward?: number } | null)?.reward ??
          raw.amount + raw.platform_fee,
        creatorName: creator?.display_name ?? '알 수 없음',
        creatorGrade: grade,
        campaignName: campaign?.name ?? '알 수 없는 캠페인',
        developer: campaign?.developer ?? '',
      };
    });
    setPayouts(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchPayouts();
  }, [fetchPayouts]);

  const summary = useMemo(() => {
    const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
    const platformRevenue = payouts.reduce((sum, p) => sum + p.platformFee, 0);
    const pending = payouts.filter((p) => p.status === 'pending').length;
    const completed = payouts.filter((p) => p.status === 'completed').length;
    return { totalPayouts, platformRevenue, pending, completed };
  }, [payouts]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: payouts.length,
      pending: summary.pending,
      completed: summary.completed,
    };
    return c;
  }, [payouts, summary]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return payouts;
    return payouts.filter((p) => p.status === statusFilter);
  }, [payouts, statusFilter]);

  const handleMarkCompleted = async (paymentId: string) => {
    setBusyId(paymentId);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString(),
        })
        .eq('id', paymentId);
      if (error) {
        toast.error(`상태 변경 실패: ${error.message}`);
        return;
      }
      toast.success('정산이 완료 처리되었습니다');
      await fetchPayouts();
    } catch (err) {
      console.error('[ADMIN PAYOUTS] catch error:', err);
      toast.error(
        `오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setBusyId(null);
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">불러오는 중…</span>
      </div>
    );
  }

  const adminName = profile?.name?.trim() || '민석';
  const initials = adminName.slice(0, 2).toUpperCase();

  return (
    <WorkspaceLayout
      persona="admin"
      userName={adminName}
      userAvatar={initials}
      userBadge="관리자"
      sidebarSections={getAdminSidebar('payouts', {
        review: badgeCounts.review,
        payouts: badgeCounts.payouts,
      })}
      notificationCount={badgeCounts.notification}
    >
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
          관리자 · 정산 지급
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          정산 지급
        </h1>
        <p className="text-sm text-text-secondary mt-1">플랫폼 정산 관리</p>
      </header>

      <section className="mb-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="총 지급액"
          value={formatCompactKRW(summary.totalPayouts)}
          sub="크리에이터 지급"
        />
        <SummaryCard
          label="플랫폼 매출"
          value={formatCompactKRW(summary.platformRevenue)}
          sub="15% 수수료"
          highlight
        />
        <SummaryCard
          label="대기"
          value={summary.pending.toString()}
          sub="지급 대기"
        />
        <SummaryCard
          label="완료"
          value={summary.completed.toString()}
          sub="처리된 결제"
        />
      </section>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        {STATUS_FILTERS.map((f) => (
          <Pill
            key={f.id}
            variant={statusFilter === f.id ? 'active' : 'default'}
            onClick={() => setStatusFilter(f.id)}
          >
            {f.label}
            <span
              className={[
                'ml-1.5 tabular-nums',
                statusFilter === f.id ? 'text-white/70' : 'text-text-muted',
              ].join(' ')}
            >
              {counts[f.id]}
            </span>
          </Pill>
        ))}
      </div>

      <Card padding="none" className="overflow-hidden mb-12">
        <HeaderRow />
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-text-primary mb-1">
              {payouts.length === 0
                ? '아직 정산 내역이 없습니다.'
                : '필터에 맞는 정산 내역이 없습니다.'}
            </p>
            <p className="text-xs text-text-secondary">
              {payouts.length === 0
                ? '콘텐츠가 승인되면 정산 내역이 표시됩니다.'
                : '다른 상태 필터를 시도해 보세요.'}
            </p>
          </div>
        ) : (
          filtered.map((item, i) => (
            <Row
              key={item.id}
              item={item}
              last={i === filtered.length - 1}
              busy={busyId === item.id}
              onMarkCompleted={handleMarkCompleted}
            />
          ))
        )}
      </Card>
    </WorkspaceLayout>
  );
}
