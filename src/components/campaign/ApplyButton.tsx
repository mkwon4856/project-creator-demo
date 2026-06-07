'use client';

import { Film, Radio, Video, type LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';

import { Badge, Button, Modal, SelectableCard, toast } from '@/components/ui';
import { formatRate, type Campaign } from '@/lib/campaigns/types';
import { CURRENT_CREATOR } from '@/lib/mockCreators';
import { useAppStore, type ActivityMission } from '@/lib/store';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

const MISSION_META: Record<ActivityMission, { label: string; icon: LucideIcon; description: string }> = {
  shortform: {
    label: '숏폼',
    icon: Film,
    description: '60초 이하 쇼츠 · YouTube Shorts / Reels',
  },
  longform: {
    label: '롱폼',
    icon: Video,
    description: '5분 이상 리뷰 · YouTube 풀영상',
  },
  live: {
    label: '라이브',
    icon: Radio,
    description: '치지직 / 트위치 라이브 방송',
  },
};

export interface ApplyButtonProps {
  campaignId: string;
  /**
   * The campaign object from DB. Required for apply flow.
   */
  campaign: Campaign;
  /** Modal close handler — when ApplyButton lives inside an existing modal. */
  onAppliedClose?: () => void;
  /** Override label */
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function ApplyButton({
  campaignId,
  campaign,
  onAppliedClose,
  children,
  size = 'md',
}: ApplyButtonProps) {
  const router = useRouter();
  const applyToCampaign = useAppStore((s) => s.applyToCampaign);
  const activities = useAppStore((s) => s.activities);

  const availableMissions = useMemo<ActivityMission[]>(() => {
    return (Object.entries(campaign.missions) as [ActivityMission, boolean][])
      .filter(([, enabled]) => enabled)
      .map(([m]) => m);
  }, [campaign]);

  const alreadyApplied = activities.some(
    (a) => a.campaignId === campaignId && a.status !== 'rejected',
  );

  const [open, setOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [selected, setSelected] = useState<ActivityMission | null>(
    availableMissions[0] ?? null,
  );

  const grade = CURRENT_CREATOR.grade;
  const rate = campaign.rates[grade];

  const handleOpen = () => {
    setSelected(availableMissions[0] ?? null);
    setOpen(true);
  };

  const finalizeSuccess = () => {
    setOpen(false);
    toast.success('지원 완료! 콘텐츠를 제작 후 URL을 제출해주세요');
    // Single-route navigation: router.push('/creator') alone unmounts the
    // intercepting campaign modal slot — calling onAppliedClose (router.back)
    // here would race with the push and corrupt history. Defer slightly so
    // the store commit and modal cleanup settle before navigating.
    setTimeout(() => {
      router.push('/creator');
    }, 100);
  };

  const handleApply = async () => {
    if (!selected || !campaign || applying) return;
    setApplying(true);

    try {
      const supabase = createBrowserSupabaseClient();

      // 1. 현재 유저
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      // 2. creator 프로필
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('id, grade')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!creator) {
        toast.error('크리에이터 프로필이 없습니다');
        return;
      }

      // 3. mission 찾기
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .select('id, rate_a, rate_b, rate_c, rate_d, rate_e')
        .eq('campaign_id', campaign.id)
        .eq('type', selected)
        .eq('enabled', true)
        .maybeSingle();
      if (!mission) {
        toast.error('이 캠페인에는 현재 지원 가능한 미션이 없습니다');
        return;
      }

      // 4. 중복 지원 확인 (UX용 사전 검사 — DB의 unique 제약이 2차 방어)
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('creator_id', creator.id)
        .eq('mission_id', mission.id)
        .maybeSingle();
      if (existing) {
        toast.error('이미 지원한 미션입니다');
        return;
      }

      // 5. application insert
      const { data: app, error: appError } = await supabase
        .from('applications')
        .insert({
          creator_id: creator.id,
          mission_id: mission.id,
          campaign_id: campaign.id,
          status: 'applied',
        })
        .select()
        .single();
      if (appError || !app) {
        toast.error(`지원 실패: ${appError?.message ?? 'unknown'}`);
        return;
      }

      // 6. 등급별 단가 (rates는 만원 단위 — 원 단위로 변환)
      const gradeKey = (`rate_${(creator.grade as string).toLowerCase()}`) as
        | 'rate_a'
        | 'rate_b'
        | 'rate_c'
        | 'rate_d'
        | 'rate_e';
      const rateManwon = (mission[gradeKey] as number) ?? 0;
      const reward = rateManwon * 10_000;

      // 7. submission 생성 (status: making)
      const { data: sub, error: subError } = await supabase
        .from('submissions')
        .insert({
          application_id: app.id,
          creator_id: creator.id,
          campaign_id: campaign.id,
          content_url: '',
          status: 'making',
          reward,
        })
        .select()
        .single();
      if (subError) {
        toast.error(`제출 기록 생성 실패: ${subError.message}`);
        return;
      }

      // 8. Zustand store에도 mirror (UI 즉시 반영 — alreadyApplied 등)
      applyToCampaign(campaign, selected);

      finalizeSuccess();
    } catch (err) {
      console.error('[APPLY] catch error:', err);
      toast.error(
        `오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        size={size}
        onClick={handleOpen}
        disabled={alreadyApplied || availableMissions.length === 0}
      >
        {alreadyApplied
          ? '이미 지원함'
          : availableMissions.length === 0
            ? '미션 없음'
            : (children ?? '이 캠페인에 지원하기')}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        ariaLabel={`${campaign.name} 지원`}
      >
        <Modal.Hero>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              캠페인 지원
            </span>
            <h2 className="text-base font-medium text-text-primary leading-tight">
              {campaign.name}
            </h2>
            <p className="text-[12px] text-text-secondary">
              {campaign.developer} · 내 등급 <span className="text-primary">{grade}티어</span>
            </p>
          </div>
        </Modal.Hero>

        <Modal.Body>
          <fieldset className="flex flex-col gap-2.5">
            <legend className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
              어떤 미션으로 지원하시겠어요?
            </legend>
            {availableMissions.map((m) => {
              const meta = MISSION_META[m];
              const Icon = meta.icon;
              const checked = selected === m;
              return (
                <SelectableCard
                  key={m}
                  selected={checked}
                  onClick={() => setSelected(m)}
                  padding="md"
                  className="flex items-start gap-3"
                  role="radio"
                  aria-checked={checked}
                >
                  <input
                    type="radio"
                    name="apply-mission"
                    checked={checked}
                    onChange={() => setSelected(m)}
                    className="sr-only"
                    tabIndex={-1}
                  />
                  <span
                    aria-hidden
                    className={[
                      'mt-0.5 inline-flex w-4 h-4 rounded-full border items-center justify-center flex-shrink-0',
                      checked ? 'border-primary' : 'border-border',
                    ].join(' ')}
                  >
                    {checked && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-text-secondary" aria-hidden />
                      <span className="text-sm font-medium text-text-primary">
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5">{meta.description}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary">
                      내 단가
                    </span>
                    <span className="text-sm font-medium text-primary tabular-nums">
                      {formatRate(rate)}
                    </span>
                  </div>
                </SelectableCard>
              );
            })}
          </fieldset>

          <div className="mt-4 rounded-[var(--radius-md)] bg-bg-elevated border border-white/[0.06] p-3 flex items-start gap-2">
            <Badge variant="primary" size="sm">
              안내
            </Badge>
            <p className="text-[11px] leading-relaxed text-text-secondary">
              지원 후 마감일까지 콘텐츠를 제작하여 URL을 제출해야 합니다.
              관리자 승인 시 1~2 영업일 내 정산이 진행됩니다.
            </p>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" size="md" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleApply}
            disabled={!selected || applying}
            loading={applying}
          >
            {applying ? '지원 중…' : '지원하기'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
