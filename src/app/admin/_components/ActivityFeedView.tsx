'use client';

import {
  AlertTriangle,
  Check,
  Coins,
  Upload,
  UserPlus,
} from 'lucide-react';
import type { ReactNode } from 'react';

import type { FeedEvent, FeedType } from './activityFeedTypes';
import { Panel } from './Panel';

const TYPE_STYLE: Record<FeedType, { bg: string; text: string; icon: ReactNode }> = {
  payment: {
    bg: 'bg-green-500/15',
    text: 'text-green-400',
    icon: <Check size={13} aria-hidden />,
  },
  creator: {
    bg: 'bg-ube/15',
    text: 'text-ube-bright',
    icon: <UserPlus size={13} aria-hidden />,
  },
  content: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    icon: <Upload size={13} aria-hidden />,
  },
  flag: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    icon: <AlertTriangle size={13} aria-hidden />,
  },
  deposit: {
    bg: 'bg-green-500/15',
    text: 'text-green-400',
    icon: <Coins size={13} aria-hidden />,
  },
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
          {events.map((e, i) => {
            const style = TYPE_STYLE[e.type];
            return (
              <li
                key={e.id}
                className={[
                  'flex items-start gap-3 py-3',
                  i === events.length - 1 ? '' : 'border-b border-white/[0.06]',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-flex w-7 h-7 rounded-full items-center justify-center shrink-0',
                    style.bg,
                    style.text,
                  ].join(' ')}
                  aria-hidden
                >
                  {style.icon}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs leading-relaxed text-text-secondary">
                    {renderMessage(e.parts)}
                  </span>
                  <span className="text-[10px] text-text-muted mt-0.5">{e.timeAgo}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
