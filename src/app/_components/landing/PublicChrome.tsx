'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui';
import { SITE_NAME, splitSiteName } from '@/lib/siteConfig';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const cls =
    size === 'sm'
      ? 'text-sm font-semibold tracking-tight'
      : 'text-base font-semibold tracking-tight';
  const { prefix, accent } = splitSiteName();
  return (
    <Link href="/" className={`${cls} text-text-primary`}>
      {prefix ? (
        <>
          {prefix} <span className="text-primary">{accent}</span>
        </>
      ) : (
        <span className="text-primary">{accent}</span>
      )}
    </Link>
  );
}

export function NavBar() {
  const router = useRouter();
  return (
    <nav className="flex items-center justify-between gap-3 py-5">
      <Logo />
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="md"
          className="w-full sm:w-auto"
          onClick={() => router.push('/login')}
        >
          로그인
        </Button>
        <Button
          variant="primary"
          size="md"
          className="w-full sm:w-auto"
          onClick={() => router.push('/signup')}
        >
          시작하기
        </Button>
      </div>
    </nav>
  );
}

export function FooterBar() {
  return (
    <footer className="py-6 border-t border-border flex flex-wrap justify-between items-center gap-3">
      <Logo size="sm" />
      <nav aria-label="법적 고지" className="flex items-center gap-4 text-xs text-text-secondary">
        <Link
          href="/pricing"
          className="hover:text-text-primary transition-colors duration-150 ease-out"
        >
          가격 정책
        </Link>
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
        © 2026 {SITE_NAME}. All rights reserved.
      </span>
    </footer>
  );
}
