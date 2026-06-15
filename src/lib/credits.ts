// 크레딧 홀드 기간 유틸
// 홀드 기간 (시연 시 이 값만 바꾸면 됨. 실서비스 24)
// [시연용 임시 변경] 0.0833 = 5분 (실서비스 복구 시 24로 되돌릴 것)
export const HOLD_DURATION_HOURS = 0.0833

// 최소 출금 금액 (1만원). DB request_withdrawal 함수와 동일하게 유지할 것.
export const MIN_WITHDRAWAL_AMOUNT = 10000

// 원천징수율 3.3%
export const WITHHOLDING_RATE = 0.033

// 세전 금액 → 원천징수/실수령 계산 (DB와 동일 규칙: round)
export function calcWithholding(amount: number): { tax: number; net: number } {
  const tax = Math.round(amount * WITHHOLDING_RATE)
  return { tax, net: amount - tax }
}

// approved_at 기준 홀드 종료 시각
export function getHoldReleaseTime(approvedAt: string): Date {
  return new Date(new Date(approvedAt).getTime() + HOLD_DURATION_HOURS * 3600 * 1000)
}

// 홀드 종료 여부
export function isHoldExpired(approvedAt: string): boolean {
  return Date.now() >= getHoldReleaseTime(approvedAt).getTime()
}

// 남은 홀드 시간 (밀리초, 음수면 0)
export function getHoldRemainingMs(approvedAt: string): number {
  return Math.max(0, getHoldReleaseTime(approvedAt).getTime() - Date.now())
}

export function formatHoldRemaining(approvedAt: string): string {
  const ms = getHoldRemainingMs(approvedAt)
  if (ms <= 0) return '지급 가능'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h > 0) return `${h}시간 ${m}분 후 지급`
  return `${m}분 후 지급`
}
