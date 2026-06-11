'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Submission, Mission, Application, Creator, Campaign } from '@/lib/db.types'

const CONTENT_TYPE_LABELS: Record<string, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
}

type SubmissionWithRelations = Submission & {
  applications: (Application & {
    creators: Pick<Creator, 'id' | 'name'> | null
    campaigns: Pick<Campaign, 'id' | 'title' | 'game_name'> | null
  }) | null
  missions: Pick<Mission, 'id' | 'content_type' | 'guide_approved' | 'guide_draft'> | null
}

type Tab = 'pending' | 'approved' | 'rejected'

const CHECKLIST_LABELS = [
  { key: 'review_url_valid', label: 'URL 유효성' },
  { key: 'review_type_match', label: '미션 타입 일치' },
  { key: 'review_duration_meet', label: '최소 길이/시간 충족' },
  { key: 'review_guide_meet', label: '미션 가이드 충족' },
] as const

export default function AdminReviewPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('submissions')
      .select(`
        *,
        applications(*, creators(id, name), campaigns(id, title, game_name)),
        missions(id, content_type, guide_approved, guide_draft)
      `)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSubmissions((data ?? []) as SubmissionWithRelations[])
        setLoading(false)
      })
  }, [])

  const getChecks = (id: string) => checks[id] ?? {
    review_url_valid: false,
    review_type_match: false,
    review_duration_meet: false,
    review_guide_meet: false,
  }

  const allChecked = (id: string) => Object.values(getChecks(id)).every(Boolean)

  const handleApprove = async (submission: SubmissionWithRelations) => {
    setProcessing(submission.id)
    const c = getChecks(submission.id)
    const now = new Date().toISOString()
    await supabase.from('submissions').update({
      ...c,
      status: 'approved',
      admin_note: notes[submission.id] ?? null,
      reviewed_at: now,
      // 홀드 시작 시점. 실제 지급(payout)은 홀드기간 경과 후 process-payouts에서 처리.
      approved_at: now,
    }).eq('id', submission.id)
    setSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, status: 'approved' } : s))
    setProcessing(null)
  }

  const handleReject = async (submission: SubmissionWithRelations) => {
    if (!notes[submission.id]?.trim()) {
      alert('거절 사유를 입력해주세요')
      return
    }
    setProcessing(submission.id)
    const c = getChecks(submission.id)
    await supabase.from('submissions').update({
      ...c,
      status: 'rejected',
      admin_note: notes[submission.id],
      reviewed_at: new Date().toISOString(),
    }).eq('id', submission.id)
    setSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, status: 'rejected' } : s))
    setProcessing(null)
  }

  const filtered = submissions.filter(s => s.status === tab)
  const pendingCount = submissions.filter(s => s.status === 'pending').length

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-white/30">로딩 중...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
          콘텐츠 검수
        </h1>

        {/* 탭 */}
        <div className="flex gap-2">
          {([
            { key: 'pending', label: `검수 대기 (${pendingCount})` },
            { key: 'approved', label: '승인됨' },
            { key: 'rejected', label: '거절됨' },
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

        {/* 검수 목록 */}
        {filtered.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center border border-dashed border-white/10">
            <p className="text-white/30 text-sm">제출된 콘텐츠가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(submission => (
              <div key={submission.id} className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-4">

                {/* 헤더 */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white">
                      {submission.applications?.campaigns?.game_name ?? '알 수 없는 게임'}
                      <span className="text-white/40 font-normal text-sm ml-2">
                        — {CONTENT_TYPE_LABELS[submission.missions?.content_type ?? ''] ?? ''}
                      </span>
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">
                      크리에이터: {submission.applications?.creators?.name ?? '알 수 없음'}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    submission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {submission.status === 'pending' ? '검수 대기' :
                     submission.status === 'approved' ? '승인됨' : '거절됨'}
                  </span>
                </div>

                {/* 제출 URL */}
                <div className="space-y-1">
                  <div className="text-xs text-white/40">제출 URL</div>
                  {(submission.platform_urls as { platform: string; url: string }[]).map((pu, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-white/30 w-16">{pu.platform}</span>
                      <a
                        href={pu.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#9B7EC8] hover:underline truncate flex-1"
                      >
                        {pu.url}
                      </a>
                      <a
                        href={pu.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white/30 hover:text-white transition-colors whitespace-nowrap"
                      >
                        ▶ 열기
                      </a>
                    </div>
                  ))}
                </div>

                {/* 미션 가이드 */}
                {(submission.missions?.guide_approved || submission.missions?.guide_draft) && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-white/40 mb-1">미션 가이드</div>
                    <p className="text-xs text-white/60">
                      {submission.missions.guide_approved || submission.missions.guide_draft}
                    </p>
                  </div>
                )}

                {/* 검수 체크리스트 (pending만) */}
                {submission.status === 'pending' && (
                  <div className="space-y-3">
                    <div className="text-xs text-white/40">검수 체크리스트</div>
                    <div className="space-y-2">
                      {CHECKLIST_LABELS.map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={getChecks(submission.id)[key] ?? false}
                            onChange={e => setChecks(prev => ({
                              ...prev,
                              [submission.id]: {
                                ...getChecks(submission.id),
                                [key]: e.target.checked,
                              }
                            }))}
                            className="w-4 h-4 accent-[#9B7EC8]"
                          />
                          <span className="text-sm text-white/60">{label}</span>
                        </label>
                      ))}
                    </div>

                    {/* 거절 사유 */}
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8]"
                      placeholder="거절 사유 (거절 시 필수)"
                      value={notes[submission.id] ?? ''}
                      onChange={e => setNotes(prev => ({ ...prev, [submission.id]: e.target.value }))}
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(submission)}
                        disabled={processing === submission.id}
                        className="flex-1 py-2 rounded-lg text-sm font-medium border border-white/10 text-white/50 hover:bg-white/5 transition-all disabled:opacity-30"
                      >
                        거절
                      </button>
                      <button
                        onClick={() => handleApprove(submission)}
                        disabled={processing === submission.id || !allChecked(submission.id)}
                        className="flex-grow flex-2 py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-30 hover:opacity-90"
                        style={{ background: '#9B7EC8' }}
                      >
                        {processing === submission.id ? '처리 중...' : '승인 ✓'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 완료된 검수의 결과 표시 */}
                {submission.status !== 'pending' && (
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <div className="flex flex-wrap gap-2">
                      {CHECKLIST_LABELS.map(({ key, label }) => (
                        <span key={key} className={`text-xs px-2 py-0.5 rounded-full ${
                          submission[key] ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {label} {submission[key] ? '✓' : '✗'}
                        </span>
                      ))}
                    </div>
                    {submission.admin_note && (
                      <p className="text-xs text-white/30">{submission.admin_note}</p>
                    )}
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
