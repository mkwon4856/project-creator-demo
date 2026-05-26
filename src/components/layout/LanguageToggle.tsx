'use client';

import { Globe } from 'lucide-react';
import { useEffect } from 'react';

export type Locale = 'ko' | 'en';

const STORAGE_KEY = 'pc-locale';

export interface LanguageToggleProps {
  value: Locale;
  onChange: (lang: Locale) => void;
}

export function readStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (v === 'ko' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  useEffect(() => {
    persistLocale(value);
  }, [value]);

  const next: Locale = value === 'ko' ? 'en' : 'ko';

  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      aria-label={`현재 언어 ${value.toUpperCase()}, ${next.toUpperCase()}로 전환`}
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer',
        'bg-bg-card border border-white/10 text-xs text-text-secondary',
        'hover:text-text-primary hover:border-white/20 transition-colors duration-150 ease-out',
      ].join(' ')}
    >
      <Globe size={14} aria-hidden />
      <span className="font-medium tabular-nums">{value.toUpperCase()}</span>
    </button>
  );
}
