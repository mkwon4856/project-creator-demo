'use client';

import { Calendar } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import type { CreatorGrade } from '@/lib/db.types';
import { useCurrentProfile } from '@/lib/supabase/hooks';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

import { GmvChart, type GmvDataPoint } from './_components/GmvChart';
import { HeroMetrics } from './_components/HeroMetrics';
import { ReviewQueue } from './_components/ReviewQueue';
import { TierDonut, type TierCounts } from './_components/TierDonut';
import { getAdminSidebar } from './_config/sidebar';
import { useAdminBadgeCounts } from './_hooks/useAdminBadgeCounts';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

interface CampaignRow {
  id: string;
  total_budget: number | null;
  spent_budget: number | null;
  status: string | null;
}

interface CreatorRow {
  id: string;
  grade: CreatorGrade | null;
  is_verified: boolean | null;
}

interface PaymentRow {
  id: string;
  amount: number | null;
  platform_fee: number | null;
  status: string | null;
  paid_at: string | null;
}

const EMPTY_TIER_COUNTS: TierCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };

function buildMonthlySeries(payments: PaymentRow[]): GmvDataPoint[] {
  const now = new Date();
  const months: GmvDataPoint[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthPayments = payments.filter((p) => {
      if (!p.paid_at) return false;
      const pd = new Date(p.paid_at);
      return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth();
    });
    const monthGmv = monthPayments.reduce(
      (sum, p) => sum + (p.amount ?? 0) + (p.platform_fee ?? 0),
      0,
    );
    const monthFee = monthPayments.reduce((sum, p) => sum + (p.platform_fee ?? 0), 0);
    months.push({
      month: d.toLocaleDateString('ko-KR', { month: 'short' }),
      gmv: monthGmv,
      fee: monthFee,
    });
  }
  return months;
}

export interface AdminOverviewClientProps {
  activityFeed: ReactNode;
}

export default function AdminOverviewClient({ activityFeed }: AdminOverviewClientProps) {
  const { data: profile, loading: profileLoading } = useCurrentProfile();
  const badgeCounts = useAdminBadgeCounts();

  const [campaigns, setCampaigns] = useState<CampaignRow[] | null>(null);
  const [creators, setCreators] = useState<CreatorRow[] | null>(null);
  const [payments, setPayments] = useState<PaymentRow[] | null>(null);

  useEffect(() => {
    if (!HAS_SUPABASE_ENV) return;

    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    const load = async () => {
      const [campaignsRes, creatorsRes, paymentsRes] = await Promise.all([
        supabase.from('campaigns').select('id, total_budget, spent_budget, status'),
        supabase.from('creators').select('id, grade, is_verified'),
        supabase.from('payments').select('id, amount, platform_fee, status, paid_at'),
      ]);

      if (cancelled) return;

      if (campaignsRes.error) {
        console.error('admin metrics: campaigns error', campaignsRes.error);
      } else {
        setCampaigns(campaignsRes.data as CampaignRow[]);
      }

      if (creatorsRes.error) {
        console.error('admin metrics: creators error', creatorsRes.error);
      } else {
        setCreators(creatorsRes.data as CreatorRow[]);
      }

      if (paymentsRes.error) {
        console.error('admin metrics: payments error', paymentsRes.error);
      } else {
        setPayments(paymentsRes.data as PaymentRow[]);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const heroProps = useMemo(() => {
    const monthlyData = payments ? buildMonthlySeries(payments) : null;

    let gmvGrowthPercent: number | undefined;
    let feeGrowthPercent: number | undefined;
    if (monthlyData && monthlyData.length >= 2) {
      const current = monthlyData[monthlyData.length - 1];
      const previous = monthlyData[monthlyData.length - 2];
      if (previous.gmv > 0) {
        gmvGrowthPercent = ((current.gmv - previous.gmv) / previous.gmv) * 100;
      }
      if (previous.fee > 0) {
        feeGrowthPercent = ((current.fee - previous.fee) / previous.fee) * 100;
      }
    }

    const gmv = payments
      ? payments.reduce((sum, p) => sum + (p.amount ?? 0) + (p.platform_fee ?? 0), 0)
      : undefined;
    const platformFee = payments
      ? payments.reduce((sum, p) => sum + (p.platform_fee ?? 0), 0)
      : undefined;

    const activeCampaigns = campaigns
      ? campaigns.filter((c) => c.status === 'live' || c.status === 'recruiting').length
      : undefined;

    const verifiedCreators = creators ? creators.length : undefined;

    const hasAnyDbData =
      (gmv !== undefined && gmv > 0) ||
      (activeCampaigns !== undefined && activeCampaigns > 0) ||
      (verifiedCreators !== undefined && verifiedCreators > 0);

    return {
      gmv: gmv && gmv > 0 ? gmv : undefined,
      platformFee: platformFee && platformFee > 0 ? platformFee : undefined,
      gmvGrowthPercent,
      feeGrowthPercent,
      activeCampaigns,
      verifiedCreators,
      fromDb: hasAnyDbData,
    };
  }, [payments, campaigns, creators]);

  const tierCounts = useMemo<TierCounts | undefined>(() => {
    if (!creators) return undefined;
    const counts: TierCounts = { ...EMPTY_TIER_COUNTS };
    for (const c of creators) {
      const g = c.grade;
      if (g === 'A' || g === 'B' || g === 'C' || g === 'D' || g === 'E') {
        counts[g] += 1;
      }
    }
    return counts;
  }, [creators]);

  const monthlyGmv = useMemo<GmvDataPoint[] | undefined>(() => {
    if (!payments) return undefined;
    return buildMonthlySeries(payments);
  }, [payments]);

  if (profileLoading) {
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
      sidebarSections={getAdminSidebar('overview', {
        review: badgeCounts.review,
        payouts: badgeCounts.payouts,
      })}
      notificationCount={badgeCounts.notification}
    >
      <header className="flex items-end justify-between gap-4 flex-wrap mb-7">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[22px] font-medium leading-tight text-text-primary">
            플랫폼 개요
          </h1>
          <p className="text-sm text-text-secondary">
            다시 오신 것을 환영합니다, {adminName}님. 플랫폼 전반의 현황을
            확인하세요.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-card border border-white/10 text-xs text-text-secondary">
          <Calendar size={13} aria-hidden />
          <span>최근 30일</span>
        </span>
      </header>

      <section className="mb-7">
        <HeroMetrics {...heroProps} />
      </section>

      <section className="mb-7 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-w-0">
          <GmvChart monthlyData={monthlyGmv} />
        </div>
        <div className="min-w-0">
          <TierDonut tierCounts={tierCounts} />
        </div>
      </section>

      <section className="mb-7 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-w-0">
          <ReviewQueue />
        </div>
        <div className="min-w-0">{activityFeed}</div>
      </section>
    </WorkspaceLayout>
  );
}
