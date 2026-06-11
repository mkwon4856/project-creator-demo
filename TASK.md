# Project Creator — rebuild Task 6
## 크리에이터 채널 등록 페이지 (신규)

경로: src/app/creator/profile/page.tsx
디자인: 다크 #0A0A0F / 우베 #9B7EC8 / 골드 #E5B567 / Arial Black

---

## Task 6-1: 크리에이터 채널 등록 page.tsx 전면 교체

src/app/creator/profile/page.tsx 를 아래 내용으로 완전 교체:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCreator } from '@/lib/supabase/hooks'
import { subscribersToGrade, PLATFORM_CONTENT_TYPES } from '@/lib/pricing'
import type { CreatorChannel, Platform, ContentType, Grade } from '@/lib/db.types'

const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: 'YouTube',
  soop: 'SOOP',
  chzzk: 'Chzzk',
  tiktok: 'TikTok',
}

const PLATFORM_ICONS: Record<Platform, string> = {
  youtube: '▶',
  soop: '🟣',
  chzzk: '🟢',
  tiktok: '♪',
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

const ALL_PLATFORMS: Platform[] = ['youtube', 'soop', 'chzzk', 'tiktok']

export default function CreatorProfilePage() {
  const { creator, loading: creatorLoading } = useCreator()
  const [channels, setChannels] = useState<CreatorChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    platform: 'youtube' as Platform,
    channel_name: '',
    channel_url: '',
    subscribers: '',
  })
  const supabase = createClient()

  useEffect(() => {
    if (!creator) return
    supabase
      .from('creator_channels')
      .select('*')
      .eq('creator_id', creator.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setChannels(data ?? [])
        setLoading(false)
      })
  }, [creator])

  const handleAdd = async () => {
    if (!creator || !form.channel_name || !form.subscribers) return
    setAdding(true)

    const subscribers = parseInt(form.subscribers.replace(/,/g, ''))
    const grade = subscribersToGrade(subscribers)
    const contentTypes = PLATFORM_CONTENT_TYPES[form.platform]

    // 플랫폼별 콘텐츠 타입 수만큼 레코드 생성
    const rows = contentTypes.map(content_type => ({
      creator_id: creator.id,
      platform: form.platform,
      channel_name: form.channel_name,
      channel_url: form.channel_url || null,
      subscribers,
      grade,
      content_type,
    }))

    const { data, error } = await supabase
      .from('creator_channels')
      .insert(rows)
      .select()

    if (!error && data) {
      setChannels(prev => [...data, ...prev])
      setForm({ platform: 'youtube', channel_name: '', channel_url: '', subscribers: '' })
    }
    setAdding(false)
  }

  const handleDelete = async (channelId: string) => {
    // 같은 채널명+플랫폼의 모든 레코드 삭제
    const target = channels.find(c => c.id === channelId)
    if (!target) return
    await supabase
      .from('creator_channels')
      .delete()
      .eq('creator_id', creator!.id)
      .eq('platform', target.platform)
      .eq('channel_name', target.channel_name)
    setChannels(prev => prev.filter(c => !(c.platform === target.platform && c.channel_name === target.channel_name)))
  }

  // 채널별 그룹핑 (platform + channel_name 기준)
  const groupedChannels = channels.reduce((acc, ch) => {
    const key = `${ch.platform}:${ch.channel_name}`
    if (!acc[key]) acc[key] = []
    acc[key].push(ch)
    return acc
  }, {} as Record<string, CreatorChannel[]>)

  if (creatorLoading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-white/30">로딩 중...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">

        <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
          내 채널 관리
        </h1>

        {/* 등록된 채널 목록 */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-white/50">등록된 채널</h2>
          {Object.entries(groupedChannels).length === 0 ? (
            <div className="bg-white/5 rounded-xl p-8 text-center border border-dashed border-white/10">
              <p className="text-white/30 text-sm">등록된 채널이 없습니다</p>
              <p className="text-white/20 text-xs mt-1">아래에서 채널을 추가해주세요</p>
            </div>
          ) : (
            Object.entries(groupedChannels).map(([key, chList]) => {
              const first = chList[0]
              return (
                <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{PLATFORM_ICONS[first.platform]}</span>
                      <div>
                        <div className="font-medium text-white">{PLATFORM_LABELS[first.platform]}</div>
                        <div className="text-xs text-white/40">{first.channel_name}</div>
                        {first.channel_url && (
                          <div className="text-xs text-white/20 mt-0.5">{first.channel_url}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm text-white/60">구독자 {first.subscribers.toLocaleString()}</div>
                      </div>
                      <button
                        onClick={() => handleDelete(first.id)}
                        className="text-white/20 hover:text-red-400 text-sm transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  {/* 등급 뱃지 */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                    {chList.map(ch => (
                      <div key={ch.id} className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                        <span className={`text-xs font-bold ${GRADE_COLORS[ch.grade]}`}>{ch.grade}등급</span>
                        <span className="text-xs text-white/30">{CONTENT_TYPE_LABELS[ch.content_type]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 채널 추가 폼 */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/5 space-y-4">
          <h2 className="text-sm font-medium text-white/70">채널 추가</h2>

          <div>
            <label className="text-xs text-white/50 mb-2 block">플랫폼</label>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => setForm(f => ({ ...f, platform: p }))}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    form.platform === p
                      ? 'bg-[#9B7EC8] text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {PLATFORM_ICONS[p]} {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/20 mt-2">
              지원 타입: {PLATFORM_CONTENT_TYPES[form.platform].map(t => CONTENT_TYPE_LABELS[t]).join(', ')}
            </p>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-2 block">채널명 *</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8] text-sm"
              placeholder="채널 이름"
              value={form.channel_name}
              onChange={e => setForm(f => ({ ...f, channel_name: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-2 block">채널 URL</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8] text-sm"
              placeholder="https://..."
              value={form.channel_url}
              onChange={e => setForm(f => ({ ...f, channel_url: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-2 block">구독자/팔로워 수 *</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#9B7EC8] text-sm"
              placeholder="예: 50000"
              value={form.subscribers}
              onChange={e => setForm(f => ({ ...f, subscribers: e.target.value }))}
            />
            {form.subscribers && (
              <p className="text-xs text-[#9B7EC8] mt-1">
                예상 등급: {subscribersToGrade(parseInt(form.subscribers.replace(/,/g, '') || '0'))}등급
              </p>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={adding || !form.channel_name || !form.subscribers}
            className="w-full py-3 rounded-lg font-bold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: '#9B7EC8' }}
          >
            {adding ? '추가 중...' : '채널 추가하기'}
          </button>
        </div>

      </div>
    </div>
  )
}
```

---

## 완료 후

1. git add . && git commit -m "rebuild: creator channel registration page" && git push origin rebuild
2. PROGRESS.md 업데이트
