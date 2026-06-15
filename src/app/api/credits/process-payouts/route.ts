import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { isHoldExpired } from '@/lib/credits'

/**
 * 홀드 종료분 적립 처리 (조회 시점).
 * 로그인 크리에이터의 approved + 미적립(paid_at NULL) submission 중
 * 홀드기간(HOLD_DURATION_HOURS)이 경과한 건을 출금 가능 잔액(available)으로 전환한다.
 *
 * 변경(정산 모델): 예전엔 이 시점에 "지급"(payments 생성)했지만, 이제는
 *   - 게임사 held 차감(payout_credits, 집행 확정) 유지
 *   - 크리에이터 pending → available 이동(accrue_to_balance)
 * 만 수행한다. 실제 지급은 크리에이터가 출금 신청(request_withdrawal)할 때 일어난다.
 */
export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  // 본인 approved + 미적립 제출 (RLS가 본인 것으로 제한)
  const { data: subs, error } = await supabase
    .from('submissions')
    .select('id, approved_at, status, paid_at')
    .eq('status', 'approved')
    .is('paid_at', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  let processed = 0
  let total = 0

  for (const s of subs ?? []) {
    const approvedAt = (s as { approved_at: string | null }).approved_at
    if (!approvedAt) continue
    if (!isHoldExpired(approvedAt)) continue

    const { data: amount, error: accrueErr } = await supabase.rpc('accrue_submission', {
      p_submission_id: (s as { id: string }).id,
    })
    if (accrueErr) {
      // 한 건 실패해도 나머지는 계속 처리
      console.error('accrue_submission:', accrueErr.message)
      continue
    }
    const accrued = Number(amount) || 0
    if (accrued > 0) {
      processed += 1
      total += accrued
    }
  }

  return NextResponse.json({ success: true, processed, total })
}
