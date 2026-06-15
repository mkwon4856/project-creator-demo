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
  ContentType,
  Platform,
  ApplicationStatus,
} from '@/lib/db.types'

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
}

// 콘텐츠 타입별 제출 가능한 플랫폼
const PLATFORMS_BY_TYPE: Record<ContentType, Platform[]> = {
  live: ['youtube', 'soop', 'chzzk'],
  shortform: ['youtube', 'tiktok'],
  longform: ['youtube'],
}

const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: 'YouTube',
  soop: 'SOOP',
  chzzk: '치지직',
  tiktok: 'TikTok',
}

type AppRow = Application & {
  campaigns: Pick<Campaign, 'title' | 'game_name'> | null
  missions: Pick<Mission, 'content_type' | 'creator_amount' | 'guide_draft' | 'guide_approved'> | null
}

// 새 컬럼(approved_at/paid_at)은 db.types에 없으므로 로컬 보강
type SubRow = Submission & { approved_at: string | null; paid_at: string | null }

const APP_STATUS_META: Record<ApplicationStatus, { label: string; cls: string }> = {
  confirmed: { label: '제작 중', cls: 'bg-[#9B7EC8]/20 text-[#9B7EC8]' },
  completed: { label: '완료', cls: 'bg-green-500/20 text-green-400' },
  rejected: { label: '거절됨', cls: 'bg-red-500/20 text-red-400' },
}

const SUB_STATUS_META: Record<Submission['status'], { label: string; cls: string }> = {
  pending: { label: '검수 중', cls: 'bg-yellow-500/20 text-yellow-400' },
  approved: { label: '승인됨', cls: 'bg-green-500/20 text-green-400' },
  rejected: { label: '거절됨', cls: 'bg-red-500/20 text-red-400' },
}

