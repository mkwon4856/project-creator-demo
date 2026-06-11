# Project Creator — rebuild Task 3
## 캠페인 생성 Wizard 재개발 (3단계)

배경: 기존 5단계 wizard를 새 기획 기준 3단계로 전면 재작성.
경로: src/app/studio/new/

디자인 시스템:
- 배경: #0A0A0F (다크)
- 주색: #9B7EC8 (우베 보라)
- 강조: #E5B567 (골드)
- 폰트: Arial Black (제목)
- Tailwind v4 사용

---

## Task 3-1: 타입 정의

src/app/studio/new/_types.ts 를 아래 내용으로 완전 교체:

```typescript
import type { ContentType, Grade } from '@/lib/db.types'

// 미션 슬롯 (게임사가 구성하는 단위)
export interface MissionSlot {
  id: string           // 임시 UI ID
  content_type: ContentType
  allowed_grades: Grade[]
  guide_draft: string
  creator_amount: number   // 크리에이터 수령 단가 (자동계산)
  studio_amount: number    // 게임사 지불 단가 (creator_amount ÷ 0.7)
}

// Wizard 전체 상태
export interface WizardState {
  // 1단계
  game_name: string
  genre: string
  description: string
  thumbnail_url: string

  // 2단계
  total_budget: number
  missions: MissionSlot[]
  auto_spend_remaining: boolean

  // 3단계 (계산값)
  estimated_creators: number
  remaining_budget: number
  auto_missions: MissionSlot[]  // 잔여예산 자동배분 미션
}

export const GENRES = ['RPG', 'FPS', '전략', '스포츠', '퍼즐', '액션', '시뮬레이션', '기타'] as const

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
}

export const GRADE_LABELS: Record<Grade, string> = {
  S: 'S등급 (200만+)',
  A: 'A등급 (50만~200만)',
  B: 'B등급 (10만~50만)',
  C: 'C등급 (5만~10만)',
  D: 'D등급 (2만~5만)',
  E: 'E등급 (1만~2만)',
}
```

---

## Task 3-2: 1단계 컴포넌트

src/app/studio/new/_components/StepGame.tsx 완전 교체:

```tsx
'use client'
import { GENRES } from '../_types'
import type { WizardState } from '../_types'

interface Props {
  state: WizardState
  onChange: (patch: Partial<WizardState>) => void
  onNext: () => void
}

export function StepGame({ state, onChange, onNext }: Props) {
  const valid = state.game_name.trim() && state.genre && state.description.trim()

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">게임 이름 *</label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8]"
          placeholder="예: 다크소울X"
          value={state.game_name}
          onChange={e => onChange({ game_name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">장르 *</label>
        <select
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#9B7EC8]"
          value={state.genre}
          onChange={e => onChange({ genre: e.target.value })}
        >
          <option value="" className="bg-[#0A0A0F]">장르 선택</option>
          {GENRES.map(g => <option key={g} value={g} className="bg-[#0A0A0F]">{g}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">게임 소개 *</label>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8] resize-none"
          rows={4}
          placeholder="게임의 특징과 마케팅 포인트를 간략히 설명해주세요"
          value={state.description}
          onChange={e => onChange({ description: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">썸네일 이미지 URL</label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8]"
          placeholder="https://..."
          value={state.thumbnail_url}
          onChange={e => onChange({ thumbnail_url: e.target.value })}
        />
      </div>

      <button
        onClick={onNext}
        disabled={!valid}
        className="w-full py-3 rounded-lg font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: valid ? '#9B7EC8' : undefined }}
      >
        다음 →
      </button>
    </div>
  )
}
```

---

## Task 3-3: 2단계 컴포넌트

src/app/studio/new/_components/StepMissions.tsx 완전 교체:

