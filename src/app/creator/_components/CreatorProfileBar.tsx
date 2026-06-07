'use client';

import { BadgeCheck } from 'lucide-react';

import { Badge, Card } from '@/components/ui';

import { type Creator, formatSubscribers } from '@/lib/mockCreators';

interface CreatorProfileBarProps {
  creator: Creator;
}

function MetaItem({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden>{icon}</span>
      <span className="text-text-primary font-medium tabular-nums">{value}</span>
      <span className="text-text-secondary">{label}</span>
    </span>
  );
}

export function CreatorProfileBar({ creator }: CreatorProfileBarProps) {
  return (
    <Card
      aria-label="크리에이터 프로필"
      padding="md"
      className="flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <span
          className="inline-flex w-12 h-12 rounded-full items-center justify-center text-[22px] leading-none shrink-0 bg-warning/15"
          aria-hidden
        >
          {creator.emoji}
        </span>
        <div className="flex flex-col min-w-0 flex-1 sm:hidden">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium text-text-primary truncate">{creator.name}</h2>
            <Badge variant="neutral" size="xs">
              {creator.grade}티어
            </Badge>
            {creator.isVerified && (
              <BadgeCheck
                size={15}
                className="text-primary shrink-0"
                aria-label="인증 크리에이터"
              />
            )}
          </div>
          <span className="text-xs text-text-secondary">{creator.handle}</span>
        </div>
      </div>

      <div className="hidden sm:flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-text-primary truncate">{creator.name}</h2>
          <Badge variant="neutral" size="xs">
            {creator.grade}티어
          </Badge>
          {creator.isVerified && (
            <BadgeCheck
              size={15}
              className="text-primary shrink-0"
              aria-label="인증 크리에이터"
            />
          )}
        </div>
        <span className="text-xs text-text-secondary mb-2">{creator.handle}</span>
        <div className="flex items-center gap-3.5 text-xs flex-wrap">
          <MetaItem icon="📺" value={formatSubscribers(creator.subscribers)} label="구독자" />
          <MetaItem icon="👁" value={formatSubscribers(creator.avgViews)} label="평균 조회수" />
          <MetaItem icon="⭐" value={creator.rating.toFixed(1)} label="평점" />
          <MetaItem
            icon="🏆"
            value={creator.completedCampaigns.toString()}
            label="완료 캠페인"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs sm:hidden">
        <MetaItem icon="📺" value={formatSubscribers(creator.subscribers)} label="구독자" />
        <MetaItem icon="👁" value={formatSubscribers(creator.avgViews)} label="평균 조회수" />
        <MetaItem icon="⭐" value={creator.rating.toFixed(1)} label="평점" />
        <MetaItem
          icon="🏆"
          value={creator.completedCampaigns.toString()}
          label="완료 캠페인"
        />
      </div>
    </Card>
  );
}
