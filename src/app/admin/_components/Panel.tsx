'use client';

import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  cta?: ReactNode;
  ctaHref?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}

export function Panel({
  title,
  cta = 'Full report',
  ctaHref,
  rightSlot,
  children,
  bodyClassName = 'p-5',
}: PanelProps) {
  return (
    <section className="border border-white/[0.06] rounded-lg overflow-hidden bg-bg-card flex flex-col">
      <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-medium text-text-primary leading-tight">{title}</h3>
        <div className="flex items-center gap-3">
          {rightSlot}
          {ctaHref && (
            <a
              href={ctaHref}
              className="inline-flex items-center gap-1 text-xs text-ube-bright hover:text-white transition-colors duration-150 ease-out"
            >
              {cta}
              <ArrowRight size={12} aria-hidden />
            </a>
          )}
        </div>
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
