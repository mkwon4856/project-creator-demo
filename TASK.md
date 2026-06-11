# Project Creator — rebuild Task 2
## 데이터 계층 재구성

배경: db.types.ts 교체 완료. 남은 타입 에러 60건 중
Database/필드 파급(45건) 처리 + Supabase 인프라 레이어 교체.
Sentry/Analytics/SEO/이메일 파일은 절대 건드리지 않는다.

---

## Task 2-1: 레거시 Database 참조 제거

아래 패턴을 찾아서 새 타입으로 교체해줘:

- `Database` 타입 import → 삭제
- `Tables<'campaigns'>` → `Campaign`
- `Tables<'creators'>` → `Creator`
- `Tables<'studios'>` → `Studio`
- `Tables<'missions'>` → `Mission`
- `Tables<'applications'>` → `Application`
- `Tables<'submissions'>` → `Submission`
- `Tables<'payments'>` → `Payment`
- `CampaignThumbnailJson` → `string | null` (thumbnail_url로 대체)
- `CampaignGuidelinesJson` → `string | null` (guide_draft로 대체)
- `CreatorPlatform` → `Platform`

---

## Task 2-2: 사라진 필드 참조 수정

구 스키마 필드를 새 스키마 필드로 교체:

Campaign:
- `campaign.name` → `campaign.title`
- `campaign.brief` → `campaign.description`
- `campaign.thumbnail` → `campaign.thumbnail_url`
- `campaign.spent_budget` → 삭제 또는 0으로
- `campaign.target_creators` → 삭제 또는 0으로
- `campaign.recruit_start/end` → `campaign.launched_at`
- `campaign.submit_deadline` → `campaign.completed_at`
- `campaign.status === 'recruiting'` → `campaign.status === 'active'`
- `campaign.status === 'live'` → `campaign.status === 'in_progress'`

Creator:
- `creator.display_name` → `creator.name`
- `creator.handle` → 삭제 또는 creator.name으로
- `creator.grade` → 삭제 (등급은 creator_channels에서 관리)
- `creator.subscribers` → 삭제
- `creator.avg_views` → 삭제
- `creator.rating` → 삭제
- `creator.is_verified` → 삭제
- `creator.platforms` → 삭제
- `creator.completed_campaigns` → 삭제
- `creator.user_id` → `creator.profile_id`

Studio:
- `studio.name` → `studio.company_name`
- `studio.user_id` → `studio.profile_id`

Mission:
- `mission.type` → `mission.content_type`
- `mission.rate_a/b/c/d/e` → `mission.creator_amount`
- `mission.enabled` → 삭제

Application:
- `application.status === 'applied'` → `application.status === 'confirmed'`
- `application.status === 'accepted'` → `application.status === 'completed'`

Submission:
- `submission.content_url` → `submission.platform_urls[0]?.url`
- `submission.reward` → `submission.base_amount`
- `submission.submitted_at` → `submission.created_at`
- `submission.reviewed_by` → 삭제

---

## Task 2-3: Supabase 훅 교체

src/lib/supabase/hooks.ts를 아래 내용으로 완전 교체:

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from './client'
import type { Profile, Studio, Creator, CreatorChannel, Campaign, Mission, Application } from '../db.types'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => { setProfile(data); setLoading(false) })
    })
  }, [])
  return { profile, loading }
}

export function useStudio() {
  const [studio, setStudio] = useState<Studio | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('studios').select('*').eq('profile_id', user.id).single()
        .then(({ data }) => { setStudio(data); setLoading(false) })
    })
  }, [])
  return { studio, loading }
}

export function useCreator() {
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('creators').select('*').eq('profile_id', user.id).single()
        .then(({ data }) => { setCreator(data); setLoading(false) })
    })
  }, [])
  return { creator, loading }
}

