'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCreator } from '@/lib/supabase/hooks'
import { LogoutInline } from '@/components/layout/LogoutInline'
import { formatHoldRemaining } from '@/lib/credits'
import type {
  Application,
  Campaign,
  Mission,
  Submission,
  Payment,
  ContentType,
} from '@/lib/db.types'

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
}

type AppRow = Application & {
  campaigns: Pick<Campaign, 'title' | 'game_name'> | null
  missions: Pick<Mission, 'content_type' | 'creator_amount'> | null
}

// 새 컬럼(approved_at/paid_at)은 db.types에 없으므로 로컬 보강
type SubRow = Submission & { approved_at: string | null; paid_at: string | null }

type Kind = 'paid' | 'holding' | 'reviewing' | 'rejected'

interface EarningRow {
  id: string
  campaignTitle: string
  contentType: ContentType
  amount: number
  kind: Kind
  approvedAt: string | null
  net: number | null
}

export default function CreatorEarningsPage() {
  const router = useRouter()
  const { creator, loading: creatorLoading } = useCreator()
  const [rows, setRows] = useState<EarningRow[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = async (creatorId: string) => {
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

    const { data: payData } = await supabase
      .from('payments')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })
    const pays = (payData ?? []) as Payment[]
    setPayments(pays)
    const netBySubmission = new Map(pays.map(p => [p.submission_id, p.net_amount]))

    const mapped: EarningRow[] = subs.map(s => {
      const app = appById.get(s.application_id)
      const amount = app?.missions?.creator_amount ?? 0
      let kind: Kind
      if (s.status === 'rejected') kind = 'rejected'
      else if (s.status === 'pending') kind = 'reviewing'
      else if (s.paid_at) kind = 'paid'
      else kind = 'holding' // approved이지만 아직 지급 전(홀드 중)
      return {
        id: s.id,
        campaignTitle: app?.campaigns?.title ?? '알 수 없는 캠페인',
        contentType: app?.content_type ?? 'shortform',
        amount,
        kind,
        approvedAt: s.approved_at,
        net: netBySubmission.get(s.id) ?? null,
      }
    })
    setRows(mapped)
    setLoading(false)
  }

  useEffect(() => {
    if (!creator) return
    const creatorId = creator.id
    ;(async () => {
      // 진입 시 홀드 끝난 건 지급 처리(조회 시점) 후 데이터 로드
      try {
        await fetch('/api/credits/process-payouts', { method: 'POST' })
      } catch {
        // 무시 — 지급 실패해도 현황은 표시
      }
      await load(creatorId)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creator])

  const paidTotal = useMemo(() => payments.reduce((s, p) => s + p.net_amount, 0), [payments])
  const holdingTotal = useMemo(
    () => rows.filter(r => r.kind === 'holding').reduce((s, r) => s + r.amount, 0),
    [rows],
  )
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

  const earningRows = rows.filter(r => r.kind !== 'rejected')

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
              수익 현황
            </h1>
            <p className="text-xs text-white/30 mt-1">승인 후 홀드기간 경과 시 자동 지급</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => router.push('/creator/activity')}
              className="text-xs text-[#9B7EC8] hover:text-[#9B7EC8]/80 transition-colors"
            >
              지원 현황 →
            </button>
            <LogoutInline />
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="text-xs text-white/40">지급 완료</div>
            <div className="text-lg font-black text-green-400 mt-1 tabular-nums" style={{ fontFamily: 'Arial Black' }}>
              ₩{paidTotal.toLocaleString()}
            </div>
            <div className="text-[10px] text-white/30 mt-1">실수령 합계</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="text-xs text-white/40">지급 대기</div>
            <div className="text-lg font-black text-[#E5B567] mt-1 tabular-nums" style={{ fontFamily: 'Arial Black' }}>
              ₩{holdingTotal.toLocaleString()}
            </div>
            <div className="text-[10px] text-white/30 mt-1">홀드 진행 중</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="text-xs text-white/40">검수 대기</div>
            <div className="text-lg font-black text-white/70 mt-1 tabular-nums" style={{ fontFamily: 'Arial Black' }}>
              ₩{reviewingTotal.toLocaleString()}
            </div>
            <div className="text-[10px] text-white/30 mt-1">승인 시 확정</div>
          </div>
        </div>

        {/* 지급 내역 (payments) */}
        {payments.length > 0 && (
          <div>
            <div className="text-sm font-medium text-white mb-2">지급 내역</div>
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="bg-white/5 rounded-xl p-3 border border-white/5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">지급 전 금액</span>
                    <span className="text-white tabular-nums">₩{p.total_before_tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-white/50">원천징수 (3.3%)</span>
                    <span className="text-red-400/80 tabular-nums">−₩{p.withholding_tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mt-1 pt-1 border-t border-white/5">
                    <span className="text-white/50">실수령</span>
                    <span className="text-green-400 font-medium tabular-nums">₩{p.net_amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 콘텐츠별 내역 */}
        <div>
          <div className="text-sm font-medium text-white mb-2">콘텐츠별 내역</div>
          {earningRows.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-8 text-center border border-dashed border-white/10">
              <p className="text-white/30 text-sm">제출한 콘텐츠가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {earningRows.map(r => (
                <div key={r.id} className="bg-white/5 rounded-xl p-3 border border-white/5 flex justify-between items-center">
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{r.campaignTitle}</div>
                    <div className="text-xs text-white/40 mt-0.5">{CONTENT_TYPE_LABELS[r.contentType]}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium tabular-nums ${
                      r.kind === 'paid' ? 'text-green-400' : r.kind === 'holding' ? 'text-[#E5B567]' : 'text-white/50'
                    }`}>
                      ₩{(r.kind === 'paid' && r.net != null ? r.net : r.amount).toLocaleString()}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${
                      r.kind === 'paid' ? 'text-green-400' :
                      r.kind === 'holding' ? 'text-[#E5B567]' : 'text-yellow-400'
                    }`}>
                      {r.kind === 'paid'
                        ? '지급 완료'
                        : r.kind === 'holding'
                          ? (r.approvedAt ? formatHoldRemaining(r.approvedAt) : '지급 대기')
                          : '검수 중'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-white/25 text-center pt-2">
          검수 승인 후 홀드기간 경과 시 자동 지급 · 원천징수 3.3% 차감 후 지급
        </p>
      </div>
    </div>
  )
}
