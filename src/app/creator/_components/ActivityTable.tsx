'use client';

import { Compass } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button, EmptyState, Pill } from '@/components/ui';
import { SubmitUrlModal } from '@/components/creator/SubmitUrlModal';
import {
  fetchMyActivities,
  storeActivitiesToDisplay,
  type DisplayActivity,
} from '@/lib/api/submissions';
import { formatBudget } from '@/lib/mockCampaigns';
import { useAppStore, type ActivityMission, type ActivityStatus } from '@/lib/store';

const MISSION_LABELS: Record<ActivityMission, string> = {
  shortform: '숏폼',
  longform: '롱폼',
  live: '라이브',
};

const STATUS_LABELS: Record<ActivityStatus, string> = {
  making: '제작중',
  review: '검토중',
  paid: '지급완료',
  rejected: '반려',
};

const GRID_COLS = 'grid-cols-[60px_1.5fr_1fr_1fr_1fr_120px_120px]';

function HeaderRow() {
  return (
    <div
      className={`grid ${GRID_COLS} items-center px-5 py-3.5 bg-bg-elevated text-[11px] text-text-secondary uppercase tracking-wider`}
      role="row"
    >
      <span aria-hidden />
      <span>캠페인</span>
      <span>미션</span>
      <span>제출일</span>
      <span>상태</span>
      <span className="text-right">보상</span>
      <span className="text-right">작업</span>
    </div>
  );
}

function StatusCell({ status }: { status: ActivityStatus }) {
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none bg-red-500/15 text-red-400 border border-red-500/30">
        {STATUS_LABELS.rejected}
      </span>
    );
  }
  if (status === 'making') {
    return (
      <Pill variant="status" status="recruiting" size="sm">
        {STATUS_LABELS.making}
      </Pill>
    );
  }
  return (
    <Pill variant="status" status={status} size="sm">
      {STATUS_LABELS[status]}
    </Pill>
  );
}

function ActivityRow({
  activity,
  onSubmit,
}: {
  activity: DisplayActivity;
  onSubmit: (a: DisplayActivity) => void;
}) {
  const submittedDate =
    activity.submittedAt ??
    (activity.status === 'making' ? '제작 중' : activity.appliedAt);

  return (
    <div
      role="row"
      className={`grid ${GRID_COLS} items-center px-5 py-3.5 border-b border-white/[0.06] last:border-0 hover:bg-bg-hover transition-colors duration-150 ease-out`}
    >
      <span
        className="w-9 h-9 rounded-md flex items-center justify-center text-[18px] leading-none"
        style={{
          background: `linear-gradient(135deg, ${activity.thumbnail.from}, ${activity.thumbnail.to})`,
        }}
        aria-hidden
      >
        {activity.thumbnail.emoji}
      </span>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-text-primary truncate">
          {activity.title}
        </span>
        <span className="text-[11px] text-text-secondary truncate">
          {activity.developer} · {activity.campaignName}
        </span>
      </div>

      <span className="text-xs text-text-secondary">{MISSION_LABELS[activity.mission]}</span>

      <span className="text-xs text-text-secondary tabular-nums">{submittedDate}</span>

      <span>
        <StatusCell status={activity.status} />
      </span>

      <span className="text-sm font-medium text-text-primary text-right tabular-nums">
        {formatBudget(activity.reward)}
      </span>

      <span className="flex justify-end">
        {activity.status === 'making' ? (
          <Button variant="primary" size="sm" onClick={() => onSubmit(activity)}>
            URL 제출
          </Button>
        ) : activity.status === 'review' ? (
          <span className="text-[11px] text-amber-400">검수 중</span>
        ) : activity.status === 'paid' ? (
          <span className="text-[11px] text-green-400">정산 완료</span>
        ) : (
          <span className="text-[11px] text-red-400">반려됨</span>
        )}
      </span>
    </div>
  );
}

export function ActivityTable() {
  const storeActivities = useAppStore((s) => s.activities);
  const [dbActivities, setDbActivities] = useState<DisplayActivity[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<DisplayActivity | null>(null);

  const reload = useCallback(async () => {
    const result = await fetchMyActivities();
    setDbActivities(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  // DB takes priority when available (logged-in creator). The Zustand store
  // is used as a demo fallback (and is mirrored on apply so newly applied
  // mock-campaigns still show up).
  const list: DisplayActivity[] =
    dbActivities && dbActivities.length > 0
      ? dbActivities
      : storeActivitiesToDisplay(storeActivities);

  const isEmpty = !loading && list.length === 0;

  return (
    <>
      {isEmpty ? (
        <div className="border border-white/[0.06] rounded-lg bg-bg-card">
          <EmptyState
            icon={<Compass size={24} aria-hidden />}
            title="아직 참여 중인 캠페인이 없어요"
            description="프로필을 완성하고 캠페인에 지원해보세요. 완성도 80% 이상이면 승인률이 높아집니다."
            primaryAction={{ label: '캠페인 탐색하기', href: '/creator' }}
          />
        </div>
      ) : (
        <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-bg-card">
          <div className="overflow-x-auto">
            <div
              role="table"
              aria-label="내 활동"
              className="min-w-[760px]"
            >
              <HeaderRow />
              {loading ? (
                <div className="px-5 py-12 text-center text-sm text-text-secondary">
                  불러오는 중…
                </div>
              ) : (
                list.map((a) => (
                  <ActivityRow key={a.id} activity={a} onSubmit={setPending} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <SubmitUrlModal
        open={pending !== null}
        activity={pending}
        onClose={() => setPending(null)}
        onSubmitted={() => {
          void reload();
        }}
      />
    </>
  );
}
