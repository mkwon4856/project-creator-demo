'use client'
import { estimateCreatorRange, type CreatorRange } from '@/lib/pricing'
import { CONTENT_TYPE_LABELS } from '../_types'
import type { WizardState } from '../_types'

interface Props {
  state: WizardState
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
}

function formatRange({ min, max }: CreatorRange): string {
  if (max <= 0) return '약 0명'
  return min === max ? `약 ${min}명` : `약 ${min}~${max}명`
}

export function StepReview({ state, onBack, onSubmit, submitting }: Props) {
  // 예산 분배: 자동배분 미션이 소진하는 예산을 뺀 나머지를 게임사 미션들이 오픈마켓으로 나눠 갖는다.
  const baseUsed = state.missions.reduce((s, m) => s + m.studio_amount, 0)
  const autoBudget = state.auto_missions.reduce((s, m) => s + m.studio_amount, 0)
  const baseBudget = Math.max(baseUsed, state.total_budget - autoBudget)

  // 미션별 예상 인원 범위
  const missionRanges = state.missions.map(m => {
    const weight = baseUsed > 0 ? m.studio_amount / baseUsed : 1 / state.missions.length
    const budgetForMission = Math.max(m.studio_amount, baseBudget * weight)
    return { mission: m, range: estimateCreatorRange(budgetForMission, m.allowed_grades, m.content_type) }
  })

  // 자동배분 미션은 등급당 1인 슬롯 → 건수 = 인원. 한 줄로 묶어서 요약.
  const autoCount = state.auto_missions.length
  const autoGrades = [...new Set(state.auto_missions.flatMap(m => m.allowed_grades))]
  const autoType = state.auto_missions[0]?.content_type

  // 총 예상 참여
  const totalMin = missionRanges.reduce((s, r) => s + r.range.min, 0) + autoCount
  const totalMax = missionRanges.reduce((s, r) => s + r.range.max, 0) + autoCount

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
          {state.missions.map((mission) => (
            <div key={mission.id} className="bg-white/5 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-medium text-white">
                    {CONTENT_TYPE_LABELS[mission.content_type]} — {mission.allowed_grades.join(', ')}등급
                  </span>
                  {mission.guide_draft.filter(Boolean).length > 0 && (
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{mission.guide_draft.filter(Boolean).join(' · ')}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* 자동배분 미션 — 개별 나열 대신 1줄 요약 */}
          {autoCount > 0 && (
            <div className="bg-[#E5B567]/5 border border-[#E5B567]/20 rounded-xl p-4">
              <span className="text-xs text-[#E5B567] mb-1 block">자동 배분 (잔여 예산 소진)</span>
              <span className="text-sm font-medium text-white">
                {autoType && `${CONTENT_TYPE_LABELS[autoType]} `}
                {autoGrades.join('/')}등급 자동배분 {autoCount}건
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 예상 참여 크리에이터 (범위) */}
      <div className="bg-[#9B7EC8]/10 border border-[#9B7EC8]/20 rounded-xl p-4 space-y-3">
        <div className="text-sm font-medium text-white/70 mb-2">예상 참여 크리에이터</div>
        {missionRanges.map(({ mission, range }) => (
          <div key={mission.id} className="flex justify-between text-sm">
            <span className="text-white/50">
              {CONTENT_TYPE_LABELS[mission.content_type]} {mission.allowed_grades.join('/')}등급
            </span>
            <span className="text-white">{formatRange(range)}</span>
          </div>
        ))}
        {autoCount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-white/50">
              {autoType && `${CONTENT_TYPE_LABELS[autoType]} `}자동배분 {autoCount}건
            </span>
            <span className="text-white">약 {autoCount}명</span>
          </div>
        )}
        <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-medium">
          <span className="text-white/70">총 예상 참여</span>
          <span className="text-white">{formatRange({ min: totalMin, max: totalMax })}</span>
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
