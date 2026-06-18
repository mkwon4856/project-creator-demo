'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * 공개 크리에이터 프로필용 상단 바.
 * 좌측: 이전 페이지로 돌아가기(브라우저 히스토리). 우측: 홈 로고.
 * 역할 무관 공개 페이지라 역할별 TopNav 대신 가벼운 바를 쓴다.
 */
export function BackBar() {
  const router = useRouter();

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
          href="/"
          className="text-sm font-black text-white whitespace-nowrap hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'Arial Black' }}
        >
          Project Creator
        </Link>
      </div>
    </nav>
  );
}
