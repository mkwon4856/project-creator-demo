'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useStudio } from '@/lib/supabase/hooks'
import { CreditBalance } from '@/components/studio/CreditBalance'
import { TopNav } from '@/components/layout/TopNav'
import type { Campaign } from '@/lib/db.types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:       { label: '작성 중',    color: 'bg-white/10 text-white/50' },
  pending:     { label: '승인 대기',  color: 'bg-yellow-500/20 text-yellow-400' },
  active:      { label: '모집 중',    color: 'bg-[#9B7EC8]/20 text-[#9B7EC8]' },
  in_progress: { label: '진행 중',    color: 'bg-blue-500/20 text-blue-400' },
  reviewing:   { label: '검수 중',    color: 'bg-orange-500/20 text-orange-400' },
  completed:   { label: '완료',       color: 'bg-green-500/20 text-green-400' },
  cancelled:   { label: '취소',       color: 'bg-red-500/20 text-red-400' },
}

export default function StudioDashboard() {
  const router = useRouter()
  const { studio, loading: studioLoading } = useStudio()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!studio) return
    supabase
      .from('campaigns')
      .select('*')
      .eq('studio_id', studio.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCampaigns(data ?? [])
        setLoading(false)
      })
  }, [studio])

  if (studioLoading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-white/30">로딩 중...</div>
    </div>
  )

  const activeCampaigns = campaigns.filter(c => ['active', 'in_progress', 'reviewing', 'pending'].includes(c.status))
  const completedCampaigns = campaigns.filter(c => c.status === 'completed')
  const totalSpent = completedCampaigns.reduce((sum, c) => sum + c.total_budget, 0)

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <TopNav role="studio" />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* 헤더 */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
              안녕하세요, {studio?.company_name ?? ''}님 👋
            </h1>
            <p className="text-white/40 text-sm mt-1">캠페인 현황을 한눈에 확인하세요</p>
          </div>
          <button
            onClick={() => router.push('/studio/new')}
            className="shrink-0 px-4 py-2 rounded-lg font-bold text-white text-sm transition-all hover:opacity-90"
            style={{ background: '#9B7EC8' }}
          >
            + 캠페인 만들기
          </button>
        </div>

        {/* 크레딧 잔액 */}
        <CreditBalance />

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: '진행중 캠페인', value: activeCampaigns.length, unit: '개' },
            { label: '완료된 캠페인', value: completedCampaigns.length, unit: '개' },
            { label: '전체 캠페인', value: campaigns.length, unit: '개' },
            { label: '총 집행 예산', value: `₩${Math.round(totalSpent / 10000).toLocaleString()}만`, unit: '' },
          ].map(({ label, value, unit }) => (
            <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="text-xs text-white/40 mb-1">{label}</div>
              <div className="text-xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
                {value}{unit}
              </div>
            </div>
          ))}
        </div>

        {/* 진행중 캠페인 */}
        <div>
          <h2 className="text-sm font-medium text-white/50 mb-3">진행중 캠페인</h2>
          {activeCampaigns.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-8 text-center border border-dashed border-white/10">
              <p className="text-white/30 text-sm mb-4">진행중인 캠페인이 없습니다</p>
              <button
                onClick={() => router.push('/studio/new')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: '#9B7EC8' }}
              >
                첫 캠페인 만들기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCampaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-white">{campaign.title}</div>
                      <div className="text-xs text-white/40 mt-0.5">{campaign.game_name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[campaign.status]?.color}`}>
                        {STATUS_LABELS[campaign.status]?.label}
                      </span>
                      <span className="text-xs text-white/30">
                        ₩{Math.round(campaign.total_budget / 10000).toLocaleString()}만
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 전체 캠페인 */}
        {campaigns.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-white/50 mb-3">전체 캠페인</h2>
            <div className="space-y-2">
              {campaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all cursor-pointer flex justify-between items-center"
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                >
                  <div>
                    <div className="text-sm font-medium text-white">{campaign.title}</div>
                    <div className="text-xs text-white/30 mt-0.5">
                      {new Date(campaign.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_LABELS[campaign.status]?.color}`}>
                      {STATUS_LABELS[campaign.status]?.label}
                    </span>
                    <span className="text-xs text-white/30">
                      ₩{Math.round(campaign.total_budget / 10000).toLocaleString()}만
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
