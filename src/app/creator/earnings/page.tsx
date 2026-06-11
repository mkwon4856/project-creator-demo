'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCreator } from '@/lib/supabase/hooks'
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

interface EarningRow {
  id: string
  campaignTitle: string
  contentType: ContentType
  amount: number
  status: Submission['status']
  reviewedAt: string | null
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
    let subs: Submission[] = []
    if (appIds.length > 0) {
      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .in('application_id', appIds)
      subs = (subData ?? []) as Submission[]
    }

    const mapped: EarningRow[] = subs.map(s => {
      const app = appById.get(s.application_id)
      return {
        id: s.id,
        campaignTitle: app?.campaigns?.title ?? '알 수 없는 캠페인',
        contentType: app?.content_type ?? 'shortform',
        amount: app?.missions?.creator_amount ?? 0,
        status: s.status,
        reviewedAt: s.reviewed_at,
      }
    })
    setRows(mapped)

    const { data: payData } = await supabase
      .from('payments')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })
    setPayments((payData ?? []) as Payment[])

    setLoading(false)
  }

  useEffect(() => {
    if (!creator) return
    load(creator.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creator])

  const confirmed = useMemo(
    () => rows.filter(r => r.status === 'approved').reduce((s, r) => s + r.amount, 0),
    [rows],
  )
  const pending = useMemo(
    () => rows.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0),
    [rows],
  )
  const paidTotal = useMemo(
    () => payments.reduce((s, p) => s + p.net_amount, 0),
    [payments],
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
    <div className="min-h-screen bg-[#0A0A0F] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
              수익 현황
            </h1>
            <p className="text-xs text-white/30 mt-1">승인된 콘텐츠 기준 수익</p>
          </div>
          <button
            onClick={() => router.push('/creator/activity')}
            className="text-xs text-[#9B7EC8] hover:text-[#9B7EC8]/80 transition-colors"
          >
            지원 현황 →
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="text-xs text-white/40">확정 수익</div>
            <div className="text-xl font-black text-[#E5B567] mt-1" style={{ fontFamily: 'Arial Black' }}>
              ₩{confirmed.toLocaleString()}
            </div>
            <div className="text-[10px] text-white/30 mt-1">검수 승인 완료</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="text-xs text-white/40">검수 대기 수익</div>
            <div className="text-xl font-black text-white/70 mt-1" style={{ fontFamily: 'Arial Black' }}>
              ₩{pending.toLocaleString()}
            </div>
            <div className="text-[10px] text-white/30 mt-1">승인 시 확정</div>
          </div>
        </div>

        {/* 실 지급 내역 */}
        <div>
          <div className="text-sm font-medium text-white mb-2">지급 내역</div>
          {payments.length > 0 ? (
            <div className="space-y-2">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                <span className="text-xs text-white/40">총 지급액 (실수령)</span>
                <span className="text-lg font-black text-green-400" style={{ fontFamily: 'Arial Black' }}>
                  ₩{paidTotal.toLocaleString()}
                </span>
              </div>
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
          ) : (
            <div className="bg-white/5 rounded-xl p-4 border border-dashed border-white/10">
              <p className="text-sm text-white/40">아직 지급된 내역이 없습니다 — 정산 예정</p>
              <p className="text-xs text-white/30 mt-1">
                매월 말 기준 익월 일괄 정산 (원천징수 3.3% 차감)
              </p>
            </div>
          )}
        </div>

        {/* 콘텐츠별 내역 */}
        <div>
          <div className="text-sm font-medium text-white mb-2">콘텐츠별 내역</div>
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
                    <div className={`text-sm font-medium tabular-nums ${r.status === 'approved' ? 'text-[#E5B567]' : 'text-white/50'}`}>
                      ₩{r.amount.toLocaleString()}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${
                      r.status === 'approved' ? 'text-green-400' :
                      r.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {r.status === 'approved' ? '확정' : r.status === 'pending' ? '검수 중' : '거절됨'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-white/25 text-center pt-2">
          매월 말 기준 익월 일괄 정산 · 원천징수 3.3% 차감 후 지급
        </p>
      </div>
    </div>
  )
}
