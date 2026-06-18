'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutInline } from './LogoutInline';

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
  ],
};

/**
 * 역할별 전역 상단 네비게이션 바.
 * 좌측 로고(역할별 홈으로 이동), 중앙 역할별 메뉴, 최우측 로그아웃.
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

        {/* 로그아웃 */}
        <div className="shrink-0">
          <LogoutInline />
        </div>
      </div>
    </nav>
  );
}
