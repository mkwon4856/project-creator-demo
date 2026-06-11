import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { data } = await supabase
    .from('studio_credits')
    .select('total_charged, available, held')
    .eq('studio_id', user.id)
    .maybeSingle()

  return NextResponse.json(
    data ?? { total_charged: 0, available: 0, held: 0 },
  )
}
