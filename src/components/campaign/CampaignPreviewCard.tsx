'use client'
import { useState } from 'react'
import type { ContentType, Grade } from '@/lib/db.types'

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
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

const TYPE_ORDER: ContentType[] = ['live', 'longform', 'shortform']

// 카드 렌더에 필요한 최소 캠페인 형태 (탐색의 CampaignWithMissions, 미리보기의 위저드 구성값 모두 충족)
export interface CampaignCardCampaign {
  game_name: string
  genre: string | null
  description: string | null
  thumbnail_url: string | null
  deadline: string | null
  total_budget: number
  remaining_budget: number
  missions: { content_type: ContentType; allowed_grades: Grade[]; status?: string }[]
  applications?: { count: number }[]
}

interface Props {
  campaign: CampaignCardCampaign
  /** 미리보기 모드: 금액=총예산, 지원 버튼 비활성, "미리보기" 라벨 */
  preview?: boolean
  // ── 탐색(인터랙티브) 전용 — preview가 아닐 때 사용 ──
  eligibleTypes?: ContentType[]
  rateFor?: (ct: ContentType) => number
  isApplied?: (ct: ContentType) => boolean
  isApplying?: (ct: ContentType) => boolean
  onApply?: (ct: ContentType) => void
}

// 썸네일: 이미지 있으면 표시(실패 시 그라데이션), 없으면 그라데이션 + 게임명 첫 글자
function CampaignThumb({ campaign }: { campaign: CampaignCardCampaign }) {
  const [failed, setFailed] = useState(false)
  const showImg = campaign.thumbnail_url && !failed
  return showImg ? (
    // eslint-disable-next-line @next/next/no-img-element
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
  )
}

/**
 * 크리에이터 탐색 캠페인 카드 (재사용).
 * - 기본(탐색): 참여 가능 미션 타입별 단가 + 활성 지원 버튼.
 * - preview=true(생성 위저드 미리보기): 금액을 총 예산으로 표시, 지원 버튼 비활성, "미리보기" 라벨.
 */
export function CampaignPreviewCard({
  campaign,
  preview = false,
  eligibleTypes = [],
  rateFor,
  isApplied,
  isApplying,
  onApply,
}: Props) {
  const dday = daysUntil(campaign.deadline)
  const urgent = dday !== null && dday <= 3
  const applicantCount = campaign.applications?.[0]?.count ?? 0
  const spent = campaign.total_budget > 0
    ? Math.round(((campaign.total_budget - campaign.remaining_budget) / campaign.total_budget) * 100)
    : 0

  // 미리보기에서 노출할 미션 타입들 (중복 제거, 정렬)
  const previewTypes = TYPE_ORDER.filter(t => campaign.missions.some(m => m.content_type === t))

  return (
    <div className="group flex flex-col rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[#9B7EC8]/40">
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
        {/* 미리보기 라벨 */}
        {preview && (
          <span
            className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: '#9B7EC8' }}
          >
            미리보기
          </span>
        )}
      </div>

      {/* 본문 */}
      <div className="flex flex-col flex-1 p-4">
        <div className="font-bold text-white truncate">{campaign.game_name}</div>
        <div className="text-sm text-white/40 mt-1 line-clamp-2 min-h-[2.5rem]">
          {campaign.description}
        </div>

        {preview ? (
          /* 미리보기: 미션 타입 뱃지 + 총 예산 + 비활성 지원 버튼 */
          <>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2.5 mt-3">
              <div className="flex flex-wrap gap-1.5 min-w-0">
                {previewTypes.length > 0 ? (
                  previewTypes.map(t => (
                    <span
                      key={t}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#9B7EC8]/15 text-[#9B7EC8]"
                    >
                      {CONTENT_TYPE_LABELS[t]}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-white/30">미션 준비 중</span>
                )}
              </div>
              <div className="ml-auto text-right shrink-0">
                <div className="text-[10px] text-white/30 leading-none">총 예산</div>
                <div className="text-sm font-black text-[#E5B567] leading-tight">
                  ₩{campaign.total_budget.toLocaleString()}
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled
              className="w-full mt-3 py-2.5 rounded-lg text-sm font-bold bg-white/10 text-white/30 cursor-not-allowed"
            >
              지원하기
            </button>
          </>
        ) : (
          /* 탐색: 참여 가능 미션 타입별 단가 + 지원 버튼 */
          <div className="space-y-2 mt-3">
            {eligibleTypes.map(contentType => {
              const myRate = rateFor?.(contentType) ?? 0
              const applied = isApplied?.(contentType) ?? false
              const applyingNow = isApplying?.(contentType) ?? false
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
                    onClick={() => !applied && onApply?.(contentType)}
                    disabled={applied || applyingNow}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      applied
                        ? 'bg-green-500/20 text-green-400 cursor-default'
                        : 'text-white hover:opacity-90 disabled:opacity-50'
                    }`}
                    style={!applied ? { background: '#9B7EC8' } : undefined}
                  >
                    {applied ? '완료 ✓' : applyingNow ? '…' : '지원'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

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
}
