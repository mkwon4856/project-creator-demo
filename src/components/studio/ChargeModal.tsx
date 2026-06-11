'use client'
import { useState } from 'react'

const PRESETS = [1000000, 3000000, 5000000, 10000000]
const MIN_CHARGE = 100000

function formatKRW(n: number): string {
  return `${n.toLocaleString()}원`
}

export function ChargeModal({
  open,
  onClose,
  onCharged,
}: {
  open: boolean
  onClose: () => void
  onCharged: (available: number) => void
}) {
  const [amount, setAmount] = useState<number>(PRESETS[0])
  const [custom, setCustom] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const effectiveAmount = custom.trim() ? Number(custom.replace(/[^0-9]/g, '')) : amount

  const handleCharge = async () => {
    if (!Number.isFinite(effectiveAmount) || effectiveAmount < MIN_CHARGE) {
      setError(`최소 ${formatKRW(MIN_CHARGE)}부터 충전할 수 있습니다.`)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/credits/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.floor(effectiveAmount) }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error ?? '충전에 실패했습니다.')
        return
      }
      onCharged(json.available as number)
      onClose()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="bg-[#14141A] rounded-2xl border border-white/10 w-full max-w-md p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Arial Black' }}>
              크레딧 충전
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E5B567]/20 text-[#E5B567]">
              테스트 충전
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">PG 미연동 — 시연용 즉시 충전입니다.</p>
        </div>

        {/* 프리셋 */}
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => { setAmount(p); setCustom('') }}
              className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                !custom.trim() && amount === p
                  ? 'bg-[#9B7EC8] text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {formatKRW(p)}
            </button>
          ))}
        </div>

        {/* 직접 입력 */}
        <div>
          <label className="text-xs text-white/40">직접 입력 (최소 {formatKRW(MIN_CHARGE)})</label>
          <input
            inputMode="numeric"
            value={custom}
            onChange={e => { setCustom(e.target.value); setError(null) }}
            placeholder="예: 2000000"
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8]"
          />
        </div>

        <div className="text-sm text-white/60">
          충전 금액: <span className="text-[#E5B567] font-medium">{formatKRW(Math.max(0, Math.floor(effectiveAmount) || 0))}</span>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm font-medium border border-white/10 text-white/50 hover:bg-white/5 transition-all"
          >
            취소
          </button>
          <button
            onClick={handleCharge}
            disabled={submitting}
            className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: '#9B7EC8' }}
          >
            {submitting ? '충전 중...' : '충전하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
