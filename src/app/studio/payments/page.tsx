'use client';

import { Film, Radio, Video, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Alert, Badge, Card, statusToBadgeVariant, toast } from '@/components/ui';
import type {
  CampaignStatus,
  Grade,
  ContentType,
  PaymentStatus,
} from '@/lib/db.types';
import { formatCompactKRW } from '@/lib/formatCurrency';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentStudio } from '@/lib/supabase/hooks';

import { getStudioSidebar } from '../_config/sidebar';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const GRID =
  'grid-cols-[1.3fr_1fr_0.7fr_0.9fr_0.9fr_0.9fr_0.7fr_0.8fr]';

const MISSION_META: Record<ContentType, { label: string; icon: LucideIcon }> = {
  shortform: { label: '숏폼', icon: Film },
  longform: { label: '롱폼', icon: Video },
  live: { label: '라이브', icon: Radio },
};

interface PaymentRow {
  id: string;
  amount: number;
  platformFee: number;
  status: PaymentStatus;
  paidAt: string | null;
  reward: number;
  campaignName: string;
  creatorName: string;
  creatorGrade: Grade;
  mission: ContentType;
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
  processing: '처리 중',
  completed: '완료',
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={statusToBadgeVariant(status)} size="sm">
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

function HeaderRow() {
  return (
    <div
      role="row"
      className={`grid ${GRID} items-center gap-3 px-5 py-3 bg-bg-elevated text-xs font-medium text-text-secondary uppercase`}
    >
      <span>캠페인</span>
      <span>크리에이터</span>
      <span>미션</span>
      <span className="text-right">금액</span>
      <span className="text-right">수수료</span>
      <span className="text-right">실수령</span>
      <span>상태</span>
      <span>날짜</span>
    </div>
  );
}

function Row({ item, last }: { item: PaymentRow; last: boolean }) {
  const meta = MISSION_META[item.mission];
  const Icon = meta.icon;

  return (
    <div
      role="row"
      className={[
        `grid ${GRID} items-center gap-3 px-5 py-3 transition-colors duration-150 ease-out hover:bg-bg-hover`,
        last ? '' : 'border-b border-border',
      ].join(' ')}
    >
      <span className="text-sm font-medium text-text-primary truncate">
        {item.campaignName}
      </span>

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-text-primary truncate">{item.creatorName}</span>
        <Badge variant="primary" size="sm">
          {item.creatorGrade}
        </Badge>
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
        <Icon size={12} aria-hidden />
        {meta.label}
      </span>

      <span className="text-sm font-medium tabular-nums text-text-primary text-right">
        {formatCompactKRW(item.reward)}
      </span>

      <span className="text-sm tabular-nums text-text-secondary text-right">
        −{formatCompactKRW(item.platformFee)}
      </span>

      <span className="text-sm font-medium tabular-nums text-success text-right">
        {formatCompactKRW(item.amount)}
      </span>

      <StatusBadge status={item.status} />

      <span className="text-xs text-text-secondary tabular-nums">
        {formatDate(item.paidAt)}
      </span>
    </div>
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

export default function StudioPaymentsPage() {
  const { data: studio, loading: studioLoading } = useCurrentStudio();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [campaignsSummary, setCampaignsSummary] = useState<{
    totalSpent: number;
    activeCampaigns: number;
  }>({ totalSpent: 0, activeCampaigns: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!HAS_SUPABASE_ENV || !studio) {
      setPayments([]);
      setCampaignsSummary({ totalSpent: 0, activeCampaigns: 0 });
      setLoading(false);
      return;
    }
    const supabase = createBrowserSupabaseClient();

    const [paymentsRes, campaignsRes] = await Promise.all([
      supabase
        .from('payments')
        .select(
          `
          id, amount, platform_fee, status, paid_at,
          submissions!inner (
            reward,
            campaigns!inner ( name, developer, studio_id ),
            creators ( display_name, grade ),
            applications ( missions ( type ) )
          )
        `,
        )
        .eq('submissions.campaigns.studio_id', studio.id)
        .order('paid_at', { ascending: false }),
      supabase
        .from('campaigns')
        .select('id, spent_budget, status')
        .eq('studio_id', studio.id),
    ]);

    if (paymentsRes.error) {
      toast.error(`정산 내역 조회 실패: ${paymentsRes.error.message}`);
    }
    if (campaignsRes.error) {
      toast.error(`캠페인 조회 실패: ${campaignsRes.error.message}`);
    }

    const rows: PaymentRow[] = (paymentsRes.data ?? []).map((p) => {
      const raw = p as unknown as {
        id: string;
        amount: number;
        platform_fee: number;
        status: PaymentStatus;
        paid_at: string | null;
        submissions:
          | {
              reward?: number;
              campaigns:
                | { name?: string; developer?: string }
                | { name?: string; developer?: string }[]
                | null;
              creators:
                | { display_name?: string; grade?: string | null }
                | { display_name?: string; grade?: string | null }[]
                | null;
              applications:
                | {
                    missions:
                      | { type?: string | null }
                      | { type?: string | null }[]
                      | null;
                  }
                | {
                    missions:
                      | { type?: string | null }
                      | { type?: string | null }[]
                      | null;
                  }[]
                | null;
            }
          | {
              reward?: number;
              campaigns: unknown;
              creators: unknown;
              applications: unknown;
            }[]
          | null;
      };

      const submission = Array.isArray(raw.submissions)
        ? raw.submissions[0]
        : raw.submissions;
      const campaign = submission
        ? Array.isArray(submission.campaigns)
          ? submission.campaigns[0]
          : submission.campaigns
        : null;
      const creator = submission
        ? Array.isArray(submission.creators)
          ? submission.creators[0]
          : submission.creators
        : null;
      const application = submission
        ? Array.isArray(submission.applications)
          ? submission.applications[0]
          : submission.applications
        : null;
      const mission =
        application && (application as { missions?: unknown }).missions
          ? Array.isArray((application as { missions: unknown }).missions)
            ? ((application as { missions: { type?: string | null }[] }).missions[0])
            : ((application as { missions: { type?: string | null } }).missions)
          : null;

      const missionType: ContentType =
        mission?.type === 'shortform' ||
        mission?.type === 'longform' ||
        mission?.type === 'live'
          ? (mission.type as ContentType)
          : 'shortform';

      const grade = ((creator as { grade?: string } | null)?.grade as Grade) ?? 'E';

      return {
        id: raw.id,
        amount: raw.amount,
        platformFee: raw.platform_fee,
        status: raw.status,
        paidAt: raw.paid_at,
        reward:
          (submission as { reward?: number } | null)?.reward ??
          raw.amount + raw.platform_fee,
        campaignName:
          (campaign as { name?: string } | null)?.name ?? '알 수 없는 캠페인',
        creatorName:
          (creator as { display_name?: string } | null)?.display_name ?? '알 수 없음',
        creatorGrade: grade,
        mission: missionType,
      };
    });
    setPayments(rows);

    const campaigns = campaignsRes.data ?? [];
    const totalSpent = campaigns.reduce(
      (sum, c) => sum + (c.spent_budget ?? 0),
      0,
    );
    const activeCampaigns = campaigns.filter(
      (c) => (c.status as CampaignStatus) === 'in_progress',
    ).length;
    setCampaignsSummary({ totalSpent, activeCampaigns });
    setLoading(false);
  }, [studio]);

  useEffect(() => {
    if (studioLoading) return;
    void fetchData();
  }, [studioLoading, fetchData]);

  const summary = useMemo(() => {
    const platformFees = payments.reduce((sum, p) => sum + p.platformFee, 0);
    const creatorsPaid = payments.filter((p) => p.status === 'completed').length;
    return {
      totalSpent: campaignsSummary.totalSpent,
      platformFees,
      creatorsPaid,
      activeCampaigns: campaignsSummary.activeCampaigns,
    };
  }, [payments, campaignsSummary]);

  if (studioLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">불러오는 중…</span>
      </div>
    );
  }

  return (
    <WorkspaceLayout
      persona="studio"
      userName={studio?.company_name ?? '테스트 게임사 1'}
      userAvatar="🎮"
      userBadge="게임사"
      sidebarSections={getStudioSidebar('payments')}
      notificationCount={3}
    >
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
          게임사 · 결제·정산
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          결제·정산
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          캠페인 지출과 크리에이터 정산 지급을 추적하세요
        </p>
      </header>

      {!studio && (
        <Alert variant="warning" className="mb-6">
          스튜디오 프로필이 없습니다. 회원가입 시 role을 <code>studio</code>로 선택해야
          이 페이지가 작동합니다.
        </Alert>
      )}

      <section className="mb-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="총 집행액"
          value={formatCompactKRW(summary.totalSpent)}
          sub="전체 캠페인 합계"
          highlight
        />
        <SummaryCard
          label="플랫폼 수수료"
          value={formatCompactKRW(summary.platformFees)}
          sub="15% 수수료"
        />
        <SummaryCard
          label="지급 완료 크리에이터"
          value={summary.creatorsPaid.toString()}
          sub="건"
        />
        <SummaryCard
          label="진행중인 캠페인"
          value={summary.activeCampaigns.toString()}
          sub="현재 진행중"
        />
      </section>

      <section className="mb-12">
        <div className="flex items-end justify-between gap-3 mb-4">
          <h2 className="text-base font-medium text-text-primary leading-tight">
            결제·정산 내역
          </h2>
          <span className="text-[11px] text-text-secondary tabular-nums">
            {payments.length}건
          </span>
        </div>

        <Card padding="none" className="overflow-hidden">
          <HeaderRow />
          {payments.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm text-text-primary mb-1">아직 결제 내역이 없습니다.</p>
              <p className="text-xs text-text-secondary">
                크리에이터의 콘텐츠가 승인되면 결제 내역이 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            payments.map((item, i) => (
              <Row key={item.id} item={item} last={i === payments.length - 1} />
            ))
          )}
        </Card>
      </section>
    </WorkspaceLayout>
  );
}
