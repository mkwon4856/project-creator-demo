'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

const HOME_BY_ROLE: Record<string, string> = {
  studio: '/studio',
  creator: '/creator',
  admin: '/admin',
};

/**
 * 공개 크리에이터 프로필용 상단 바.
 * 좌측: 이전 페이지로 돌아가기(브라우저 히스토리). 우측: 로고.
 * 로고는 로그인 시 역할 홈, 비로그인 시 랜딩(/)으로 이동(전역 규칙 일치).
 */
export function BackBar() {
  const router = useRouter();
  const [homeHref, setHomeHref] = useState('/');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.role && HOME_BY_ROLE[data.role]) setHomeHref(HOME_BY_ROLE[data.role]);
        });
    });
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          ← 돌아가기
        </button>
        <Link
          href={homeHref}
          className="text-sm font-black text-white whitespace-nowrap hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'Arial Black' }}
        >
          Project Creator
        </Link>
      </div>
    </nav>
  );
}
