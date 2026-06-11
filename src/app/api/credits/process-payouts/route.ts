import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { isHoldExpired } from '@/lib/credits'

/**
 * 조회 시점 지급 처리.
 * 로그인 크리에이터의 approved + 미지급(paid_at NULL) submission 중
 * 홀드기간(HOLD_DURATION_HOURS)이 경과한 건을 그 순간 payout 처리한다.
 */
export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  // 본인 approved + 미지급 제출 (RLS가 본인 것으로 제한)
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

    const { data: net, error: payErr } = await supabase.rpc('process_submission_payout', {
      p_submission_id: (s as { id: string }).id,
    })
    if (payErr) {
      // 한 건 실패해도 나머지는 계속 처리
      console.error('process_submission_payout:', payErr.message)
      continue
    }
    const amount = Number(net) || 0
    if (amount > 0) {
      processed += 1
      total += amount
    }
  }

  return NextResponse.json({ success: true, processed, total })
}
