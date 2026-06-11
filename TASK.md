# Project Creator — rebuild Task 8
## Admin 캠페인 승인 페이지

경로: src/app/admin/campaigns/page.tsx
디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black

---

## Task 8-1: Admin 캠페인 승인 page.tsx 전면 교체

src/app/admin/campaigns/page.tsx 를 아래 내용으로 완전 교체:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Campaign, Mission } from '@/lib/db.types'

const CONTENT_TYPE_LABELS: Record<string, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
}

type CampaignWithRelations = Campaign & {
  missions: Mission[]
  studios: { company_name: string } | null
}

type Tab = 'pending' | 'active' | 'all'

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const [adminNote, setAdminNote] = useState<Record<string, string>>({})
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('campaigns')
      .select('*, missions(*), studios(company_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCampaigns((data ?? []) as CampaignWithRelations[])
        setLoading(false)
      })
  }, [])

  const handleApprove = async (campaign: CampaignWithRelations) => {
    setProcessing(campaign.id)
    await supabase
      .from('campaigns')
      .update({ status: 'active', admin_note: adminNote[campaign.id] ?? null, launched_at: new Date().toISOString() })
      .eq('id', campaign.id)
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: 'active' } : c))
    setProcessing(null)
  }

  const handleHold = async (campaign: CampaignWithRelations) => {
    if (!adminNote[campaign.id]?.trim()) {
      alert('홀드 사유를 입력해주세요')
      return
    }
    setProcessing(campaign.id)
    await supabase
      .from('campaigns')
      .update({ status: 'pending', admin_note: adminNote[campaign.id] })
      .eq('id', campaign.id)
    setProcessing(null)
  }

  const filtered = campaigns.filter(c => {
    if (tab === 'pending') return c.status === 'pending'
    if (tab === 'active') return c.status === 'active'
    return true
  })

  const pendingCount = campaigns.filter(c => c.status === 'pending').length

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-white/30">로딩 중...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
          캠페인 승인 관리
        </h1>

        {/* 탭 */}
        <div className="flex gap-2">
          {([
            { key: 'pending', label: `대기중 (${pendingCount})` },
            { key: 'active', label: '승인됨' },
            { key: 'all', label: '전체' },
          ] as { key: Tab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-[#9B7EC8] text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 캠페인 목록 */}
        {filtered.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center border border-dashed border-white/10">
            <p className="text-white/30 text-sm">캠페인이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(campaign => (
              <div key={campaign.id} className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-4">
                {/* 헤더 */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white">{campaign.title}</div>
                    <div className="text-xs text-white/40 mt-0.5">
                      {campaign.studios?.company_name} · {campaign.game_name}
                    </div>
                    <div className="text-xs text-[#E5B567] mt-1">
                      총 예산: ₩{campaign.total_budget.toLocaleString()}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    campaign.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    campaign.status === 'active' ? 'bg-[#9B7EC8]/20 text-[#9B7EC8]' :
                    'bg-white/10 text-white/40'
                  }`}>
                    {campaign.status === 'pending' ? '승인 대기' :
                     campaign.status === 'active' ? '승인됨' : campaign.status}
                  </span>
                </div>

                {/* 미션 가이드 */}
                {campaign.missions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-white/40 font-medium">미션 가이드 검토</div>
                    {campaign.missions.map(mission => (
                      <div key={mission.id} className="bg-white/5 rounded-lg p-3">
                        <div className="flex gap-2 items-center mb-1">
                          <span className="text-xs font-medium text-[#9B7EC8]">
                            {CONTENT_TYPE_LABELS[mission.content_type]}
                          </span>
                          <span className="text-xs text-white/30">
                            {mission.allowed_grades.join('/')}등급
                          </span>
                          {mission.is_auto_generated && (
                            <span className="text-xs text-[#E5B567]/60">자동배분</span>
                          )}
                        </div>
                        {mission.guide_draft ? (
                          <p className="text-xs text-white/50">{mission.guide_draft}</p>
                        ) : (
                          <p className="text-xs text-white/20 italic">가이드 없음</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin 메모 + 액션 (pending만) */}
                {campaign.status === 'pending' && (
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8]"
                      placeholder="Admin 메모 (홀드 시 게임사에 전달됩니다)"
                      value={adminNote[campaign.id] ?? ''}
                      onChange={e => setAdminNote(prev => ({ ...prev, [campaign.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleHold(campaign)}
                        disabled={processing === campaign.id}
                        className="flex-1 py-2 rounded-lg text-sm font-medium border border-white/10 text-white/50 hover:bg-white/5 transition-all disabled:opacity-30"
                      >
                        홀드 — 수정 요청
                      </button>
                      <button
                        onClick={() => handleApprove(campaign)}
                        disabled={processing === campaign.id}
                        className="flex-2 flex-grow py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-30 hover:opacity-90"
                        style={{ background: '#9B7EC8' }}
                      >
                        {processing === campaign.id ? '처리 중...' : '승인하기 ✓'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 승인된 캠페인의 admin_note */}
                {campaign.status !== 'pending' && campaign.admin_note && (
                  <div className="text-xs text-white/30 pt-2 border-t border-white/5">
                    메모: {campaign.admin_note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
```

---

## 완료 후

1. git add . && git commit -m "rebuild: admin campaign approval page" && git push origin rebuild
2. PROGRESS.md 업데이트
