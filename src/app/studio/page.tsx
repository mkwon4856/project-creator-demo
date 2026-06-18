'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useStudio } from '@/lib/supabase/hooks'
import { CreditBalance } from '@/components/studio/CreditBalance'
import { TopNav } from '@/components/layout/TopNav'
import { PlatformIcon } from '@/components/icons/PlatformIcon'
import type { Campaign, ContentType, Platform, Grade, SubmissionStatus } from '@/lib/db.types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:       { label: '작성 중',    color: 'bg-white/10 text-white/50' },
  pending:     { label: '승인 대기',  color: 'bg-yellow-500/20 text-yellow-400' },
  active:      { label: '모집 중',    color: 'bg-[#9B7EC8]/20 text-[#9B7EC8]' },
  in_progress: { label: '진행 중',    color: 'bg-blue-500/20 text-blue-400' },
  reviewing:   { label: '검수 중',    color: 'bg-orange-500/20 text-orange-400' },
  completed:   { label: '완료',       color: 'bg-green-500/20 text-green-400' },
  cancelled:   { label: '취소',       color: 'bg-red-500/20 text-red-400' },
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
}

const GRADE_COLORS: Record<Grade, string> = {
  S: 'text-yellow-400',
  A: 'text-orange-400',
  B: 'text-[#9B7EC8]',
  C: 'text-blue-400',
  D: 'text-green-400',
  E: 'text-white/50',
}

const SUBMISSION_STATUS: Record<SubmissionStatus, { label: string; color: string }> = {
  pending:  { label: '검수 중',     color: 'bg-orange-500/20 text-orange-400' },
  approved: { label: '검수 완료 ✓', color: 'bg-green-500/20 text-green-400' },
  rejected: { label: '반려',        color: 'bg-red-500/20 text-red-400' },
}

const PLATFORM_GRADIENT: Record<Platform, string> = {
  youtube: 'from-red-900 via-[#0A0A0F] to-rose-900',
  tiktok:  'from-zinc-800 via-[#0A0A0F] to-fuchsia-900',
  chzzk:   'from-emerald-900 via-[#0A0A0F] to-teal-900',
  soop:    'from-blue-900 via-[#0A0A0F] to-indigo-900',
}

const AVATAR_BG = ['#6D4FA0', '#A0524F', '#4F73A0', '#4FA08A', '#A0904F', '#8A4FA0']
function avatarColor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_BG[Math.abs(h) % AVATAR_BG.length]
}

function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(`${deadline}T00:00:00`)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86_400_000)
}

// Supabase nested(to-one) 관계는 객체 또는 배열로 올 수 있어 안전하게 단일화.
function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

interface AppRow {
  id: string
  campaign_id: string
  creator_id: string
  content_type: ContentType
  creators: { name: string; avatar_url: string | null } | { name: string; avatar_url: string | null }[] | null
}

interface SubRow {
  id: string
  status: SubmissionStatus
  platform_urls: { platform: Platform; url: string }[] | null
  created_at: string
  application_id: string
}

interface ChannelRow {
  creator_id: string
  platform: Platform
  channel_name: string
  subscribers: number
  grade: Grade
  content_type: ContentType
}

interface ShowcaseCreator {
  id: string
  name: string
  avatar_url: string | null
  topChannel: ChannelRow
  platforms: Platform[]
}

