'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stepper } from './_components/Stepper'
import { StepGame } from './_components/StepGame'
import { StepMissions } from './_components/StepMissions'
import { StepReview } from './_components/StepReview'
import { createCampaign, createMissions } from '@/lib/api/campaigns'
import { toStudioAmount, RATE_MATRIX } from '@/lib/pricing'
import { useStudio } from '@/lib/supabase/hooks'
import type { WizardState, MissionSlot } from './_types'
import type { Grade } from '@/lib/db.types'

const STEPS = ['게임 정보', '미션 구성', '최종 확인']

function calcAutoMissions(
  remaining: number,
  baseMissions: MissionSlot[]
): MissionSlot[] {
  if (remaining <= 0 || baseMissions.length === 0) return []
  const type = baseMissions[0].content_type
  const auto: MissionSlot[] = []
  let budget = remaining

  for (const grade of ['E', 'D', 'C', 'B', 'A', 'S'] as Grade[]) {
    const studioAmt = toStudioAmount(RATE_MATRIX[grade][type])
    while (budget >= studioAmt) {
      auto.push({
        id: crypto.randomUUID(),
        content_type: type,
        allowed_grades: [grade],
        guide_draft: [],
        creator_amount: RATE_MATRIX[grade][type],
        studio_amount: studioAmt,
      })
      budget -= studioAmt
      if (auto.length >= 10) return auto
    }
  }
  return auto
}

const INITIAL: WizardState = {
  game_name: '', genre: '', description: '', thumbnail_url: '',
  total_budget: 0, missions: [], auto_spend_remaining: false,
  estimated_creators: 0, remaining_budget: 0, auto_missions: [],
}

export default function NewCampaignPage() {
  const router = useRouter()
  const { studio } = useStudio()
  const [step, setStep] = useState(1)
  const [state, setState] = useState<WizardState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (patch: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...patch }))
  }

  const goNext = () => {
    if (step === 2) {
      const usedBudget = state.missions.reduce((s, m) => s + m.studio_amount, 0)
      const remaining = state.total_budget - usedBudget
      const autoMissions = state.auto_spend_remaining ? calcAutoMissions(remaining, state.missions) : []
      const finalRemaining = remaining - autoMissions.reduce((s, m) => s + m.studio_amount, 0)
      setState(prev => ({
        ...prev,
        remaining_budget: finalRemaining,
        auto_missions: autoMissions,
        estimated_creators: prev.missions.length + autoMissions.length,
      }))
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    console.log('studio:', studio)
    if (!studio) return
    setSubmitting(true)
    try {
      const { data: campaign, error } = await createCampaign({
        studio_id: studio.id,
        title: `${state.game_name} 캠페인`,
        game_name: state.game_name,
        genre: state.genre,
        description: state.description,
        thumbnail_url: state.thumbnail_url || null,
        total_budget: state.total_budget,
        remaining_budget: state.remaining_budget,
        auto_spend_remaining: state.auto_spend_remaining,
        status: 'pending',
        admin_note: null,
      })
      if (error || !campaign) throw error

      const allMissions = [...state.missions, ...state.auto_missions]
      await createMissions(allMissions.map(m => ({
        campaign_id: campaign.id,
        content_type: m.content_type,
        allowed_grades: m.allowed_grades,
        creator_amount: m.creator_amount,
        studio_amount: m.studio_amount,
        guide_draft: Array.isArray(m.guide_draft)
          ? (m.guide_draft as string[]).filter(Boolean).join('\n') || null
          : m.guide_draft || null,
        guide_approved: null,
        is_auto_generated: state.auto_missions.some(a => a.id === m.id),
        status: 'open' as const,
      })))

      router.push('/studio')
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-4 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-black text-white mb-6" style={{ fontFamily: 'Arial Black' }}>
          새 캠페인 만들기
        </h1>
        <Stepper current={step} steps={STEPS} />

        {step === 1 && <StepGame state={state} onChange={onChange} onNext={goNext} />}
        {step === 2 && <StepMissions state={state} onChange={onChange} onNext={goNext} onBack={() => setStep(1)} />}
        {step === 3 && <StepReview state={state} onBack={() => setStep(2)} onSubmit={handleSubmit} submitting={submitting} />}
      </div>
    </div>
  )
}
