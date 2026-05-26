'use client';

import { useEffect } from 'react';

export type TextSize = 'small' | 'medium' | 'large';

const STORAGE_KEY = 'pc-text-size';
const SIZES: TextSize[] = ['small', 'medium', 'large'];

const BUTTON_TEXT_SIZE: Record<TextSize, string> = {
  small: 'text-[11px]',
  medium: 'text-[13px]',
  large: 'text-[15px] font-medium',
};

export interface SizeToggleProps {
  value: TextSize;
  onChange: (size: TextSize) => void;
}

export function applyTextSize(size: TextSize) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.size = size;
  try {
    localStorage.setItem(STORAGE_KEY, size);
  } catch {
    /* ignore */
  }
}

export function readStoredTextSize(): TextSize | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY) as TextSize | null;
    if (v && SIZES.includes(v)) return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function SizeToggle({ value, onChange }: SizeToggleProps) {
  useEffect(() => {
    applyTextSize(value);
  }, [value]);

  return (
    <div
      role="radiogroup"
      aria-label="텍스트 크기"
      className="flex items-center gap-0.5 bg-bg-card border border-white/10 rounded-lg p-0.5"
    >
      {SIZES.map((s) => {
        const active = s === value;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${s} text size`}
            onClick={() => onChange(s)}
            className={[
              'px-2.5 py-1 rounded-md leading-none transition-colors duration-150 ease-out cursor-pointer',
              BUTTON_TEXT_SIZE[s],
              active
                ? 'bg-ube text-white'
                : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            A
          </button>
        );
      })}
    </div>
  );
}
