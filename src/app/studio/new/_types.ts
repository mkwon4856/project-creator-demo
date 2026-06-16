import type { ContentType, Grade } from '@/lib/db.types'

// 미션 슬롯 (게임사가 구성하는 단위)
export interface MissionSlot {
  id: string           // 임시 UI ID
  content_type: ContentType
  allowed_grades: Grade[]
  guide_draft: string[]  // 줄 단위 배열
  creator_amount: number   // 크리에이터 수령 단가 (자동계산)
  studio_amount: number    // 게임사 지불 단가 (creator_amount ÷ 0.7)
}

// Wizard 전체 상태
export interface WizardState {
  // 1단계
  game_name: string
  genre: string
  description: string
  thumbnail_url: string
  deadline: string

  // 2단계
  total_budget: number
  missions: MissionSlot[]
  auto_spend_remaining: boolean

  // 3단계 (계산값)
  estimated_creators: number
  remaining_budget: number
  auto_missions: MissionSlot[]  // 잔여예산 자동배분 미션
}

export const GENRES = ['RPG', 'FPS', '전략', '스포츠', '퍼즐', '액션', '시뮬레이션', '기타'] as const

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
}

export const GRADE_LABELS: Record<Grade, string> = {
  S: 'S등급 (200만+)',
  A: 'A등급 (50만~200만)',
  B: 'B등급 (10만~50만)',
  C: 'C등급 (5만~10만)',
  D: 'D등급 (2만~5만)',
  E: 'E등급 (1만~2만)',
}
