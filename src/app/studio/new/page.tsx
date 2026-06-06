'use client';

import { ArrowLeft, ArrowRight, History, Rocket, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button, toast } from '@/components/ui';
import type { Json } from '@/lib/db.types';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

import {
  StepBrief,
  StepBudget,
  StepGame,
  StepMissions,
  StepReview,
  Stepper,
  Summary,
} from './_components';
import {
  initialData,
  type SelectedGame,
  type WizardData,
  type WizardStep,
} from './_types';

const HAS_SUPABASE_ENV =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** localStorage key for the in-progress wizard draft. */
const DRAFT_KEY = 'pc-campaign-draft';

interface DraftPayload {
  data: WizardData;
  step: WizardStep;
}

function isValidStep(n: unknown): n is WizardStep {
  return n === 1 || n === 2 || n === 3 || n === 4 || n === 5;
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // localStorage unavailable (private mode, quota, etc.)
  }
}

export default function CampaignWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [confirmed, setConfirmed] = useState(false);
  const [launching, setLaunching] = useState(false);
  /** True after the first client-side hydration effect runs. Until then we
   *  must not write to localStorage so we don't overwrite a saved draft with
   *  the initial defaults during mount. */
  const [hydrated, setHydrated] = useState(false);
  /** True when this mount restored from a persisted draft — used to show
   *  an inline "이어서 작성" banner with a "새로 시작" reset button. */
  const [restored, setRestored] = useState(false);

  // 1) On mount, attempt to restore a previous draft from localStorage.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DraftPayload>;
        if (parsed.data && typeof parsed.data === 'object') {
          setData({ ...initialData, ...parsed.data });
        }
        if (isValidStep(parsed.step)) {
          setStep(parsed.step);
        }
        setRestored(true);
        toast.info('이전에 작성하던 캠페인이 있습니다. 이어서 작성합니다.');
      }
    } catch {
      // Corrupt JSON / blocked storage — drop the draft and fall through.
      clearDraft();
    }
    setHydrated(true);
  }, []);

  // 2) Persist the draft on any change. Gated on `hydrated` so the initial
  //    render's defaults don't clobber the restored draft.
  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: DraftPayload = { data, step };
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch {
      // Storage quota or unavailable — silent fallback.
    }
  }, [data, step, hydrated]);

  const updateData = (patch: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const handleSelectGame = (game: SelectedGame) => updateData({ game });

  const goNext = () => {
    setStep((prev) => (prev < 5 ? ((prev + 1) as WizardStep) : prev));
  };

  const goBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev));
  };

  // Save & exit — keep the draft so the user can resume on next visit.
  const exit = () => router.push('/studio');

  const handleStartOver = () => {
    clearDraft();
    setData(initialData);
    setStep(1);
    setConfirmed(false);
    setRestored(false);
    toast.info('새 캠페인 작성을 시작합니다');
  };

  const handleLaunch = async () => {
    if (launching || !data.game) return;
    setLaunching(true);

    // Demo mode (no Supabase env): preserve the original behaviour.
    if (!HAS_SUPABASE_ENV) {
      clearDraft();
      toast.success('🚀 캠페인이 시작되었습니다! (데모) — 예산이 에스크로에 예치되었습니다.');
      setTimeout(() => router.push('/studio'), 200);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다.');
        return;
      }

      const { data: studio, error: studioErr } = await supabase
        .from('studios')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (studioErr || !studio) {
        toast.error('게임사 프로필이 없습니다. 게임사 계정으로 가입해주세요.');
        return;
      }

      const thumbnail: Json = {
        from: data.game.thumbnail.from,
        to: data.game.thumbnail.to,
        emoji: data.game.thumbnail.emoji,
      };
      const guidelines: Json = { ...data.guidelines };

      const { data: campaign, error: campErr } = await supabase
        .from('campaigns')
        .insert({
          studio_id: studio.id,
          name: data.game.name,
          genre: data.game.genre,
          developer: data.game.developer,
          status: 'recruiting',
          total_budget: data.totalBudget,
          spent_budget: 0,
          target_creators: 20,
          brief: data.brief,
          hashtags: data.hashtags,
          guidelines,
          thumbnail,
          platform: data.game.platform,
          recruit_start: data.recruitStart,
          recruit_end: data.recruitEnd,
          submit_deadline: data.submitDeadline,
          payout_days: data.payoutDays,
        })
        .select()
        .single();

      if (campErr || !campaign) {
        toast.error(`캠페인 생성 실패: ${campErr?.message ?? 'unknown error'}`);
        return;
      }

      const missionRows = (['shortform', 'longform', 'live'] as const).map((type) => {
        const m = data.missions[type];
        return {
          campaign_id: campaign.id,
          type,
          enabled: m.enabled,
          rate_a: m.rates.A,
          rate_b: m.rates.B,
          rate_c: m.rates.C,
          rate_d: m.rates.D,
          rate_e: m.rates.E,
        };
      });
      const { error: missionErr } = await supabase
        .from('missions')
        .insert(missionRows);
      if (missionErr) {
        // Campaign already created — surface the partial failure but still navigate.
        toast.error(`미션 저장 실패: ${missionErr.message}`);
      } else {
        toast.success('캠페인이 생성되었습니다!');
      }

      // Successful (or at least the campaign row was created) — clear the draft.
      clearDraft();
      router.push('/studio');
    } catch (err) {
      console.error('Launch error:', err);
      toast.error(
        `오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLaunching(false);
    }
  };

  const continueDisabled = step === 1 && !data.game;
  const launchDisabled = !confirmed || !data.game || launching;

  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-primary">
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-bg-base">
        <span className="text-base font-semibold tracking-tight">
          Project <span className="text-ube-bright">Creator</span>
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-ube/10 text-ube-bright align-middle">
            새 캠페인
          </span>
        </span>
        <button
          type="button"
          onClick={exit}
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors duration-150 ease-out cursor-pointer"
        >
          <X size={13} aria-hidden />
          저장 후 나가기
        </button>
      </header>

      {restored && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 px-8 py-2.5 border-b border-white/[0.06] bg-ube-tint"
        >
          <span className="inline-flex items-center gap-1.5 text-xs text-ube-bright">
            <History size={12} aria-hidden />
            이전에 작성하던 캠페인을 이어서 작성합니다.
          </span>
          <button
            type="button"
            onClick={handleStartOver}
            className="text-xs text-text-secondary hover:text-text-primary underline-offset-2 hover:underline cursor-pointer"
          >
            새로 시작
          </button>
        </div>
      )}

      <Stepper current={step} onJump={(s) => setStep(s)} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] min-h-0">
        <main className="overflow-y-auto px-10 py-8">
          {step === 1 && <StepGame selected={data.game} onSelect={handleSelectGame} />}
          {step === 2 && <StepBudget data={data} onChange={updateData} />}
          {step === 3 && <StepMissions data={data} onChange={updateData} />}
          {step === 4 && <StepBrief data={data} onChange={updateData} />}
          {step === 5 && (
            <StepReview
              data={data}
              onJump={(s) => setStep(s)}
              confirmed={confirmed}
              onConfirm={setConfirmed}
            />
          )}
        </main>
        <Summary data={data} />
      </div>

      <footer className="flex items-center justify-between gap-4 px-8 py-4 border-t border-white/[0.06] bg-bg-base">
        <div className="min-w-[120px]">
          {step > 1 && (
            <Button variant="ghost" size="md" icon={<ArrowLeft size={14} />} onClick={goBack}>
              이전
            </Button>
          )}
        </div>
        <span className="text-xs text-text-secondary tabular-nums">{step} / 5 단계</span>
        <div className="min-w-[120px] flex justify-end">
          {step < 5 ? (
            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight size={14} />}
              iconPosition="right"
              disabled={continueDisabled}
              onClick={goNext}
            >
              다음
            </Button>
          ) : (
            <Button
              variant="launch"
              size="md"
              icon={<Rocket size={14} />}
              disabled={launchDisabled}
              loading={launching}
              onClick={handleLaunch}
            >
              {launching ? '시작하는 중…' : '캠페인 시작'}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
