'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogoutInline } from '@/components/layout/LogoutInline'

interface Metrics {
  totalCampaigns: number
  pendingCampaigns: number
  pendingReviews: number
  totalCreators: number
}

export default function AdminOverviewPage() {
  const router = useRouter()
  const [m, setM] = useState<Metrics | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const head = { count: 'exact' as const, head: true }
    Promise.all([
      supabase.from('campaigns').select('id', head),
      supabase.from('campaigns').select('id', head).eq('status', 'pending'),
      supabase.from('submissions').select('id', head).eq('status', 'pending'),
      supabase.from('creators').select('id', head),
    ]).then(([all, pendC, pendR, creators]) => {
      setM({
        totalCampaigns: all.count ?? 0,
        pendingCampaigns: pendC.count ?? 0,
        pendingReviews: pendR.count ?? 0,
        totalCreators: creators.count ?? 0,
      })
    })
  }, [])

  if (!m) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-white/30">로딩 중...</div>
    </div>
  )

  const cards = [
    { label: '전체 캠페인', value: m.totalCampaigns, color: 'text-white' },
    { label: '승인 대기', value: m.pendingCampaigns, color: 'text-yellow-400' },
    { label: '검수 대기', value: m.pendingReviews, color: 'text-[#9B7EC8]' },
    { label: '전체 크리에이터', value: m.totalCreators, color: 'text-white' },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
            관리자 대시보드
          </h1>
          <LogoutInline />
        </div>

        {/* 메트릭 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cards.map(c => (
            <div key={c.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="text-xs text-white/40">{c.label}</div>
              <div className={`text-2xl font-black mt-1 ${c.color}`} style={{ fontFamily: 'Arial Black' }}>
                {c.value}
              </div>
            </div>
          ))}
        </div>

        {/* 바로가기 */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/admin/campaigns')}
            className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-5 border border-white/5 flex justify-between items-center transition-all text-left"
          >
            <div>
              <div className="font-medium text-white">캠페인 승인</div>
              <div className="text-xs text-white/40 mt-0.5">
                게임사가 제출한 캠페인을 검토하고 승인합니다
              </div>
            </div>
            <div className="flex items-center gap-3">
              {m.pendingCampaigns > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                  {m.pendingCampaigns}건 대기
                </span>
              )}
              <span className="text-white/30">→</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/payouts')}
            className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-5 border border-white/5 flex justify-between items-center transition-all text-left"
          >
            <div>
              <div className="font-medium text-white">콘텐츠 검수</div>
              <div className="text-xs text-white/40 mt-0.5">
                크리에이터가 제출한 콘텐츠를 검수하고 승인합니다
              </div>
            </div>
            <div className="flex items-center gap-3">
              {m.pendingReviews > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#9B7EC8]/20 text-[#9B7EC8]">
                  {m.pendingReviews}건 대기
                </span>
              )}
              <span className="text-white/30">→</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/creators')}
            className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-5 border border-white/5 flex justify-between items-center transition-all text-left"
          >
            <div>
              <div className="font-medium text-white">크리에이터 / 게임사</div>
              <div className="text-xs text-white/40 mt-0.5">등록된 사용자 디렉터리</div>
            </div>
            <span className="text-white/30">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