export default function StudioDashboard() {
  const router = useRouter()
  const { studio, loading: studioLoading } = useStudio()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [applications, setApplications] = useState<AppRow[]>([])
  const [submissions, setSubmissions] = useState<SubRow[]>([])
  const [showcase, setShowcase] = useState<ShowcaseCreator[]>([])
  const [totalCreators, setTotalCreators] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!studio) return
    let cancelled = false

    const load = async () => {
      // 1. 내 캠페인
      const { data: cps } = await supabase
        .from('campaigns')
        .select('*')
        .eq('studio_id', studio.id)
        .order('created_at', { ascending: false })
      const campaignList = (cps ?? []) as Campaign[]
      const ids = campaignList.map(c => c.id)

      // 2. 내 캠페인 지원 내역 (참여 카운트 + 크리에이터명) → 제출물
      let appList: AppRow[] = []
      let subList: SubRow[] = []
      if (ids.length > 0) {
        const { data: apps } = await supabase
          .from('applications')
          .select('id, campaign_id, creator_id, content_type, creators(name, avatar_url)')
          .in('campaign_id', ids)
        appList = (apps ?? []) as AppRow[]

        const appIds = appList.map(a => a.id)
        if (appIds.length > 0) {
          const { data: subs } = await supabase
            .from('submissions')
            .select('id, status, platform_urls, created_at, application_id')
            .in('application_id', appIds)
            .order('created_at', { ascending: false })
          subList = (subs ?? []) as SubRow[]
        }
      }

      // 3. 크리에이터 쇼케이스 (전체 카운트 + 채널 보유 상위)
      const [{ count }, { data: creatorRows }, { data: channelRows }] = await Promise.all([
        supabase.from('creators').select('id', { count: 'exact', head: true }),
        supabase.from('creators').select('id, name, avatar_url'),
        supabase.from('creator_channels').select('creator_id, platform, channel_name, subscribers, grade, content_type'),
      ])

      const channelsByCreator = new Map<string, ChannelRow[]>()
      for (const ch of (channelRows ?? []) as ChannelRow[]) {
        const arr = channelsByCreator.get(ch.creator_id) ?? []
        arr.push(ch)
        channelsByCreator.set(ch.creator_id, arr)
      }

      const showcaseList: ShowcaseCreator[] = ((creatorRows ?? []) as { id: string; name: string; avatar_url: string | null }[])
        .map(cr => {
          const chs = (channelsByCreator.get(cr.id) ?? []).slice().sort((a, b) => b.subscribers - a.subscribers)
          if (chs.length === 0) return null
          const platforms = [...new Set(chs.map(c => c.platform))] as Platform[]
          return { id: cr.id, name: cr.name, avatar_url: cr.avatar_url, topChannel: chs[0], platforms }
        })
        .filter((c): c is ShowcaseCreator => c !== null)
        .sort((a, b) => b.topChannel.subscribers - a.topChannel.subscribers)
        .slice(0, 12)

      if (cancelled) return
      setCampaigns(campaignList)
      setApplications(appList)
      setSubmissions(subList)
      setTotalCreators(count ?? 0)
      setShowcase(showcaseList)
      setLoading(false)
    }

    void load()
    return () => { cancelled = true }
  }, [studio])

  if (studioLoading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-white/30">로딩 중...</div>
    </div>
  )

  const activeCampaigns = campaigns.filter(c => ['active', 'in_progress', 'reviewing', 'pending'].includes(c.status))

  // 캠페인별 집계 맵
  const appById = new Map(applications.map(a => [a.id, a]))
  const participantsByCampaign = new Map<string, number>()
  for (const a of applications) {
    participantsByCampaign.set(a.campaign_id, (participantsByCampaign.get(a.campaign_id) ?? 0) + 1)
  }
  const submittedByCampaign = new Map<string, number>()
  const approvedByCampaign = new Map<string, number>()
  for (const s of submissions) {
    const app = appById.get(s.application_id)
    if (!app) continue
    submittedByCampaign.set(app.campaign_id, (submittedByCampaign.get(app.campaign_id) ?? 0) + 1)
    if (s.status === 'approved') {
      approvedByCampaign.set(app.campaign_id, (approvedByCampaign.get(app.campaign_id) ?? 0) + 1)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <TopNav role="studio" />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* 3-1. 헤더 */}
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

        {/* 3-2. 크리에이터 쇼케이스 */}
        <div className="rounded-2xl border border-[#9B7EC8]/30 bg-gradient-to-br from-[#1a1030] to-[#0A0A0F] p-6">
          <div className="flex justify-between items-start gap-4 mb-5">
            <div>
              <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Arial Black' }}>
                Project Creator와 함께하는 크리에이터
              </h2>
              <p className="text-sm text-white/50 mt-1">
                유튜브·치지직·SOOP·틱톡에서 활동 중인 검증된 크리에이터들
              </p>
            </div>
            {totalCreators > 0 && (
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-[#E5B567]" style={{ fontFamily: 'Arial Black' }}>
                  총 {totalCreators}명+
                </div>
                <div className="text-xs text-white/30 mt-0.5">활동 크리에이터</div>
              </div>
            )}
          </div>

          {showcase.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">
              곧 다양한 크리에이터가 합류합니다
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {showcase.map(cr => (
                <Link
                  key={cr.id}
                  href={`/creators/${cr.id}`}
                  className="shrink-0 w-44 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center cursor-pointer transition-all hover:-translate-y-1 hover:border-[#9B7EC8]/40"
                >
                  <div
                    className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mb-3"
                    style={{ background: avatarColor(cr.name) }}
                  >
                    {cr.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cr.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white/80" style={{ fontFamily: 'Arial Black' }}>
                        {cr.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-white text-sm truncate w-full">{cr.name}</div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-white/50">
                    <PlatformIcon platform={cr.topChannel.platform} size={16} />
                    <span>{cr.topChannel.subscribers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-xs font-bold ${GRADE_COLORS[cr.topChannel.grade]}`}>
                      {cr.topChannel.grade}등급
                    </span>
                    <span className="text-xs text-white/30">
                      {CONTENT_TYPE_LABELS[cr.topChannel.content_type]}
                    </span>
                  </div>
                  {cr.platforms.length > 1 && (
                    <div className="flex gap-1 mt-2.5 pt-2.5 border-t border-white/10 w-full justify-center">
                      {cr.platforms.map(p => <PlatformIcon key={p} platform={p} size={16} />)}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 3-3. 예산 현황 */}
        <div className="space-y-4">
          <CreditBalance />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: '진행 중 캠페인', value: activeCampaigns.length, unit: '개' },
              { label: '참여 크리에이터', value: applications.length, unit: '명' },
              { label: '올라온 콘텐츠', value: submissions.length, unit: '건' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="text-xs text-white/40 mb-1">{label}</div>
                <div className="text-xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
                  {value}{unit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-4. 내 캠페인 (운영) */}
        <div>
          <h2 className="text-sm font-medium text-white/50 mb-3">내 캠페인</h2>
          {campaigns.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-8 text-center border border-dashed border-white/10">
              <p className="text-white/30 text-sm mb-4">아직 만든 캠페인이 없습니다</p>
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
              {campaigns.map(campaign => {
                const participants = participantsByCampaign.get(campaign.id) ?? 0
                const submitted = submittedByCampaign.get(campaign.id) ?? 0
                const approved = approvedByCampaign.get(campaign.id) ?? 0
                const spent = campaign.total_budget > 0
                  ? Math.round(((campaign.total_budget - campaign.remaining_budget) / campaign.total_budget) * 100)
                  : 0
                const dday = daysUntil(campaign.deadline)

                return (
                  <div
                    key={campaign.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-[#9B7EC8]/30 transition-all cursor-pointer"
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      {/* 썸네일 */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0 flex items-center justify-center">
                        {campaign.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={campaign.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-black text-white/20" style={{ fontFamily: 'Arial Black' }}>
                            {campaign.game_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white truncate">{campaign.game_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_LABELS[campaign.status]?.color}`}>
                            {STATUS_LABELS[campaign.status]?.label}
                          </span>
                        </div>
                        <div className="text-xs text-white/40 mt-0.5">
                          참여 {participants}명 · 콘텐츠 제출 {submitted}건 · 검수 완료 {approved}건
                        </div>
                      </div>
                      {dday !== null && (
                        <span className={`text-xs font-bold shrink-0 ${dday <= 3 ? 'text-red-400' : 'text-white/40'}`}>
                          {dday < 0 ? '마감' : dday === 0 ? 'D-DAY' : `D-${dday}`}
                        </span>
                      )}
                    </div>
                    {/* 예산 소진율 */}
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#9B7EC8] transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, spent))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-white/30 mt-1">
                        <span>예산 {spent}% 소진</span>
                        <span>₩{Math.round(campaign.total_budget / 10000).toLocaleString()}만</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 3-5. 우리 캠페인에 올라온 콘텐츠 */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-sm font-medium text-white/50">우리 캠페인에 올라온 콘텐츠</h2>
            <span className="text-xs text-white/30">{submissions.length}건</span>
          </div>
          <p className="text-xs text-white/30 mb-3">
            검수는 Project Creator가 진행합니다. 게임사는 완성된 콘텐츠를 확인할 수 있어요.
          </p>
          {submissions.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-8 text-center border border-dashed border-white/10">
              <p className="text-white/30 text-sm">아직 올라온 콘텐츠가 없습니다</p>
              <p className="text-white/20 text-xs mt-1">크리에이터가 콘텐츠를 제출하면 여기에 표시됩니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {submissions.map(sub => {
                const app = appById.get(sub.application_id)
                const creator = one(app?.creators)
                const url = sub.platform_urls?.[0]?.url
                const platform = sub.platform_urls?.[0]?.platform
                const clickable = sub.status === 'approved' && !!url

                return (
                  <div
                    key={sub.id}
                    onClick={() => clickable && window.open(url, '_blank', 'noopener,noreferrer')}
                    className={`rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-all ${
                      clickable ? 'cursor-pointer hover:-translate-y-1 hover:border-[#9B7EC8]/40' : ''
                    }`}
                  >
                    {/* 썸네일 */}
                    <div className={`relative h-32 bg-gradient-to-br ${platform ? PLATFORM_GRADIENT[platform] : 'from-purple-900 via-[#0A0A0F] to-indigo-900'} flex items-center justify-center`}>
                      <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white/80 text-lg ml-0.5">▶</span>
                      </div>
                      {platform && (
                        <span className="absolute top-2.5 left-2.5">
                          <PlatformIcon platform={platform} size={20} />
                        </span>
                      )}
                      <span className={`absolute top-2.5 right-2.5 text-[11px] px-2 py-0.5 rounded-full font-medium ${SUBMISSION_STATUS[sub.status].color}`}>
                        {SUBMISSION_STATUS[sub.status].label}
                      </span>
                    </div>
                    {/* 본문 */}
                    <div className="p-3">
                      <div className="font-medium text-white text-sm truncate">
                        {creator?.name ?? '크리에이터'}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-white/40">
                        {platform && <PlatformIcon platform={platform} size={14} />}
                        <span>{app ? CONTENT_TYPE_LABELS[app.content_type] : '콘텐츠'}</span>
                      </div>
                      {clickable && (
                        <div className="text-xs text-[#9B7EC8] mt-2">콘텐츠 보기 →</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
