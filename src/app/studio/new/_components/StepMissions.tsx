'use client'
import { RATE_MATRIX, toStudioAmount } from '@/lib/pricing'
import { CONTENT_TYPE_LABELS } from '../_types'
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

function calcMissionAmount(grades: Grade[], type: ContentType): number {
  if (!grades.length) return 0
  // 선택된 등급 중 가장 높은 등급의 단가 기준 (슬롯 1개)
  const gradeOrder: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E']
  const highestGrade = gradeOrder.find(g => grades.includes(g)) ?? grades[0]
  return RATE_MATRIX[highestGrade][type]
}

export function StepMissions({ state, onChange, onNext, onBack }: Props) {
  const addMission = () => {
    const newMission: MissionSlot = {
      id: crypto.randomUUID(),
      content_type: 'longform',
      allowed_grades: ['B'],
      guide_draft: [''],
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
              <label className="text-xs text-white/50 mb-2 block">참여 가능한 크리에이터 등급 (복수 선택)</label>
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
              <div className="space-y-2">
                {(mission.guide_draft as string[]).map((line, lineIdx) => (
                  <div key={lineIdx} className="flex gap-2 items-center">
                    <span className="text-xs text-white/30 w-4">{lineIdx + 1}.</span>
                    <input
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8]"
                      placeholder={`가이드 ${lineIdx + 1}`}
                      value={line}
                      onChange={e => {
                        const newGuide = [...(mission.guide_draft as string[])]
                        newGuide[lineIdx] = e.target.value
                        updateMission(mission.id, { guide_draft: newGuide })
                      }}
                    />
                    <button
                      onClick={() => {
                        const newGuide = (mission.guide_draft as string[]).filter((_, i) => i !== lineIdx)
                        updateMission(mission.id, { guide_draft: newGuide.length ? newGuide : [''] })
                      }}
                      className="text-white/20 hover:text-red-400 text-sm px-1"
                    >✕</button>
                  </div>
                ))}
                <button
                  onClick={() => updateMission(mission.id, { guide_draft: [...(mission.guide_draft as string[]), ''] })}
                  className="text-xs text-[#9B7EC8] hover:text-[#9B7EC8]/80 transition-colors"
                >
                  + 가이드 추가
                </button>
              </div>
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