export default function CreatorActivityPage() {
  const router = useRouter()
  const { creator, loading: creatorLoading } = useCreator()
  const [apps, setApps] = useState<AppRow[]>([])
  const [subs, setSubs] = useState<SubRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitFor, setSubmitFor] = useState<AppRow | null>(null)
  const supabase = createClient()

  const load = async (creatorId: string) => {
    const { data: appData } = await supabase
      .from('applications')
      .select('*, campaigns(title, game_name), missions(content_type, creator_amount, guide_draft, guide_approved)')
      .eq('creator_id', creatorId)
      .order('applied_at', { ascending: false })
    const rows = (appData ?? []) as AppRow[]
    setApps(rows)

    const appIds = rows.map(a => a.id)
    if (appIds.length > 0) {
      const { data: subData } = await supabase
        .from('submissions')
        .select('*')
        .in('application_id', appIds)
      setSubs((subData ?? []) as SubRow[])
    } else {
      setSubs([])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!creator) return
    load(creator.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creator])

  const subByApp = useMemo(() => {
    const m = new Map<string, SubRow>()
    for (const s of subs) m.set(s.application_id, s)
    return m
  }, [subs])

  const handleSubmitted = (sub: SubRow) => {
    setSubs(prev => [...prev, sub])
    setSubmitFor(null)
  }

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
              내 지원 현황
            </h1>
            <p className="text-xs text-white/30 mt-1">지원한 캠페인과 콘텐츠 제출 상태</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => router.push('/creator')}
              className="text-xs text-[#9B7EC8] hover:text-[#9B7EC8]/80 transition-colors"
            >
              캠페인 탐색 →
            </button>
            <LogoutInline />
          </div>
        </div>

        {apps.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center border border-dashed border-white/10">
            <p className="text-white/30 text-sm">아직 지원한 캠페인이 없습니다</p>
            <button
              onClick={() => router.push('/creator')}
              className="text-xs text-[#9B7EC8] hover:text-white mt-2 transition-colors"
            >
              캠페인 둘러보기 →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map(app => {
              const sub = subByApp.get(app.id)
              const contentType = app.content_type
              const canSubmit = app.status === 'confirmed' && !sub && app.mission_id

              return (
                <div key={app.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">
                        {app.campaigns?.title ?? '알 수 없는 캠페인'}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {app.campaigns?.game_name} · {CONTENT_TYPE_LABELS[contentType]}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${APP_STATUS_META[app.status].cls}`}>
                      {APP_STATUS_META[app.status].label}
                    </span>
                  </div>

                  {/* 미션 가이드 */}
                  {app.missions?.guide_approved || app.missions?.guide_draft ? (
                    <p className="text-xs text-white/40 mt-3 whitespace-pre-line line-clamp-3">
                      {app.missions.guide_approved || app.missions.guide_draft}
                    </p>
                  ) : null}

                  {/* 제출 상태 / 제출 버튼 */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    {sub ? (
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/40">제출한 콘텐츠</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${SUB_STATUS_META[sub.status].cls}`}>
                            {SUB_STATUS_META[sub.status].label}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          {sub.platform_urls.map((p, i) => (
                            <a
                              key={i}
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-[#9B7EC8] hover:text-white transition-colors truncate"
                            >
                              <span className="text-white/30">{PLATFORM_LABELS[p.platform]}</span>
                              <span className="truncate">{p.url}</span>
                            </a>
                          ))}
                        </div>
                        {sub.status === 'rejected' && sub.admin_note && (
                          <p className="text-xs text-red-400/80 mt-2">거절 사유: {sub.admin_note}</p>
                        )}
                        {sub.status === 'approved' && (
                          <p className={`text-xs mt-2 ${sub.paid_at ? 'text-green-400' : 'text-[#E5B567]'}`}>
                            {sub.paid_at
                              ? '지급 완료'
                              : sub.approved_at
                                ? formatHoldRemaining(sub.approved_at)
                                : '지급 대기'}
                          </p>
                        )}
                      </div>
                    ) : canSubmit ? (
                      <button
                        onClick={() => setSubmitFor(app)}
                        className="w-full py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                        style={{ background: '#9B7EC8' }}
                      >
                        콘텐츠 제출
                      </button>
                    ) : app.status === 'rejected' ? (
                      <span className="text-xs text-white/30">지원이 거절되었습니다</span>
                    ) : (
                      <span className="text-xs text-white/30">제출 대기 중</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {submitFor && (
        <SubmitModal
          app={submitFor}
          onClose={() => setSubmitFor(null)}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
function SubmitModal({
  app,
  onClose,
  onSubmitted,
}: {
  app: AppRow
  onClose: () => void
  onSubmitted: (sub: SubRow) => void
}) {
  const supabase = createClient()
  const contentType = app.content_type
  const platforms = PLATFORMS_BY_TYPE[contentType]
  const [rows, setRows] = useState<{ platform: Platform; url: string }[]>([
    { platform: platforms[0], url: '' },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addRow = () => setRows(prev => [...prev, { platform: platforms[0], url: '' }])
  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i))
  const updateRow = (i: number, patch: Partial<{ platform: Platform; url: string }>) =>
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const handleSubmit = async () => {
    const valid = rows
      .map(r => ({ platform: r.platform, url: r.url.trim() }))
      .filter(r => r.url.length > 0)
    if (valid.length === 0) {
      setError('최소 1개의 URL을 입력해주세요')
      return
    }
    if (!app.mission_id) {
      setError('연결된 미션이 없어 제출할 수 없습니다')
      return
    }
    setSubmitting(true)
    setError(null)
    const { data, error: insErr } = await supabase
      .from('submissions')
      .insert({
        application_id: app.id,
        mission_id: app.mission_id,
        platform_urls: valid,
        status: 'pending',
      })
      .select()
      .single()
    if (insErr) {
      setError(`제출 실패: ${insErr.message}`)
      setSubmitting(false)
      return
    }
    onSubmitted(data as SubRow)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="bg-[#14141A] rounded-2xl border border-white/10 w-full max-w-md p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Arial Black' }}>
            콘텐츠 제출
          </h2>
          <p className="text-xs text-white/40 mt-1">
            {app.campaigns?.title} · {CONTENT_TYPE_LABELS[contentType]}
          </p>
        </div>

        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={row.platform}
                onChange={e => updateRow(i, { platform: e.target.value as Platform })}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[#9B7EC8]"
              >
                {platforms.map(p => (
                  <option key={p} value={p} className="bg-[#14141A]">
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
              <input
                value={row.url}
                onChange={e => updateRow(i, { url: e.target.value })}
                placeholder="콘텐츠 URL"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8]"
              />
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(i)}
                  className="px-2 text-white/30 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {platforms.length > 1 && (
            <button
              onClick={addRow}
              className="text-xs text-[#9B7EC8] hover:text-white transition-colors"
            >
              + 플랫폼 추가
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm font-medium border border-white/10 text-white/50 hover:bg-white/5 transition-all"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: '#9B7EC8' }}
          >
            {submitting ? '제출 중...' : '제출하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
