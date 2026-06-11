import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

const MIN_CHARGE = 100000

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  // role='studio' 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.role !== 'studio') {
    return NextResponse.json({ error: '게임사 계정만 충전할 수 있습니다.' }, { status: 403 })
  }

  let amount: number
  try {
    const body = await req.json()
    amount = Number(body?.amount)
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 })
  }

  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < MIN_CHARGE) {
    return NextResponse.json(
      { error: `충전 금액은 최소 ${MIN_CHARGE.toLocaleString()}원입니다.` },
      { status: 400 },
    )
  }

  const { data, error } = await supabase.rpc('charge_credits', {
    p_studio_id: user.id,
    p_amount: amount,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, available: data as number })
}
