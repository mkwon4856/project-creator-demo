# Project Creator — rebuild Task 1
## DB 스키마 교체 (새 기획 기준)

---

## 배경
현재 코드의 스키마(draft|recruiting|live|completed 등)를 새 기획 스키마로 교체한다.
기존 Sentry/Analytics/SEO/이메일 관련 파일은 절대 건드리지 않는다.

---

## Task 1-1: src/lib/db.types.ts 전면 교체

아래 내용으로 완전 교체해줘. 기존 내용 전부 삭제.

```typescript
// Project Creator — DB Types (새 기획 기준)
// 수동 작성. Supabase 연동 후 npx supabase gen types로 재생성 가능.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ─── Domain Enums ───────────────────────────────────────────────
export type Role = 'studio' | 'creator' | 'admin'
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E'
export type Platform = 'youtube' | 'soop' | 'chzzk' | 'tiktok'
export type ContentType = 'live' | 'longform' | 'shortform'
export type CampaignStatus = 'draft' | 'pending' | 'active' | 'in_progress' | 'reviewing' | 'completed' | 'cancelled'
export type MissionStatus = 'open' | 'filled' | 'completed'
export type ApplicationStatus = 'confirmed' | 'completed' | 'rejected'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected'
export type PaymentStatus = 'pending' | 'processing' | 'completed'
export type BatchStatus = 'pending' | 'processing' | 'completed'

// ─── Table Interfaces ───────────────────────────────────────────
export interface Profile {
  id: string
  email: string
  role: Role
  created_at: string
}

export interface Studio {
  id: string
  profile_id: string
  company_name: string
  contact_name: string | null
  business_number: string | null
  balance: number
  created_at: string
}

export interface Creator {
  id: string
  profile_id: string
  name: string
  bio: string | null
  business_registration_no: string | null
  created_at: string
}

export interface CreatorChannel {
  id: string
  creator_id: string
  platform: Platform
  channel_name: string
  channel_url: string | null
  subscribers: number
  grade: Grade
  content_type: ContentType
  verified_at: string | null
  created_at: string
}

export interface Campaign {
  id: string
  studio_id: string
  title: string
  game_name: string
  genre: string | null
  description: string | null
  thumbnail_url: string | null
  total_budget: number
  remaining_budget: number
  auto_spend_remaining: boolean
  status: CampaignStatus
  admin_note: string | null
  created_at: string
  launched_at: string | null
  completed_at: string | null
}

export interface Mission {
  id: string
  campaign_id: string
  content_type: ContentType
  allowed_grades: Grade[]
  creator_amount: number
  studio_amount: number
  guide_draft: string | null
  guide_approved: string | null
  is_auto_generated: boolean
  status: MissionStatus
  created_at: string
}

export interface Application {
  id: string
  campaign_id: string
  creator_id: string
  content_type: ContentType
  mission_id: string | null
  status: ApplicationStatus
  applied_at: string
  confirmed_at: string
}

export interface Submission {
  id: string
  application_id: string
  mission_id: string
  platform_urls: { platform: Platform; url: string }[]
  review_url_valid: boolean | null
  review_type_match: boolean | null
  review_duration_meet: boolean | null
  review_guide_meet: boolean | null
  status: SubmissionStatus
  admin_note: string | null
  reviewed_at: string | null
  created_at: string
}

export interface SettlementBatch {
  id: string
  year: number
  month: number
  total_amount: number
  creator_count: number
  status: BatchStatus
  processed_at: string | null
  created_at: string
}

export interface Payment {
  id: string
  creator_id: string
  settlement_batch_id: string
  submission_id: string
  base_amount: number
  bonus_amount: number
  total_before_tax: number
  withholding_tax: number
  net_amount: number
  tax_invoice_issued: boolean
  status: PaymentStatus
  created_at: string
}

// ─── Convenience Row Types ──────────────────────────────────────
export type ProfileRow = Profile
export type StudioRow = Studio
export type CreatorRow = Creator
export type CreatorChannelRow = CreatorChannel
export type CampaignRow = Campaign
export type MissionRow = Mission
export type ApplicationRow = Application
export type SubmissionRow = Submission
export type SettlementBatchRow = SettlementBatch
export type PaymentRow = Payment
```

---

## Task 1-2: 단가 매트릭스 상수 파일 생성

src/lib/pricing.ts 파일을 새로 만들어줘:

```typescript
// 단가 매트릭스 (크리에이터 수령 기준, 원)
import type { Grade, ContentType } from './db.types'

export const RATE_MATRIX: Record<Grade, Record<ContentType, number>> = {
  S: { live: 3000000, longform: 5000000, shortform: 800000 },
  A: { live: 2000000, longform: 3000000, shortform: 500000 },
  B: { live: 1000000, longform: 1500000, shortform: 300000 },
  C: { live:  500000, longform:  800000, shortform: 200000 },
  D: { live:  300000, longform:  500000, shortform: 150000 },
  E: { live:  200000, longform:  300000, shortform: 100000 },
}

// 크리에이터 수령 → 게임사 지불 역산 (÷0.7, 플랫폼 수수료 30%)
export function toStudioAmount(creatorAmount: number): number {
  return Math.round(creatorAmount / 0.7)
}

// 허용 등급 중 최고 단가 반환
export function getMaxRate(grades: Grade[], contentType: ContentType): number {
  return Math.max(...grades.map(g => RATE_MATRIX[g][contentType]))
}

// 구독자 수 → 등급 자동 산정
export function subscribersToGrade(subscribers: number): Grade {
  if (subscribers >= 2000000) return 'S'
  if (subscribers >= 500000)  return 'A'
  if (subscribers >= 100000)  return 'B'
  if (subscribers >= 50000)   return 'C'
  if (subscribers >= 20000)   return 'D'
  return 'E'
}

// 플랫폼별 지원 콘텐츠 타입 (고정)
export const PLATFORM_CONTENT_TYPES: Record<string, ContentType[]> = {
  youtube: ['live', 'longform', 'shortform'],
  soop:    ['live'],
  chzzk:   ['live'],
  tiktok:  ['shortform'],
}
```

---

## Task 1-3: 타입 에러 정리

npx tsc --noEmit 실행 후:
- 구 CreatorGrade → Grade 로 교체
- 구 CampaignStatus 값(recruiting/live 등) → 새 값으로 교체
- 구 MissionType → ContentType 으로 교체
- 구 ApplicationStatus(applied/accepted) → 새 값으로 교체
- 구 SubmissionStatus(making/review) → 새 값으로 교체

주의: Sentry/Analytics/이메일 관련 파일(sentry.*.config.ts, instrumentation*.ts, global-error.tsx, lib/email/*)은 건드리지 말 것.

---

## 완료 후

1. git add . && git commit -m "rebuild: replace db.types with new schema"
2. PROGRESS.md 생성:
   - 교체된 파일 목록
   - 남은 타입 에러 수
   - 에러 내용 요약
