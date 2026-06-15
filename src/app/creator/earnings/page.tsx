'use client'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCreator } from '@/lib/supabase/hooks'
import { TopNav } from '@/components/layout/TopNav'
import { WithdrawModal } from '@/components/creator/WithdrawModal'
import { MIN_WITHDRAWAL_AMOUNT, formatHoldRemaining } from '@/lib/credits'
import type {
  Application,
  Campaign,
  Mission,
  Submission,
  ContentType,
} from '@/lib/db.types'

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
}

const WITHDRAWAL_STATUS: Record<string, { label: string; cls: string }> = {
  requested: { label: '신청 접수', cls: 'text-[#E5B567]' },
  processing: { label: '처리 중', cls: 'text-[#9B7EC8]' },
  completed: { label: '지급 완료', cls: 'text-green-400' },
  rejected: { label: '반려', cls: 'text-red-400' },
}

type AppRow = Application & {
  campaigns: Pick<Campaign, 'title' | 'game_name'> | null
  missions: Pick<Mission, 'content_type' | 'creator_amount'> | null
}

// 새 컬럼(approved_at/paid_at)은 db.types에 없으므로 로컬 보강
type SubRow = Submission & { approved_at: string | null; paid_at: string | null }

// 새 테이블(creator_balances/withdrawals)도 db.types에 없으므로 로컬 보강
interface CreatorBalance {
  available: number
  pending: number
  total_earned: number
  total_withdrawn: number
}

interface Withdrawal {
  id: string
  amount: number
  withholding_tax: number
  net_amount: number
  status: string
  requested_at: string | null
}

type Kind = 'accrued' | 'holding' | 'reviewing'

interface EarningRow {
  id: string
  campaignTitle: string
  contentType: ContentType
  amount: number
  kind: Kind
  approvedAt: string | null
}

