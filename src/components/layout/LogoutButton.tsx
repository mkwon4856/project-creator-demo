'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';

/**
 * 사이드바 하단 로그아웃 버튼 (studio/creator/admin 공통).
 * Supabase 세션을 종료하고 로그인 페이지로 이동한다.
 */
export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // 세션이 없거나 실패해도 로그인 페이지로 보낸다.
    }
    router.push('/login');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2.5 w-full px-5 py-2 text-sm leading-tight text-left text-red-400 hover:bg-red-500/10 transition-colors duration-150 ease-out cursor-pointer select-none disabled:opacity-50"
    >
      <span className="inline-flex shrink-0 w-4 h-4 items-center justify-center" aria-hidden>
        <LogOut size={16} />
      </span>
      <span className="truncate">{loading ? '로그아웃 중…' : '로그아웃'}</span>
    </button>
  );
}
