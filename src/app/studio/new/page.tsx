'use client';

import { ArrowLeft, ArrowRight, Rocket, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

export default function CampaignWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [confirmed, setConfirmed] = useState(false);
  const [launching, setLaunching] = useState(false);

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

  const exit = () => router.push('/studio');

  const handleLaunch = async () => {
    if (launching || !data.game) return;
    setLaunching(true);

    // Demo mode (no Supabase env): preserve the original behaviour.
    if (!HAS_SUPABASE_ENV) {
      toast.success('🚀 Campaign launched! (demo) — funds reserved in escrow.');
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
        toast.error('Studio 프로필이 없습니다. Studio 계정으로 가입해주세요.');
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
            New campaign
          </span>
        </span>
        <button
          type="button"
          onClick={exit}
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors duration-150 ease-out cursor-pointer"
        >
          <X size={13} aria-hidden />
          Save &amp; exit
        </button>
      </header>

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
              Back
            </Button>
          )}
        </div>
        <span className="text-xs text-text-secondary tabular-nums">Step {step} of 5</span>
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
              Continue
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
              {launching ? 'Launching…' : 'Launch campaign'}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
