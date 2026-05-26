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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedSize = readStoredTextSize();
    if (storedSize) setTextSize(storedSize);
    const storedLocale = readStoredLocale();
    if (storedLocale) setLocale(storedLocale);
  }, []);

  useEffect(() => {
    applyTextSize(textSize);
  }, [textSize]);

  // Lock body scroll when the mobile sidebar overlay is open.
  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);

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
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar — always visible at md+ */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar sections={sidebarSections} width={sidebarWidth} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="사이드 메뉴"
          >
            <div
              className="absolute inset-0 bg-black/60 ui-anim-fade-in"
              onClick={closeSidebar}
              aria-hidden
            />
            <div
              className="absolute left-0 top-0 bottom-0 shadow-[8px_0_24px_rgba(0,0,0,0.5)] ui-anim-slide-in-left"
              style={{ width: sidebarWidth }}
            >
              <Sidebar
                sections={sidebarSections}
                width={sidebarWidth}
                onClose={closeSidebar}
                onItemClick={closeSidebar}
              />
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0 px-4 py-6 md:px-10 md:py-8">{children}</main>
      </div>
    </div>
  );
}
