'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCreator } from '@/lib/supabase/hooks'
import { TopNav } from '@/components/layout/TopNav'
import { RATE_MATRIX } from '@/lib/pricing'
import type { Campaign, Mission, CreatorChannel, ContentType } from '@/lib/db.types'

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
}

type CampaignWithMissions = Campaign & {
  missions: Mission[]
  applications?: { count: number }[]
}

// 게임명 해시 기반 그라데이션 (썸네일 fallback)
function gameGradient(seed: string): string {
  const g = [
    'from-purple-900 via-[#0A0A0F] to-indigo-900',
    'from-rose-900 via-[#0A0A0F] to-purple-900',
    'from-blue-900 via-[#0A0A0F] to-cyan-900',
    'from-amber-900 via-[#0A0A0F] to-orange-900',
    'from-emerald-900 via-[#0A0A0F] to-teal-900',
    'from-fuchsia-900 via-[#0A0A0F] to-purple-900',
  ]
  let h = 0
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h)
  return g[Math.abs(h) % g.length]
}

// 마감까지 남은 일수 (D-day). deadline 없으면 null.
function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(`${deadline}T00:00:00`)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86_400_000)
}

function formatDeadline(deadline: string): string {
  const d = new Date(`${deadline}T00:00:00`)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

// 썸네일: 이미지 있으면 표시(실패 시 그라데이션), 없으면 그라데이션 + 게임명 첫 글자
function CampaignThumb({ campaign }: { campaign: CampaignWithMissions }) {
  const [failed, setFailed] = useState(false)
  const showImg = campaign.thumbnail_url && !failed
  return (
    <>
      {showImg ? (
        <img
          src={campaign.thumbnail_url!}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gameGradient(campaign.game_name)} flex items-center justify-center`}>
          <span className="text-5xl font-black text-white/15" style={{ fontFamily: 'Arial Black' }}>
            {campaign.game_name.charAt(0)}
          </span>
        </div>
      )}
    </>
  )
}

export default function CreatorDashboard() {
  const router = useRouter()
  const { creator, loading: creatorLoading } = useCreator()
  const [channels, setChannels] = useState<CreatorChannel[]>([])
  const [campaigns, setCampaigns] = useState<CampaignWithMissions[]>([])
  const [applications, setApplications] = useState<{ campaign_id: string; content_type: ContentType }[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)
  const [filter, setFilter] = useState<ContentType | 'all'>('all')
  const supabase = createClient()

  useEffect(() => {
    if (!creator) return
    Promise.all([
      supabase.from('creator_channels').select('*').eq('creator_id', creator.id),
      supabase.from('campaigns').select('*, missions(*), applications(count)').eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('applications').select('campaign_id, content_type').eq('creator_id', creator.id),
    ]).then(([{ data: ch }, { data: cp }, { data: ap }]) => {
      setChannels(ch ?? [])
      setCampaigns((cp ?? []) as CampaignWithMissions[])
      setApplications(ap ?? [])
      setLoading(false)
    })
  }, [creator])

  // 내 등급 목록
  const myGrades = channels.map(ch => ({ grade: ch.grade, content_type: ch.content_type }))

  // 캠페인 필터링: 내 등급에 맞는 미션이 있는 캠페인만
  const eligibleCampaigns = campaigns.filter(campaign => {
    return campaign.missions.some(mission => {
      const hasGrade = myGrades.some(g =>
        g.content_type === mission.content_type &&
        mission.allowed_grades.includes(g.grade)
      )
      return hasGrade && mission.status === 'open'
    })
  })

  const filteredCampaigns = eligibleCampaigns.filter(campaign => {
    if (filter === 'all') return true
    return campaign.missions.some(m => m.content_type === filter && m.status === 'open')
  })

  // 내 수령 예상 금액 계산
  const getMyRate = (campaign: CampaignWithMissions, contentType: ContentType): number => {
    const myGrade = myGrades.find(g => g.content_type === contentType)
    if (!myGrade) return 0
    return RATE_MATRIX[myGrade.grade]?.[contentType] ?? 0
  }

  const hasApplied = (campaignId: string, contentType: ContentType) => {
    return applications.some(a => a.campaign_id === campaignId && a.content_type === contentType)
  }

  const handleApply = async (campaign: CampaignWithMissions, contentType: ContentType) => {
    if (!creator) return
    const key = `${campaign.id}:${contentType}`
    setApplying(key)

    // 해당 미션 슬롯 찾기
    const mission = campaign.missions.find(m =>
      m.content_type === contentType &&
      m.status === 'open' &&
      myGrades.some(g => g.content_type === contentType && m.allowed_grades.includes(g.grade))
    )

    const { error } = await supabase.from('applications').insert({
      campaign_id: campaign.id,
      creator_id: creator.id,
      content_type: contentType,
      mission_id: mission?.id ?? null,
      status: 'confirmed',
    })

    if (!error) {
      setApplications(prev => [...prev, { campaign_id: campaign.id, content_type: contentType }])
      // 미션 상태 filled로 업데이트
      if (mission) {
        await supabase.from('missions').update({ status: 'filled' }).eq('id', mission.id)
      }
    }
    setApplying(null)
  }

  if (creatorLoading || loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-white/30">로딩 중...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <TopNav role="creator" />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* 헤더 */}
        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
            참여 가능한 캠페인
          </h1>
          {myGrades.length > 0 && (
            <p className="text-xs text-white/30 mt-1">
              내 등급: {[...new Set(myGrades.map(g => `${g.grade}(${CONTENT_TYPE_LABELS[g.content_type]})`))].join(' · ')}
            </p>
          )}
        </div>

        {/* 채널 미등록 안내 */}
        {myGrades.length === 0 && (
          <div className="bg-[#9B7EC8]/10 border border-[#9B7EC8]/20 rounded-xl p-4">
            <p className="text-sm text-[#9B7EC8]">채널을 등록해야 캠페인에 참여할 수 있어요</p>
            <button
              onClick={() => router.push('/creator/profile')}
              className="text-xs text-white/50 hover:text-white mt-1 transition-colors"
            >
              채널 등록하기 →
            </button>
          </div>
        )}

        {/* 필터 */}
        <div className="flex gap-2">
          {(['all', 'live', 'longform', 'shortform'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                filter === f
                  ? 'bg-[#9B7EC8] text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? '전체' : CONTENT_TYPE_LABELS[f]}
            </button>
          ))}
        </div>

        {/* 캠페인 카드 갤러리 */}
        {filteredCampaigns.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-12 text-center border border-dashed border-white/10">
            <p className="text-white/40 text-sm">아직 참여할 수 있는 캠페인이 없어요</p>
            <p className="text-white/20 text-xs mt-1">
              {myGrades.length === 0 ? '채널을 먼저 등록하면 맞춤 캠페인이 보여요' : '새 캠페인이 열리면 여기에 채워드릴게요'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCampaigns.map(campaign => {
              // 이 캠페인에서 내가 지원 가능한 미션 타입들
              const eligibleTypes = [...new Set(
                campaign.missions
                  .filter(m => m.status === 'open' && myGrades.some(g =>
                    g.content_type === m.content_type && m.allowed_grades.includes(g.grade)
                  ))
                  .map(m => m.content_type)
              )] as ContentType[]

              const dday = daysUntil(campaign.deadline)
              const urgent = dday !== null && dday <= 3
              const applicantCount = campaign.applications?.[0]?.count ?? 0
              const spent = campaign.total_budget > 0
                ? Math.round(((campaign.total_budget - campaign.remaining_budget) / campaign.total_budget) * 100)
                : 0

              return (
                <div
                  key={campaign.id}
                  className="group flex flex-col rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[#9B7EC8]/40"
                >
                  {/* 썸네일 영역 */}
                  <div className="relative h-[186px] overflow-hidden">
                    <CampaignThumb campaign={campaign} />
                    {/* 좌상단: 장르 */}
                    {campaign.genre && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[11px] font-medium text-white/90">
                        {campaign.genre}
                      </span>
                    )}
                    {/* 우상단: 마감 D-day */}
                    {dday !== null && (
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          urgent ? 'bg-red-500 text-white' : 'bg-black/50 backdrop-blur-sm text-white/80'
                        }`}
                      >
                        {dday < 0 ? '마감' : dday === 0 ? 'D-DAY' : `D-${dday}`}
                      </span>
                    )}
                  </div>

                  {/* 본문 */}
                  <div className="flex flex-col flex-1 p-4">
                    <div className="font-bold text-white truncate">{campaign.game_name}</div>
                    <div className="text-sm text-white/40 mt-1 line-clamp-2 min-h-[2.5rem]">
                      {campaign.description}
                    </div>

                    {/* 미션 줄들 (내가 참여 가능한 타입만) */}
                    <div className="space-y-2 mt-3">
                      {eligibleTypes.map(contentType => {
                        const myRate = getMyRate(campaign, contentType)
                        const applied = hasApplied(campaign.id, contentType)
                        const key = `${campaign.id}:${contentType}`
                        const mission = campaign.missions.find(m =>
                          m.content_type === contentType && m.status === 'open'
                        )

                        return (
                          <div key={contentType} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                            {/* 좌: 타입명 + 등급 */}
                            <div className="min-w-0">
                              <div className="text-sm text-white font-medium leading-tight">
                                {CONTENT_TYPE_LABELS[contentType]}
                              </div>
                              {mission && (
                                <div className="text-[11px] text-white/30 leading-tight">
                                  {mission.allowed_grades.join('/')}등급
                                </div>
                              )}
                            </div>
                            {/* 우: 내 단가 */}
                            <div className="ml-auto text-right">
                              <div className="text-[10px] text-white/30 leading-none">단가</div>
                              <div className="text-sm font-black text-[#E5B567] leading-tight">
                                ₩{myRate.toLocaleString()}
                              </div>
                            </div>
                            {/* 맨 우: 지원 버튼 */}
                            <button
                              onClick={() => !applied && handleApply(campaign, contentType)}
                              disabled={applied || applying === key}
                              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                applied
                                  ? 'bg-green-500/20 text-green-400 cursor-default'
                                  : 'text-white hover:opacity-90 disabled:opacity-50'
                              }`}
                              style={!applied ? { background: '#9B7EC8' } : undefined}
                            >
                              {applied ? '완료 ✓' : applying === key ? '…' : '지원'}
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    {/* 하단 메타 */}
                    <div className="mt-auto pt-3 border-t border-white/10">
                      <div className="flex justify-between items-start text-[11px]">
                        <div>
                          <div className="text-white/30">모집 마감</div>
                          <div className="text-white/70 font-medium mt-0.5">
                            {campaign.deadline ? (
                              <>
                                {formatDeadline(campaign.deadline)}
                                {dday !== null && dday >= 0 && (
                                  <span className={urgent ? 'text-red-400' : 'text-white/40'}> · D-{dday}</span>
                                )}
                              </>
                            ) : (
                              '상시 모집'
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white/30">참여 현황</div>
                          <div className="text-white/70 font-medium mt-0.5">{applicantCount}명 참여 중</div>
                        </div>
                      </div>

                      {/* 예산 소진 진행 바 */}
                      <div className="mt-2.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${urgent ? 'bg-[#E5B567]' : 'bg-[#9B7EC8]'}`}
                          style={{ width: `${Math.min(100, Math.max(0, spent))}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-white/30 mt-1">예산 {spent}% 소진</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
