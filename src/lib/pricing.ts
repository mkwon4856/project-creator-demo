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

// 예상 참여 인원 범위 (오픈마켓: 예산 ÷ 1인 단가)
export interface CreatorRange {
  min: number
  max: number
}

// 주어진 예산으로 허용 등급에 참여 가능한 인원을 범위로 계산.
// - 최고 등급 단가(=1인 최대비용) → 최소 인원
// - 최저 등급 단가(=1인 최소비용) → 최대 인원
export function estimateCreatorRange(
  budget: number,
  grades: Grade[],
  contentType: ContentType
): CreatorRange {
  if (budget <= 0 || !grades.length) return { min: 0, max: 0 }
  // 단가 0(0 나누기) 방지
  const rates = grades.map(g => RATE_MATRIX[g][contentType]).filter(r => r > 0)
  if (!rates.length) return { min: 0, max: 0 }

  const maxCostPerPerson = toStudioAmount(Math.max(...rates)) // 최고 단가 → 최소 인원
  const minCostPerPerson = toStudioAmount(Math.min(...rates)) // 최저 단가 → 최대 인원

  const minPeople = Math.floor(budget / maxCostPerPerson)
  const maxPeople = Math.floor(budget / minCostPerPerson)

  // min > max 방지 보정
  return {
    min: Math.min(minPeople, maxPeople),
    max: Math.max(minPeople, maxPeople),
  }
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
