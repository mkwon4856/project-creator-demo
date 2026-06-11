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
