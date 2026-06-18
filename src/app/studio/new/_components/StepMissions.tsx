'use client'
import { useMemo } from 'react'
import { RATE_MATRIX, toStudioAmount, estimateParticipants } from '@/lib/pricing'
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

  const valid = state.total_budget > 0 && state.missions.length > 0 && state.missions.every(m => m.allowed_grades.length > 0)

  // 예상 참여 인원 (총예산/미션/등급 변경 시 즉시 갱신)
  const GRADE_ORDER: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E']
  const estimate = useMemo(
    () => estimateParticipants(
      state.total_budget,
      state.missions.map(m => ({ content_type: m.content_type, grades: m.allowed_grades })),
    ),
    [state.total_budget, state.missions],
  )
  const selectedGrades = GRADE_ORDER.filter(g => g in estimate.perGrade)

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

          </div>
        ))}

        {state.missions.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
            미션을 추가해주세요
          </div>
        )}
      </div>

      {/* 예상 참여 크리에이터 */}
      {state.total_budget > 0 && state.missions.length > 0 && (
        <div className="rounded-xl border border-[#9B7EC8]/30 bg-gradient-to-br from-[#1a1030] to-[#0A0A0F] p-5">
          {selectedGrades.length === 0 ? (
            <p className="text-sm text-white/50 text-center py-2">
              참여 가능한 등급을 선택하면 예상 인원이 표시됩니다
            </p>
          ) : (
            <>
              {/* 상단: 총 예상 (균등 배분) */}
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-white" style={{ fontFamily: 'Arial Black' }}>
                    예상 참여 크리에이터
                  </h3>
                  <p className="text-xs text-white/50 mt-1">선택한 등급에 예산을 고르게 배분할 경우</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-black text-[#E5B567]" style={{ fontFamily: 'Arial Black' }}>
                    약 {estimate.equalTotal.toLocaleString()}명
                  </div>
                </div>
              </div>

              {/* 하단: 등급별 단독 참여 시 */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 mb-3">등급별로 참여할 경우</p>
                <div className="space-y-2">
                  {selectedGrades.map(g => (
                    <div key={g} className="flex items-center gap-3">
                      <span className="w-7 h-7 shrink-0 rounded-full bg-[#E5B567] text-black text-sm font-black flex items-center justify-center" style={{ fontFamily: 'Arial Black' }}>
                        {g}
                      </span>
                      <span className="text-sm text-white/70">{g}등급으로만 참여 시</span>
                      <span className="ml-auto text-sm font-bold text-white">
                        약 {(estimate.perGrade[g] ?? 0).toLocaleString()}명
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-all">
          ← 이전
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="flex-2 flex-grow py-3 rounded-lg font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: valid ? '#9B7EC8' : undefined }}
        >
          다음 →
        </button>
      </div>
    </div>
  )
}
