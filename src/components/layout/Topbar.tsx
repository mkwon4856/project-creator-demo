'use client';

import { Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

import { LanguageToggle, type Locale } from './LanguageToggle';
import { SizeToggle, type TextSize } from './SizeToggle';

export type Persona = 'studio' | 'creator' | 'admin';

const PERSONA_LINKS: ReadonlyArray<{ key: Persona; label: string; href: string }> = [
  { key: 'studio', label: '게임사', href: '/studio' },
  { key: 'creator', label: '크리에이터', href: '/creator' },
  { key: 'admin', label: '관리자', href: '/admin' },
];

function PersonaSwitcher({ persona }: { persona: Persona }) {
  return (
    <nav
      aria-label="페르소나 전환 (데모용)"
      className="hidden md:flex items-center gap-1 ml-4 text-xs"
    >
      {PERSONA_LINKS.map((p, i) => (
        <span key={p.key} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-text-muted">·</span>}
          <Link
            href={p.href}
            className={
              p.key === persona
                ? 'text-ube-bright font-medium px-1.5 py-0.5 rounded'
                : 'text-text-muted hover:text-text-secondary px-1.5 py-0.5 rounded transition-colors duration-150 ease-out'
            }
            aria-current={p.key === persona ? 'page' : undefined}
          >
            {p.label}
          </Link>
        </span>
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
}

function DemoBadge({ persona, label }: { persona: Persona; label?: string }) {
  const isAdmin = persona === 'admin';
  const text = label ?? (isAdmin ? 'ADMIN' : 'DEMO');
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase leading-none',
        isAdmin
          ? 'text-white border border-ube-dark'
          : 'bg-ube-tint text-ube-bright border border-ube/30',
      ].join(' ')}
      style={
        isAdmin
          ? { background: 'linear-gradient(135deg, var(--ube-dark), #3F2D5A)' }
          : undefined
      }
    >
      {text}
    </span>
  );
}

function Avatar({ avatar, name }: { avatar?: string; name: string }) {
  const isUrl = avatar && /^(https?:|\/)/i.test(avatar);
  return (
    <span
      className="inline-flex w-8 h-8 rounded-full bg-bg-card border border-white/10 items-center justify-center overflow-hidden text-base shrink-0"
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
    <button
      type="button"
      onClick={handleLogout}
      title="Log out"
      aria-label="Log out"
      className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-bg-card border border-white/10 text-text-secondary hover:text-red-400 hover:border-white/20 transition-colors duration-150 ease-out cursor-pointer"
    >
      <LogOut size={16} aria-hidden />
    </button>
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
    <button
      type="button"
      onClick={onClick}
      aria-label={hasCount ? `알림 ${count}개` : '알림'}
      className="relative inline-flex w-9 h-9 items-center justify-center rounded-lg bg-bg-card border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 transition-colors duration-150 ease-out cursor-pointer"
    >
      <Bell size={16} aria-hidden />
      {hasCount && (
        <span
          className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-ube-bright text-[10px] text-white font-semibold flex items-center justify-center leading-none ring-1 ring-bg-base"
        >
          {count! > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}

export function Topbar({
  persona,
  userName,
  userAvatar,
  userBadge,
  textSize,
  onTextSizeChange,
  locale,
  onLocaleChange,
  notificationCount,
  onNotificationClick,
  badgeLabel,
  leftSlot,
}: TopbarProps) {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-bg-base">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-base font-semibold tracking-tight">
          Project <span className="text-ube-bright">Creator</span>
        </span>
        <DemoBadge persona={persona} label={badgeLabel} />
        <PersonaSwitcher persona={persona} />
        {leftSlot && <div className="ml-3 min-w-0">{leftSlot}</div>}
      </div>

      <div className="flex items-center gap-3">
        <SizeToggle value={textSize} onChange={onTextSizeChange} />
        <LanguageToggle value={locale} onChange={onLocaleChange} />
        <NotificationBell count={notificationCount} onClick={onNotificationClick} />
        <div className="flex items-center gap-2 pl-2">
          <Avatar avatar={userAvatar} name={userName} />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-text-primary">{userName}</span>
            {userBadge && (
              <span className="text-[11px] text-text-muted">{userBadge}</span>
            )}
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
