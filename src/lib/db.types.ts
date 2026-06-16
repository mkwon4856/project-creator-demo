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
  deadline: string | null
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