export default function CreatorEarningsPage() {
  const { creator, loading: creatorLoading } = useCreator()
  const [balance, setBalance] = useState<CreatorBalance>({
    available: 0,
    pending: 0,
    total_earned: 0,
    total_withdrawn: 0,
  })
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [rows, setRows] = useState<EarningRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const supabase = createClient()

  const load = async (creatorId: string) => {
    // 잔액
    const { data: balData } = await supabase
      .from('creator_balances')
      .select('available, pending, total_earned, total_withdrawn')
      .eq('creator_id', creatorId)
      .maybeSingle()
    if (balData) setBalance(balData as CreatorBalance)

    // 출금 내역
    const { data: wData } = await supabase
      .from('withdrawals')
      .select('id, amount, withholding_tax, net_amount, status, requested_at')
      .eq('creator_id', creatorId)
      .order('requested_at', { ascending: false })
    setWithdrawals((wData ?? []) as Withdrawal[])

    // 수익 상세 (submission별)
    const { data: appData } = await supabase
      .from('applications')
      .select('*, campaigns(title, game_name), missions(content_type, creator_amount)')
      .eq('creator_id', creatorId)
    const apps = (appData ?? []) as AppRow[]
    const appById = new Map(apps.map(a => [a.id, a]))

    const appIds = apps.map(a => a.id)
    let subs: SubRow[] = []
    if (appIds.length > 0) {
      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .in('application_id', appIds)
      subs = (subData ?? []) as SubRow[]
    }

    const mapped: EarningRow[] = subs
      .filter(s => s.status !== 'rejected')
      .map(s => {
        const app = appById.get(s.application_id)
        const amount = app?.missions?.creator_amount ?? 0
        let kind: Kind
        if (s.status === 'pending') kind = 'reviewing'
        else if (s.paid_at) kind = 'accrued' // 적립 완료 → 출금 가능 잔액에 반영됨
        else kind = 'holding' // approved이지만 아직 홀드 중(적립 대기)
        return {
          id: s.id,
          campaignTitle: app?.campaigns?.title ?? '알 수 없는 캠페인',
          contentType: app?.content_type ?? 'shortform',
          amount,
          kind,
          approvedAt: s.approved_at,
        }
      })
    setRows(mapped)
    setLoading(false)
  }

  useEffect(() => {
    if (!creator) return
    const creatorId = creator.id
    ;(async () => {
      // 진입 시 홀드 끝난 건을 출금 가능 잔액으로 전환 후 데이터 로드
      try {
        await fetch('/api/credits/process-payouts', { method: 'POST' })
      } catch {
        // 무시 — 적립 실패해도 현황은 표시
      }
      await load(creatorId)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creator])

  const canWithdraw = balance.available >= MIN_WITHDRAWAL_AMOUNT

  const reviewingTotal = useMemo(
    () => rows.filter(r => r.kind === 'reviewing').reduce((s, r) => s + r.amount, 0),
    [rows],
  )

  if (creatorLoading || loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-white/30">로딩 중...</div>
    </div>
  )

  if (!creator) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-white/50 text-sm">크리에이터 프로필이 없습니다.</p>
        <p className="text-white/30 text-xs mt-1">크리에이터로 가입한 계정으로 로그인해주세요.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <TopNav role="creator" />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
            수익 · 출금
          </h1>
          <p className="text-xs text-white/30 mt-1">검수 승인 후 24시간 뒤 출금 가능 잔액으로 적립됩니다</p>
        </div>

        {/* 잔액 카드 */}
        <div className="space-y-3">
          {/* 출금 가능 — 강조 */}
          <div className="bg-gradient-to-br from-[#E5B567]/15 to-[#9B7EC8]/10 rounded-2xl p-5 border border-[#E5B567]/20">
            <div className="text-xs text-white/50">출금 가능</div>
            <div className="text-3xl font-black text-[#E5B567] mt-1 tabular-nums" style={{ fontFamily: 'Arial Black' }}>
              ₩{balance.available.toLocaleString()}
            </div>
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={!canWithdraw}
              className="mt-4 w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-30 hover:opacity-90"
              style={{ background: '#9B7EC8' }}
            >
              출금 신청
            </button>
            {!canWithdraw && (
              <p className="text-[11px] text-white/30 mt-2 text-center">
                최소 출금 금액 ₩{MIN_WITHDRAWAL_AMOUNT.toLocaleString()} 이상부터 신청할 수 있습니다
              </p>
            )}
          </div>

          {/* 적립 대기 + 누적 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="text-xs text-white/40">적립 대기</div>
              <div className="text-lg font-black text-white/70 mt-1 tabular-nums" style={{ fontFamily: 'Arial Black' }}>
                ₩{balance.pending.toLocaleString()}
              </div>
              <div className="text-[10px] text-white/30 mt-1">검수 후 24시간 뒤 출금 가능</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="text-xs text-white/40">누적 수익</div>
              <div className="text-lg font-black text-white/70 mt-1 tabular-nums" style={{ fontFamily: 'Arial Black' }}>
                ₩{balance.total_earned.toLocaleString()}
              </div>
              <div className="text-[10px] text-white/30 mt-1">누적 출금 ₩{balance.total_withdrawn.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* 출금 내역 */}
        {withdrawals.length > 0 && (
          <div>
            <div className="text-sm font-medium text-white mb-2">출금 내역</div>
            <div className="space-y-2">
              {withdrawals.map(w => {
                const st = WITHDRAWAL_STATUS[w.status] ?? { label: w.status, cls: 'text-white/50' }
                return (
                  <div key={w.id} className="bg-white/5 rounded-xl p-3 border border-white/5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40">
                        {w.requested_at ? new Date(w.requested_at).toLocaleDateString('ko-KR') : '—'}
                      </span>
                      <span className={`font-medium ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-white/50">신청 금액</span>
                      <span className="text-white tabular-nums">₩{w.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-white/50">원천징수 (3.3%)</span>
                      <span className="text-red-400/80 tabular-nums">−₩{w.withholding_tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mt-1 pt-1 border-t border-white/5">
                      <span className="text-white/50">실수령</span>
                      <span className="text-green-400 font-medium tabular-nums">₩{w.net_amount.toLocaleString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 수익 상세 (콘텐츠별) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-white">수익 상세</div>
            {reviewingTotal > 0 && (
              <div className="text-[11px] text-white/30">검수 중 ₩{reviewingTotal.toLocaleString()}</div>
            )}
          </div>
          {rows.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-8 text-center border border-dashed border-white/10">
              <p className="text-white/30 text-sm">제출한 콘텐츠가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map(r => (
                <div key={r.id} className="bg-white/5 rounded-xl p-3 border border-white/5 flex justify-between items-center">
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{r.campaignTitle}</div>
                    <div className="text-xs text-white/40 mt-0.5">{CONTENT_TYPE_LABELS[r.contentType]}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium tabular-nums ${
                      r.kind === 'accrued' ? 'text-[#E5B567]' : r.kind === 'holding' ? 'text-white/70' : 'text-white/50'
                    }`}>
                      ₩{r.amount.toLocaleString()}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${
                      r.kind === 'accrued' ? 'text-[#E5B567]' :
                      r.kind === 'holding' ? 'text-white/40' : 'text-yellow-400'
                    }`}>
                      {r.kind === 'accrued'
                        ? '출금 가능'
                        : r.kind === 'holding'
                          ? (r.approvedAt ? `적립 대기 · ${formatHoldRemaining(r.approvedAt).replace('지급', '출금')}` : '적립 대기')
                          : '검수 중'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-white/25 text-center pt-2">
          검수 승인 → 24시간 적립 대기 → 출금 가능 잔액 적립 → 출금 신청 시 원천징수 3.3% 차감 후 지급
        </p>
      </div>

      <WithdrawModal
        open={showWithdraw}
        available={balance.available}
        creatorId={creator.id}
        onClose={() => setShowWithdraw(false)}
        onDone={() => load(creator.id)}
      />
    </div>
  )
}
