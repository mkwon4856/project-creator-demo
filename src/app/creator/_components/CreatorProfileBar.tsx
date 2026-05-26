'use client';

import { BadgeCheck } from 'lucide-react';

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
    <section
      aria-label="Creator profile"
      className="flex items-center gap-4 p-5 rounded-lg bg-bg-card border border-white/[0.06] mb-6"
    >
      <span
        className="inline-flex w-12 h-12 rounded-full items-center justify-center text-[22px] leading-none shrink-0"
        style={{ background: 'rgba(251, 191, 36, 0.15)' }}
        aria-hidden
      >
        {creator.emoji}
      </span>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-text-primary truncate">{creator.name}</h2>
          <span className="bg-bg-hover text-text-secondary px-1.5 py-0.5 text-[10px] rounded font-medium leading-none">
            {creator.grade}-tier
          </span>
          {creator.isVerified && (
            <BadgeCheck
              size={15}
              className="text-ube-bright shrink-0"
              aria-label="인증 크리에이터"
            />
          )}
        </div>
        <span className="text-xs text-text-secondary mb-2">{creator.handle}</span>
        <div className="flex items-center gap-3.5 text-xs flex-wrap">
          <MetaItem icon="📺" value={formatSubscribers(creator.subscribers)} label="subs" />
          <MetaItem icon="👁" value={formatSubscribers(creator.avgViews)} label="avg views" />
          <MetaItem icon="⭐" value={creator.rating.toFixed(1)} label="rating" />
          <MetaItem
            icon="🏆"
            value={creator.completedCampaigns.toString()}
            label="campaigns done"
          />
        </div>
      </div>
    </section>
  );
}
