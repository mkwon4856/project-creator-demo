'use client';

import type { ReactNode } from 'react';

export type CountVariant = 'default' | 'urgent';

export interface SidebarItem {
  id: string;
  icon: ReactNode;
  label: string;
  href?: string;
  count?: number;
  countVariant?: CountVariant;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  /** Width in pixels. Default 240. */
  width?: number;
  /** Notify parent of click for non-href items. Falls back to item.onClick. */
  onItemClick?: (item: SidebarItem) => void;
}

function CountBadge({ count, variant = 'default' }: { count: number; variant?: CountVariant }) {
  return (
    <span
      className={[
        'ml-auto inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-lg text-[11px] font-medium tabular-nums leading-none',
        variant === 'urgent'
          ? 'bg-red-500/15 text-red-400'
          : 'bg-bg-card text-text-secondary',
      ].join(' ')}
    >
      {count}
    </span>
  );
}

function ItemRow({ item, onItemClick }: { item: SidebarItem; onItemClick?: (i: SidebarItem) => void }) {
  const handleClick = () => {
    item.onClick?.();
    onItemClick?.(item);
  };

  const baseClass = [
    'flex items-center gap-2.5 px-5 py-2 text-sm leading-tight transition-colors duration-150 ease-out cursor-pointer select-none',
    item.active
      ? 'text-ube-bright bg-ube-tint border-r-2 border-ube'
      : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border-r-2 border-transparent',
  ].join(' ');

  const inner = (
    <>
      <span className="inline-flex shrink-0 w-4 h-4 items-center justify-center" aria-hidden>
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
      {typeof item.count === 'number' && (
        <CountBadge count={item.count} variant={item.countVariant} />
      )}
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        aria-current={item.active ? 'page' : undefined}
        className={baseClass}
        onClick={(e) => {
          if (item.onClick || onItemClick) {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-current={item.active ? 'page' : undefined}
      className={`${baseClass} w-full text-left`}
    >
      {inner}
    </button>
  );
}

export function Sidebar({ sections, width = 240, onItemClick }: SidebarProps) {
  return (
    <aside
      className="shrink-0 border-r border-white/[0.06] bg-bg-base"
      style={{ width }}
      aria-label="워크스페이스 사이드바"
    >
      <nav className="py-5 flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.label} className="flex flex-col">
            <div className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              {section.label}
            </div>
            <div className="flex flex-col">
              {section.items.map((item) => (
                <ItemRow key={item.id} item={item} onItemClick={onItemClick} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
