'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { DemoBanner } from './DemoBanner';
import {
  LanguageToggle as _LanguageToggle,
  readStoredLocale,
  type Locale,
} from './LanguageToggle';
import { Sidebar, type SidebarSection } from './Sidebar';
import {
  SizeToggle as _SizeToggle,
  applyTextSize,
  readStoredTextSize,
  type TextSize,
} from './SizeToggle';
import { Topbar, type Persona } from './Topbar';

void _LanguageToggle;
void _SizeToggle;

export interface WorkspaceLayoutProps {
  persona: Persona;
  userName: string;
  userAvatar?: string;
  userBadge?: string;
  sidebarSections: SidebarSection[];
  /** Initial values for the topbar controls. */
  initialTextSize?: TextSize;
  initialLocale?: Locale;
  notificationCount?: number;
  onNotificationClick?: () => void;
  /** Width in px for the sidebar. Default 240. */
  sidebarWidth?: number;
  badgeLabel?: string;
  topbarLeftSlot?: ReactNode;
  children: ReactNode;
}

export function WorkspaceLayout({
  persona,
  userName,
  userAvatar,
  userBadge,
  sidebarSections,
  initialTextSize = 'medium',
  initialLocale = 'ko',
  notificationCount,
  onNotificationClick,
  sidebarWidth = 240,
  badgeLabel,
  topbarLeftSlot,
  children,
}: WorkspaceLayoutProps) {
  const [textSize, setTextSize] = useState<TextSize>(initialTextSize);
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    const storedSize = readStoredTextSize();
    if (storedSize) setTextSize(storedSize);
    const storedLocale = readStoredLocale();
    if (storedLocale) setLocale(storedLocale);
  }, []);

  useEffect(() => {
    applyTextSize(textSize);
  }, [textSize]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-primary">
      <div className="sticky top-0 z-40">
        <DemoBanner />
        <Topbar
          persona={persona}
          userName={userName}
          userAvatar={userAvatar}
          userBadge={userBadge}
          textSize={textSize}
          onTextSizeChange={setTextSize}
          locale={locale}
          onLocaleChange={setLocale}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
          badgeLabel={badgeLabel}
          leftSlot={topbarLeftSlot}
        />
      </div>
      <div className="flex flex-1 min-h-0">
        <Sidebar sections={sidebarSections} width={sidebarWidth} />
        <main className="flex-1 min-w-0 px-10 py-8">{children}</main>
      </div>
    </div>
  );
}
