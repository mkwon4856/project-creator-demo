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
                  {mission.guide_draft.filter(Boolean).length > 0 && (
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{mission.guide_draft.filter(Boolean).join(' · ')}</p>
                  )}
                </div>              </div>
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
                </div>              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 예상 결과물 */}
      <div className="bg-[#9B7EC8]/10 border border-[#9B7EC8]/20 rounded-xl p-4 space-y-3">
        <div className="text-sm font-medium text-white/70 mb-2">예상 참여 크리에이터</div>
        {state.missions.map((mission, idx) => (
          <div key={mission.id} className="flex justify-between text-sm">
            <span className="text-white/50">
              {CONTENT_TYPE_LABELS[mission.content_type]} {mission.allowed_grades.join('/')}등급
            </span>
            <span className="text-white">약 1명</span>
          </div>
        ))}
        {state.auto_missions.map((mission, idx) => (
          <div key={mission.id} className="flex justify-between text-sm">
            <span className="text-white/50">
              {CONTENT_TYPE_LABELS[mission.content_type]} {mission.allowed_grades.join('/')}등급 (자동)
            </span>
            <span className="text-white">약 1명</span>
          </div>
        ))}
        <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-medium">
          <span className="text-white/70">총 예상 참여</span>
          <span className="text-white">약 {state.missions.length + state.auto_missions.length}명</span>
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