export function useCreatorChannels(creatorId: string | null) {
  const [channels, setChannels] = useState<CreatorChannel[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    if (!creatorId) { setLoading(false); return }
    supabase.from('creator_channels').select('*').eq('creator_id', creatorId)
      .then(({ data }) => { setChannels(data ?? []); setLoading(false) })
  }, [creatorId])
  return { channels, loading }
}

export function useStudioCampaigns(studioId: string | null) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    if (!studioId) { setLoading(false); return }
    supabase.from('campaigns').select('*').eq('studio_id', studioId).order('created_at', { ascending: false })
      .then(({ data }) => { setCampaigns(data ?? []); setLoading(false) })
  }, [studioId])
  return { campaigns, loading }
}

export function useActiveCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    supabase.from('campaigns').select('*, missions(*)').eq('status', 'active').order('created_at', { ascending: false })
      .then(({ data }) => { setCampaigns(data ?? []); setLoading(false) })
  }, [])
  return { campaigns, loading }
}

export function useMissions(campaignId: string | null) {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    if (!campaignId) { setLoading(false); return }
    supabase.from('missions').select('*').eq('campaign_id', campaignId)
      .then(({ data }) => { setMissions(data ?? []); setLoading(false) })
  }, [campaignId])
  return { missions, loading }
}

export function useApplications(creatorId: string | null) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    if (!creatorId) { setLoading(false); return }
    supabase.from('applications').select('*, campaigns(*)').eq('creator_id', creatorId).order('applied_at', { ascending: false })
      .then(({ data }) => { setApplications(data ?? []); setLoading(false) })
  }, [creatorId])
  return { applications, loading }
}
```

---

## Task 2-4: API 레이어 교체

### src/lib/api/campaigns.ts 전체 교체:
```typescript
import { createClient } from '../supabase/client'
import type { Campaign, Mission } from '../db.types'

const supabase = createClient()

export async function createCampaign(data: Omit<Campaign, 'id' | 'created_at' | 'launched_at' | 'completed_at'>) {
  return supabase.from('campaigns').insert(data).select().single()
}

export async function createMissions(missions: Omit<Mission, 'id' | 'created_at'>[]) {
  return supabase.from('missions').insert(missions).select()
}

export async function updateCampaignStatus(id: string, status: Campaign['status'], adminNote?: string) {
  return supabase.from('campaigns').update({ status, ...(adminNote ? { admin_note: adminNote } : {}) }).eq('id', id)
}

export async function getAllCampaigns() {
  return supabase.from('campaigns').select('*, studios(company_name), missions(*)').order('created_at', { ascending: false })
}

export async function getPendingCampaigns() {
  return supabase.from('campaigns').select('*, studios(company_name), missions(*)').eq('status', 'pending').order('created_at', { ascending: false })
}
```

### src/lib/api/submissions.ts 전체 교체:
```typescript
import { createClient } from '../supabase/client'
import type { Submission } from '../db.types'

const supabase = createClient()

export async function createSubmission(data: Omit<Submission, 'id' | 'created_at' | 'reviewed_at'>) {
  return supabase.from('submissions').insert(data).select().single()
}

export async function reviewSubmission(id: string, result: {
  review_url_valid: boolean
  review_type_match: boolean
  review_duration_meet: boolean
  review_guide_meet: boolean
  status: 'approved' | 'rejected'
  admin_note?: string
}) {
  return supabase.from('submissions').update({ ...result, reviewed_at: new Date().toISOString() }).eq('id', id)
}

export async function getPendingSubmissions() {
  return supabase.from('submissions')
    .select('*, applications(*, creators(name), campaigns(title, game_name)), missions(content_type, guide_approved)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
}
```

---

## 완료 후

1. npx tsc --noEmit 실행해서 남은 에러 수 확인
2. git add . && git commit -m "rebuild: migrate data layer to new schema"
3. PROGRESS.md 업데이트:
   - 수정된 파일 목록
   - 남은 타입 에러 수
   - 다음 Task 준비 상태