```tsx
'use client'
import { useState } from 'react'
import { RATE_MATRIX, toStudioAmount } from '@/lib/pricing'
import { CONTENT_TYPE_LABELS, GRADE_LABELS } from '../_types'
import type { WizardState, MissionSlot } from '../_types'
import type { ContentType, Grade } from '@/lib/db.types'

interface Props {
  state: WizardState
  onChange: (patch: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
}

const ALL_GRADES: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E']
const ALL_TYPES: ContentType[] = ['live', 'longform', 'shortform']

function calcMissionAmount(grades: Grade[], type: ContentType) {
  if (!grades.length) return 0
  return Math.max(...grades.map(g => RATE_MATRIX[g][type]))
}

export function StepMissions({ state, onChange, onNext, onBack }: Props) {
  const addMission = () => {
    const newMission: MissionSlot = {
      id: crypto.randomUUID(),
      content_type: 'longform',
      allowed_grades: ['B'],
      guide_draft: '',
      creator_amount: RATE_MATRIX['B']['longform'],
      studio_amount: toStudioAmount(RATE_MATRIX['B']['longform']),
    }
    onChange({ missions: [...state.missions, newMission] })
  }

  const updateMission = (id: string, patch: Partial<MissionSlot>) => {
    onChange({
      missions: state.missions.map(m => {
        if (m.id !== id) return m
        const updated = { ...m, ...patch }
        const amount = calcMissionAmount(updated.allowed_grades, updated.content_type)
        return { ...updated, creator_amount: amount, studio_amount: toStudioAmount(amount) }
      })
    })
  }

  const removeMission = (id: string) => {
    onChange({ missions: state.missions.filter(m => m.id !== id) })
  }

  const toggleGrade = (mission: MissionSlot, grade: Grade) => {
    const grades = mission.allowed_grades.includes(grade)
      ? mission.allowed_grades.filter(g => g !== grade)
      : [...mission.allowed_grades, grade]
    updateMission(mission.id, { allowed_grades: grades })
  }

  const usedBudget = state.missions.reduce((sum, m) => sum + m.studio_amount, 0)
  const remaining = state.total_budget - usedBudget
  const valid = state.total_budget > 0 && state.missions.length > 0 && state.missions.every(m => m.allowed_grades.length > 0)

  return (
    <div className="space-y-6">
      {/* 총 예산 */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">총 예산 *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">₩</span>
          <input
            type="number"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:border-[#9B7EC8]"
            placeholder="10000000"
            value={state.total_budget || ''}
            onChange={e => onChange({ total_budget: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* 미션 목록 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-white/70">미션 구성</label>
          <button
            onClick={addMission}
            className="text-sm text-[#9B7EC8] hover:text-[#9B7EC8]/80 transition-colors"
          >
            + 미션 추가
          </button>
        </div>

        {state.missions.map((mission, idx) => (
          <div key={mission.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white">미션 {idx + 1}</span>
              <button onClick={() => removeMission(mission.id)} className="text-white/30 hover:text-red-400 text-sm">삭제</button>
            </div>

            {/* 타입 선택 */}
            <div>
              <label className="text-xs text-white/50 mb-2 block">콘텐츠 타입</label>
              <div className="flex gap-2">
                {ALL_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => updateMission(mission.id, { content_type: type })}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      mission.content_type === type
                        ? 'bg-[#9B7EC8] text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {CONTENT_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* 등급 선택 */}
            <div>
              <label className="text-xs text-white/50 mb-2 block">허용 등급 (복수 선택)</label>
              <div className="flex flex-wrap gap-2">
                {ALL_GRADES.map(grade => (
                  <button
                    key={grade}
                    onClick={() => toggleGrade(mission, grade)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      mission.allowed_grades.includes(grade)
                        ? 'bg-[#E5B567] text-black font-medium'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* 가이드라인 */}
            <div>
              <label className="text-xs text-white/50 mb-2 block">미션 가이드라인</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8] resize-none"
                rows={2}
                placeholder="크리에이터에게 전달할 제작 가이드를 입력하세요"
                value={mission.guide_draft}
                onChange={e => updateMission(mission.id, { guide_draft: e.target.value })}
              />
            </div>

            {/* 예상 비용 */}
            {mission.creator_amount > 0 && (
              <div className="text-xs text-white/40">
                예상 비용: ₩{mission.studio_amount.toLocaleString()}
              </div>
            )}
          </div>
        ))}

        {state.missions.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
            미션을 추가해주세요
          </div>
        )}
      </div>

      {/* 잔여 예산 */}
      {state.total_budget > 0 && (
        <div className="bg-white/5 rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">사용 예산</span>
            <span className="text-white">₩{usedBudget.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">잔여 예산</span>
            <span className={remaining < 0 ? 'text-red-400' : 'text-[#E5B567]'}>
              ₩{remaining.toLocaleString()}
            </span>
          </div>
          {remaining > 0 && (
            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-white/10">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={state.auto_spend_remaining}
                onChange={e => onChange({ auto_spend_remaining: e.target.checked })}
              />
              <span className="text-xs text-white/50">
                잔여 예산을 하위 등급 미션으로 자동 소진합니다
              </span>
            </label>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-all">
          ← 이전
        </button>
        <button
          onClick={onNext}
          disabled={!valid || remaining < 0}
          className="flex-2 flex-grow py-3 rounded-lg font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: (valid && remaining >= 0) ? '#9B7EC8' : undefined }}
        >
          다음 →
        </button>
      </div>
    </div>
  )
}
```

