'use client';

import { ChevronDown, LogOut, Settings, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';

export type TopNavRole = 'studio' | 'creator' | 'admin';

interface NavItem {
  label: string;
  href: string;
}

const ROLE_HOME: Record<TopNavRole, string> = {
  studio: '/studio',
  creator: '/creator',
  admin: '/admin',
};

const ROLE_MENUS: Record<TopNavRole, NavItem[]> = {
  studio: [
    { label: '대시보드', href: '/studio' },
    { label: '캠페인 둘러보기', href: '/studio/campaigns' },
    { label: '크리에이터 찾기', href: '/studio/creators' },
    { label: '캠페인 만들기', href: '/studio/new' },
  ],
  creator: [
    { label: '캠페인 탐색', href: '/creator' },
    { label: '내 지원·제출', href: '/creator/activity' },
    { label: '수익', href: '/creator/earnings' },
    { label: '채널 관리', href: '/creator/profile' },
  ],
  admin: [
    { label: '대시보드', href: '/admin' },
    { label: '캠페인 승인', href: '/admin/campaigns' },
    { label: '콘텐츠 검수', href: '/admin/payouts' },
    { label: '게임사 관리', href: '/admin/studios' },
    { label: '크리에이터 관리', href: '/admin/creators' },
  ],
};

// 역할별 설정 페이지 (관리자는 설정 페이지 없음)
const SETTINGS_HREF: Partial<Record<TopNavRole, string>> = {
  studio: '/studio/settings',
  creator: '/creator/settings',
};

/** 우측 계정 드롭다운: 설정(있으면) + 로그아웃 */
function AccountMenu({ role }: { role: TopNavRole }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const settingsHref = SETTINGS_HREF[role];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await createClient().auth.signOut();
    } catch {
      // 세션이 없거나 실패해도 로그인 페이지로 보낸다.
    }
    router.push('/login');
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-white/50 hover:text-white transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserCircle2 size={20} aria-hidden />
        <ChevronDown size={14} aria-hidden />
      </button>

      {open && (
        <>
          {/* 바깥 클릭 시 닫기 */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 mt-2 w-40 rounded-lg border border-white/10 bg-[#15151d] py-1 shadow-xl z-50"
          >
            {settingsHref && (
              <Link
                href={settingsHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings size={14} aria-hidden />
                설정
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <LogOut size={14} aria-hidden />
              {loggingOut ? '로그아웃 중…' : '로그아웃'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * 역할별 전역 상단 네비게이션 바.
 * 좌측 로고(역할별 홈으로 이동), 중앙 역할별 메뉴, 우측 계정 드롭다운(설정·로그아웃).
 * 현재 경로와 정확히 일치하거나 하위 경로면 활성 표시(보라 텍스트 + 하단 보더).
 */
export function TopNav({ role }: { role: TopNavRole }) {
  const pathname = usePathname();
  const home = ROLE_HOME[role];
  const menus = ROLE_MENUS[role];

  // 홈 메뉴는 정확 일치만, 그 외는 정확 일치 또는 하위 경로면 활성
  const isActive = (href: string) => {
    if (href === home) return pathname === home;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-6">
        {/* 로고 → 역할별 홈 */}
        <Link
          href={home}
          className="text-sm font-black text-white whitespace-nowrap hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'Arial Black' }}
        >
          Project Creator
        </Link>

        {/* 역할별 메뉴 */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
          {menus.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 h-14 inline-flex items-center text-sm whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? 'text-[#9B7EC8] border-[#9B7EC8] font-medium'
                    : 'text-white/50 border-transparent hover:text-white/80'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* 계정 드롭다운 */}
        <AccountMenu role={role} />
      </div>
    </nav>
  );
}
