'use client';

import { Search } from 'lucide-react';

import { Input, Pill } from '@/components/ui';
import type { CampaignStatus } from '@/lib/campaigns/types';

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

      <Input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label="캠페인 검색"
        icon={<Search size={14} />}
        containerClassName="w-72 max-w-full"
      />
    </div>
  );
}