---

## Task 3-4: 3단계 컴포넌트

src/app/studio/new/_components/StepReview.tsx 완전 교체:

```tsx
'use client'
import { CONTENT_TYPE_LABELS } from '../_types'
import type { WizardState } from '../_types'

interface Props {
  state: WizardState
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
}

export function StepReview({ state, onBack, onSubmit, submitting }: Props) {
  const totalMissions = state.missions.length + state.auto_missions.length
  const estimatedCreators = totalMissions

  return (
    <div className="space-y-6">
      {/* 게임 요약 */}
      <div className="bg-white/5 rounded-xl p-4 flex gap-4">
        {state.thumbnail_url && (
          <img src={state.thumbnail_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
        )}
        <div>
          <div className="font-bold text-white">{state.game_name}</div>
          <div className="text-sm text-white/50">{state.genre}</div>
          <div className="text-sm text-[#E5B567] mt-1">총 예산: ₩{state.total_budget.toLocaleString()}</div>
        </div>
      </div>

      {/* 미션 구성 */}
      <div>
        <label className="text-sm font-medium text-white/70 mb-3 block">미션 구성</label>
        <div className="space-y-2">
          {state.missions.map((mission, idx) => (
            <div key={mission.id} className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-medium text-white">
                    {CONTENT_TYPE_LABELS[mission.content_type]} — {mission.allowed_grades.join(', ')}등급
                  </span>
                  {mission.guide_draft && (
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{mission.guide_draft}</p>
                  )}
                </div>
                <span className="text-xs text-white/40">₩{mission.studio_amount.toLocaleString()}</span>
              </div>
            </div>
          ))}

          {state.auto_missions.map((mission) => (
            <div key={mission.id} className="bg-[#E5B567]/5 border border-[#E5B567]/20 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-[#E5B567] mb-1 block">자동 배분</span>
                  <span className="text-sm font-medium text-white">
                    {CONTENT_TYPE_LABELS[mission.content_type]} — {mission.allowed_grades.join(', ')}등급
                  </span>
                </div>
                <span className="text-xs text-white/40">₩{mission.studio_amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 예상 결과 */}
      <div className="bg-[#9B7EC8]/10 border border-[#9B7EC8]/20 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">예상 참여 크리에이터</span>
          <span className="text-white font-medium">약 {estimatedCreators}명</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">미션 수</span>
          <span className="text-white font-medium">{totalMissions}개</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-all">
          ← 이전
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-grow flex-2 py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50"
          style={{ background: '#9B7EC8' }}
        >
          {submitting ? '런칭 중...' : '🚀 캠페인 런칭'}
        </button>
      </div>
    </div>
  )
}
```

---

## Task 3-5: Stepper 컴포넌트

src/app/studio/new/_components/Stepper.tsx 완전 교체:

```tsx
interface Props {
  current: number  // 1, 2, 3
  steps: string[]
}

export function Stepper({ current, steps }: Props) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, idx) => {
        const step = idx + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${active ? 'text-white' : done ? 'text-[#9B7EC8]' : 'text-white/30'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                active ? 'bg-[#9B7EC8] text-white' : done ? 'bg-[#9B7EC8]/30 text-[#9B7EC8]' : 'bg-white/10 text-white/30'
              }`}>
                {done ? '✓' : step}
              </div>
              <span className="text-sm hidden sm:block">{label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-px w-8 mx-1 ${done ? 'bg-[#9B7EC8]/50' : 'bg-white/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

---

## Task 3-6: 메인 페이지

src/app/studio/new/page.tsx 완전 교체:

```tsx
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
import type { Grade, ContentType } from '@/lib/db.types'

const STEPS = ['게임 정보', '미션 구성', '최종 확인']

const ALL_GRADES: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E']

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
        guide_draft: '',
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
        guide_draft: m.guide_draft || null,
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
```

---

## 완료 후

1. 기존 _components 폴더의 StepBrief.tsx, StepBudget.tsx, Summary.tsx, index.ts 삭제
2. npx tsc --noEmit 실행해서 새 wizard 관련 타입 에러 확인
3. git add . && git commit -m "rebuild: campaign creation wizard 3-step"
4. PROGRESS.md 업데이트
