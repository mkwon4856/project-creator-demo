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

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">모집 마감일</label>
        <input
          type="date"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8] [color-scheme:dark]"
          value={state.deadline}
          onChange={e => onChange({ deadline: e.target.value })}
        />
        <p className="text-xs text-white/30 mt-1.5">
          크리에이터가 지원할 수 있는 마지막 날이에요. 비워두면 상시 모집으로 표시됩니다.
        </p>
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
