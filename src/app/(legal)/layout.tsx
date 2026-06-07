import Link from 'next/link';
import type { ReactNode } from 'react';

import { DemoBanner } from '@/components/layout';

function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const cls =
    size === 'sm'
      ? 'text-sm font-semibold tracking-tight'
      : 'text-base font-semibold tracking-tight';
  return (
    <Link href="/" className={`${cls} text-text-primary`}>
      Project <span className="text-primary">Creator</span>
    </Link>
  );
}

function LegalHeader() {
  return (
    <header className="flex items-center justify-between py-5 border-b border-border">
      <Logo />
      <Link
        href="/"
        className="text-xs text-text-secondary hover:text-text-primary transition-colors duration-150 ease-out"
      >
        ← 홈으로
      </Link>
    </header>
  );
}

function LegalFooter() {
  return (
    <footer className="py-6 mt-8 border-t border-border flex flex-wrap justify-between items-center gap-3">
      <Logo size="sm" />
      <nav aria-label="법적 고지" className="flex items-center gap-4 text-xs text-text-secondary">
        <Link
          href="/terms"
          className="hover:text-text-primary transition-colors duration-150 ease-out"
        >
          이용약관
        </Link>
        <Link
          href="/privacy"
          className="hover:text-text-primary transition-colors duration-150 ease-out"
        >
          개인정보처리방침
        </Link>
      </nav>
      <span className="text-xs text-text-secondary">
        © 2025 Project Creator. All rights reserved.
      </span>
    </footer>
  );
}

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <div className="sticky top-0 z-40">
        <DemoBanner />
      </div>
      <div className="w-full max-w-[800px] mx-auto px-6 py-12">
        <LegalHeader />
        <article className="pt-4 pb-2">{children}</article>
        <LegalFooter />
      </div>
    </main>
  );
}
