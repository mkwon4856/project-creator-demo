'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';

/**
 * 사이드바 없는 대시보드 페이지 헤더 우측에 배치하는 인라인 로그아웃 버튼.
 * supabase.auth.signOut() 후 /login 으로 이동한다.
 */
export function LogoutInline({ label = true }: { label?: boolean }) {
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
      title="로그아웃"
      className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
    >
      <LogOut size={14} aria-hidden />
      {label && <span>{loading ? '로그아웃 중…' : '로그아웃'}</span>}
    </button>
  );
}
