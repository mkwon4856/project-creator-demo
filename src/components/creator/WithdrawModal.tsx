'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MIN_WITHDRAWAL_AMOUNT, calcWithholding } from '@/lib/credits'

interface WithdrawModalProps {
  open: boolean
  available: number
  creatorId: string
  onClose: () => void
  onDone: () => void
}

export function WithdrawModal({ open, available, creatorId, onClose, onDone }: WithdrawModalProps) {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      setAmount('')
      setError(null)
      setSubmitting(false)
    }
  }, [open])

  const numeric = Math.floor(Number(amount.replace(/[^0-9]/g, '')) || 0)
  const { tax, net } = useMemo(() => calcWithholding(numeric), [numeric])

  const tooSmall = numeric > 0 && numeric < MIN_WITHDRAWAL_AMOUNT
  const tooLarge = numeric > available
  const canSubmit = numeric >= MIN_WITHDRAWAL_AMOUNT && numeric <= available && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    const { error: rpcErr } = await supabase.rpc('request_withdrawal', {
      p_creator_id: creatorId,
      p_amount: numeric,
    })
    if (rpcErr) {
      setError(rpcErr.message)
      setSubmitting(false)
      return
    }
    setSubmitting(false)
    onDone()
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#15151D] border border-white/10 rounded-2xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Arial Black' }}>
            출금 신청
          </h2>
          <p className="text-xs text-white/40 mt-1">원천징수 3.3% 차감 후 실수령액이 지급됩니다</p>
        </div>

        {/* 출금 가능 잔액 */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="text-xs text-white/40">출금 가능 잔액</div>
          <div className="text-2xl font-black text-[#E5B567] mt-1 tabular-nums" style={{ fontFamily: 'Arial Black' }}>
            ₩{available.toLocaleString()}
          </div>
        </div>

        {/* 금액 입력 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40">출금 금액 (세전)</label>
            <button
              type="button"
              onClick={() => setAmount(String(available))}
              className="text-xs text-[#9B7EC8] hover:underline"
            >
              전액 출금
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">₩</span>
            <input
              inputMode="numeric"
              value={numeric > 0 ? numeric.toLocaleString() : ''}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-right text-white tabular-nums placeholder-white/30 focus:outline-none focus:border-[#9B7EC8]"
            />
          </div>
          {tooSmall && (
            <p className="text-[11px] text-red-400">최소 출금 금액은 ₩{MIN_WITHDRAWAL_AMOUNT.toLocaleString()}입니다</p>
          )}
          {tooLarge && (
            <p className="text-[11px] text-red-400">출금 가능 잔액을 초과했습니다</p>
          )}
        </div>

        {/* 실수령 미리보기 */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">신청 금액</span>
            <span className="text-white tabular-nums">₩{numeric.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">원천징수 (3.3%)</span>
            <span className="text-red-400/80 tabular-nums">−₩{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-white/5">
            <span className="text-white/50">실수령액</span>
            <span className="text-[#E5B567] font-black tabular-nums" style={{ fontFamily: 'Arial Black' }}>
              ₩{net.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 정산 정보 안내 (현재 자리만 — 세무사 자문 후 실제 수집) */}
        <div className="bg-[#9B7EC8]/10 border border-[#9B7EC8]/20 rounded-xl p-3">
          <p className="text-[11px] text-white/60 leading-relaxed">
            출금을 위해 정산 정보(계좌·예금주) 등록이 필요합니다.{' '}
            <Link href="/creator/profile" className="text-[#9B7EC8] hover:underline">
              정산 정보 등록 →
            </Link>
          </p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-white/10 text-white/50 hover:bg-white/5 transition-all disabled:opacity-30"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-grow py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-30 hover:opacity-90"
            style={{ background: '#9B7EC8' }}
          >
            {submitting ? '신청 중...' : '출금 신청'}
          </button>
        </div>
      </div>
    </div>
  )
}
