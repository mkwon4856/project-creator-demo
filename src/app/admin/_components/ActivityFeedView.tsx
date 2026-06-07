'use client';

import {
  AlertTriangle,
  Check,
  Coins,
  Upload,
  UserPlus,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge, statusToBadgeVariant } from '@/components/ui';

import type { FeedEvent, FeedType } from './activityFeedTypes';
import { Panel } from './Panel';

const FEED_STATUS: Record<FeedType, string> = {
  payment: 'completed',
  deposit: 'completed',
  creator: 'active',
  content: 'processing',
  flag: 'rejected',
};

const TYPE_ICON: Record<FeedType, ReactNode> = {
  payment: <Check size={13} aria-hidden />,
  creator: <UserPlus size={13} aria-hidden />,
  content: <Upload size={13} aria-hidden />,
  flag: <AlertTriangle size={13} aria-hidden />,
  deposit: <Coins size={13} aria-hidden />,
};

const Em = ({ children }: { children: ReactNode }) => (
  <span className="font-medium text-text-primary">{children}</span>
);

function renderMessage(parts: FeedEvent['parts']) {
  return parts.map((part, i) =>
    part.em ? <Em key={i}>{part.text}</Em> : <span key={i}>{part.text}</span>,
  );
}

export interface ActivityFeedViewProps {
  events: FeedEvent[];
}

export function ActivityFeedView({ events }: ActivityFeedViewProps) {
  return (
    <Panel title="최근 활동" ctaHref="/admin/events" cta="전체 이벤트">
      {events.length === 0 ? (
        <p className="text-xs text-text-secondary text-center py-6">아직 활동이 없습니다</p>
      ) : (
        <ul className="flex flex-col">
          {events.map((e, i) => (
            <li
              key={e.id}
              className={[
                'flex items-start gap-3 py-3',
                i === events.length - 1 ? '' : 'border-b border-border',
              ].join(' ')}
            >
              <Badge
                variant={statusToBadgeVariant(FEED_STATUS[e.type])}
                size="sm"
                className="w-7 h-7 p-0 items-center justify-center shrink-0"
                aria-hidden
              >
                {TYPE_ICON[e.type]}
              </Badge>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs leading-relaxed text-text-secondary">
                  {renderMessage(e.parts)}
                </span>
                <span className="text-[10px] text-text-muted mt-0.5">{e.timeAgo}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
