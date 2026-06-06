'use client';

import { Search } from 'lucide-react';
import type { ChangeEvent } from 'react';

import { Pill } from '@/components/ui';
import type { CampaignStatus } from '@/lib/mockCampaigns';

export type StatusFilter = 'all' | CampaignStatus;

const STATUS_TABS: ReadonlyArray<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'live', label: '진행중' },
  { id: 'recruiting', label: '모집중' },
  { id: 'completed', label: '완료' },
];

export interface CampaignToolbarProps {
  status: StatusFilter;
  onStatusChange: (s: StatusFilter) => void;
  search: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
}

export function CampaignToolbar({
  status,
  onStatusChange,
  search,
  onSearchChange,
  searchPlaceholder = '캠페인 검색…',
}: CampaignToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-1.5">
        {STATUS_TABS.map((tab) => (
          <Pill
            key={tab.id}
            variant={tab.id === status ? 'active' : 'default'}
            size="md"
            onClick={() => onStatusChange(tab.id)}
          >
            {tab.label}
          </Pill>
        ))}
      </div>

      <label
        className={[
          'flex items-center gap-2 px-3 py-2 rounded-md w-72 max-w-full',
          'bg-bg-card border border-white/10 transition-all duration-150 ease-out',
          'focus-within:border-ube focus-within:shadow-[0_0_0_3px_var(--ube-tint)]',
        ].join(' ')}
      >
        <Search size={14} className="text-text-muted shrink-0" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted"
          aria-label="캠페인 검색"
        />
      </label>
    </div>
  );
}
