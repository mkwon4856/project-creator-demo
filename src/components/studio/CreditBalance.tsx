'use client'
import { useCallback, useEffect, useState } from 'react'

import { ChargeModal } from './ChargeModal'

interface Balance {
  total_charged: number
  available: number
  held: number
}

function formatKRW(n: number): string {
  return `${n.toLocaleString()}원`
}

export function CreditBalance() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/credits/balance', { cache: 'no-store' })
      if (!res.ok) return
      const json = (await res.json()) as Balance
      setBalance({
        total_charged: json.total_charged ?? 0,
        available: json.available ?? 0,
        held: json.held ?? 0,
      })
    } catch {
      // 무시 — 카드 비표시 대신 0 처리
      setBalance({ total_charged: 0, available: 0, held: 0 })
    }
  }, [])

  useEffect(() => {
    void fetchBalance()
  }, [fetchBalance])

  const b = balance ?? { total_charged: 0, available: 0, held: 0 }

  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-white/40">사용 가능한 크레딧</div>
          <div
            className="text-3xl font-black text-[#E5B567] mt-1 tabular-nums"
            style={{ fontFamily: 'Arial Black' }}
          >
            {formatKRW(b.available)}
          </div>
          <div className="flex gap-4 mt-2">
            <div className="text-xs text-white/40">
              홀딩 중 <span className="text-white/60 tabular-nums">{formatKRW(b.held)}</span>
            </div>
            <div className="text-xs text-white/30">
              누적 충전 <span className="tabular-nums">{formatKRW(b.total_charged)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 shrink-0"
          style={{ background: '#9B7EC8' }}
        >
          충전하기
        </button>
      </div>

      <ChargeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCharged={() => { void fetchBalance() }}
      />
    </div>
  )
}
