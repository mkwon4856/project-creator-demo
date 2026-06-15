'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCreator } from '@/lib/supabase/hooks'
import { TopNav } from '@/components/layout/TopNav'
import { RATE_MATRIX } from '@/lib/pricing'
import type { Campaign, Mission, CreatorChannel, Grade, ContentType } from '@/lib/db.types'

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
}

type CampaignWithMissions = Campaign & { missions: Mission[] }

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
      supabase.from('campaigns').select('*, missions(*)').eq('status', 'active').order('created_at', { ascending: false }),
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
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

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

        {/* 캠페인 목록 */}
        {filteredCampaigns.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center border border-dashed border-white/10">
            <p className="text-white/30 text-sm">참여 가능한 캠페인이 없습니다</p>
            <p className="text-white/20 text-xs mt-1">
              {myGrades.length === 0 ? '채널을 먼저 등록해주세요' : '새로운 캠페인이 열리면 알려드릴게요'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCampaigns.map(campaign => {
              // 이 캠페인에서 내가 지원 가능한 미션 타입들
              const eligibleTypes = [...new Set(
                campaign.missions
                  .filter(m => m.status === 'open' && myGrades.some(g =>
                    g.content_type === m.content_type && m.allowed_grades.includes(g.grade)
                  ))
                  .map(m => m.content_type)
              )] as ContentType[]

              return (
                <div key={campaign.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  {/* 캠페인 정보 */}
                  <div className="flex gap-3 mb-4">
                    {campaign.thumbnail_url && (
                      <img src={campaign.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-medium text-white">{campaign.game_name}</div>
                      <div className="text-xs text-white/40 mt-0.5 line-clamp-2">{campaign.description}</div>
                    </div>
                  </div>

                  {/* 지원 가능한 미션 타입별 버튼 */}
                  <div className="space-y-2">
                    {eligibleTypes.map(contentType => {
                      const myRate = getMyRate(campaign, contentType)
                      const applied = hasApplied(campaign.id, contentType)
                      const key = `${campaign.id}:${contentType}`
                      const mission = campaign.missions.find(m =>
                        m.content_type === contentType && m.status === 'open'
                      )

                      return (
                        <div key={contentType} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                          <div>
                            <span className="text-sm text-white font-medium">
                              {CONTENT_TYPE_LABELS[contentType]}
                            </span>
                            {mission && (
                              <span className="text-xs text-white/30 ml-2">
                                {mission.allowed_grades.join('/')}등급 가능
                              </span>
                            )}
                            {myRate > 0 && (
                              <div className="text-xs text-[#E5B567] mt-0.5">
                                내 몫 ₩{myRate.toLocaleString()}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => !applied && handleApply(campaign, contentType)}
                            disabled={applied || applying === key}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              applied
                                ? 'bg-green-500/20 text-green-400 cursor-default'
                                : 'text-white hover:opacity-90 disabled:opacity-50'
                            }`}
                            style={!applied ? { background: '#9B7EC8' } : undefined}
                          >
                            {applied ? '지원 완료 ✓' : applying === key ? '지원 중...' : '지원하기'}
                          </button>
                        </div>
                      )
                    })}
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
