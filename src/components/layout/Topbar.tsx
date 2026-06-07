'use client';

import { Bell, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { Badge, IconButton } from '@/components/ui';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

import { type Locale } from './LanguageToggle';
import { SizeToggle, type TextSize } from './SizeToggle';

export type Persona = 'studio' | 'creator' | 'admin';

const PERSONA_LINKS: ReadonlyArray<{ key: Persona; label: string; href: string }> = [
  { key: 'studio', label: '게임사', href: '/studio' },
  { key: 'creator', label: '크리에이터', href: '/creator' },
  { key: 'admin', label: '관리자', href: '/admin' },
];

function isPersonaActive(pathname: string, key: Persona): boolean {
  const prefix =
    key === 'studio' ? '/studio' : key === 'creator' ? '/creator' : '/admin';
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function PersonaNavLink({
  href,
  label,
  active,
  variant,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  variant: 'desktop' | 'mobile';
  onNavigate?: () => void;
}) {
  if (variant === 'desktop') {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={[
          'relative inline-flex items-center px-3 h-14 text-sm transition-colors duration-150 ease-out',
          active
            ? 'text-text-primary font-medium'
            : 'text-text-secondary hover:text-text-primary',
        ].join(' ')}
        aria-current={active ? 'page' : undefined}
      >
        {label}
        {active && (
          <span
            aria-hidden
            className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary"
          />
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        'block py-3 px-4 text-sm transition-colors duration-150 ease-out',
        active
          ? 'text-primary bg-primary-dim font-medium'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
      ].join(' ')}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  );
}

function DesktopPersonaNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="역할 메뉴"
      className="hidden md:flex items-center gap-0.5 ml-2"
    >
      {PERSONA_LINKS.map((p) => (
        <PersonaNavLink
          key={p.key}
          href={p.href}
          label={p.label}
          active={isPersonaActive(pathname, p.key)}
          variant="desktop"
        />
      ))}
    </nav>
  );
}

function MobilePersonaNavPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  if (!open) return null;

  return (
    <nav
      aria-label="역할 메뉴"
      className="md:hidden border-b border-border bg-surface"
    >
      {PERSONA_LINKS.map((p) => (
        <PersonaNavLink
          key={p.key}
          href={p.href}
          label={p.label}
          active={isPersonaActive(pathname, p.key)}
          variant="mobile"
          onNavigate={onClose}
        />
      ))}
    </nav>
  );
}

export interface TopbarProps {
  persona: Persona;
  userName: string;
  userAvatar?: string;
  userBadge?: string;
  textSize: TextSize;
  onTextSizeChange: (size: TextSize) => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  /** Override demo badge label. Default: "ADMIN" if persona === 'admin', else "DEMO". */
  badgeLabel?: string;
  /** Optional left-side extra content (e.g., breadcrumbs). */
  leftSlot?: ReactNode;
  /** Mobile-only: show a hamburger button on the left and call this when tapped. */
  onMenuToggle?: () => void;
}

function DemoBadge({ persona, label }: { persona: Persona; label?: string }) {
  const isAdmin = persona === 'admin';
  const text = label ?? (isAdmin ? '관리자' : 'DEMO');

  if (isAdmin) {
    return (
      <Badge variant="primary" size="xs" className="uppercase tracking-wider">
        {text}
      </Badge>
    );
  }

  return (
    <Badge variant="neutral" size="xs" className="uppercase tracking-wider">
      {text}
    </Badge>
  );
}

function Avatar({ avatar, name }: { avatar?: string; name: string }) {
  const isUrl = avatar && /^(https?:|\/)/i.test(avatar);
  return (
    <span
      className="inline-flex w-8 h-8 rounded-full bg-bg-card border border-border items-center justify-center overflow-hidden text-base shrink-0"
      aria-hidden
    >
      {avatar && isUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="leading-none">{avatar ?? name.charAt(0)}</span>
      )}
    </span>
  );
}

function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // Demo mode (no Supabase env) — fall through to redirect.
    }
    router.push('/login');
  };
  return (
    <IconButton aria-label="로그아웃" title="로그아웃" size="md" onClick={handleLogout}>
      <LogOut size={16} aria-hidden />
    </IconButton>
  );
}

function NotificationBell({
  count,
  onClick,
}: {
  count?: number;
  onClick?: () => void;
}) {
  const hasCount = typeof count === 'number' && count > 0;
  return (
    <span className="relative inline-flex">
      <IconButton
        aria-label={hasCount ? `알림 ${count}개` : '알림'}
        size="md"
        onClick={onClick}
      >
        <Bell size={16} aria-hidden />
      </IconButton>
      {hasCount && (
        <span className="pointer-events-none absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[10px] text-bg font-semibold flex items-center justify-center leading-none ring-1 ring-bg">
          {count! > 99 ? '99+' : count}
        </span>
      )}
    </span>
  );
}

export function Topbar({
  persona,
  userName,
  userAvatar,
  userBadge,
  textSize,
  onTextSizeChange,
  notificationCount,
  onNotificationClick,
  badgeLabel,
  leftSlot,
  onMenuToggle,
}: TopbarProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="sticky top-0 z-50">
      <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-bg/95 backdrop-blur-md gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {onMenuToggle && (
            <IconButton
              aria-label="사이드바 메뉴"
              size="md"
              className="md:hidden shrink-0"
              onClick={onMenuToggle}
            >
              <Menu size={20} aria-hidden />
            </IconButton>
          )}
          <Link
            href={
              persona === 'studio'
                ? '/studio'
                : persona === 'creator'
                  ? '/creator'
                  : '/admin'
            }
            className="text-sm font-bold tracking-tight text-text-primary whitespace-nowrap shrink-0"
          >
            Project <span className="text-primary">Creator</span>
          </Link>
          <DemoBadge persona={persona} label={badgeLabel} />
          <DesktopPersonaNav />
          {leftSlot && <div className="ml-2 min-w-0 hidden md:block">{leftSlot}</div>}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <IconButton
            aria-label={navOpen ? '역할 메뉴 닫기' : '역할 메뉴 열기'}
            size="md"
            className="md:hidden"
            onClick={() => setNavOpen((v) => !v)}
          >
            {navOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </IconButton>

          <div className="hidden md:flex items-center">
            <SizeToggle value={textSize} onChange={onTextSizeChange} />
          </div>
          <NotificationBell count={notificationCount} onClick={onNotificationClick} />
          <div className="flex items-center gap-2 pl-0.5 sm:pl-1">
            <Avatar avatar={userAvatar} name={userName} />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-medium text-text-primary">{userName}</span>
              {userBadge && (
                <span className="text-[11px] text-text-muted">{userBadge}</span>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <MobilePersonaNavPanel open={navOpen} onClose={closeNav} />
    </div>
  );
}
