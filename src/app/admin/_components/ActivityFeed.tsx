'use client';

import {
  AlertTriangle,
  Check,
  Coins,
  Upload,
  UserPlus,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Panel } from './Panel';

type FeedType = 'payment' | 'creator' | 'flag' | 'content' | 'deposit';

interface FeedEvent {
  id: string;
  type: FeedType;
  message: ReactNode;
  timeAgo: string;
}

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

const EVENTS: FeedEvent[] = [
  {
    id: 'fe-1',
    type: 'payment',
    timeAgo: '12 min ago',
    message: (
      <>
        <Em>몽키매직</Em> received payout <Em>₩300K</Em> for 던전 베이커리
      </>
    ),
  },
  {
    id: 'fe-2',
    type: 'content',
    timeAgo: '38 min ago',
    message: (
      <>
        <Em>강퀴</Em> submitted content for 갓앤데몬
      </>
    ),
  },
  {
    id: 'fe-3',
    type: 'creator',
    timeAgo: '1h ago',
    message: (
      <>
        New creator <Em>야간작전</Em> verified — <Em>D-tier</Em>
      </>
    ),
  },
  {
    id: 'fe-4',
    type: 'deposit',
    timeAgo: '2h ago',
    message: (
      <>
        <Em>위메이드커넥트</Em> deposited <Em>₩4M</Em> for new campaign
      </>
    ),
  },
  {
    id: 'fe-5',
    type: 'flag',
    timeAgo: '3h ago',
    message: (
      <>
        Dispute opened on <Em>로드나인</Em> — needs review
      </>
    ),
  },
  {
    id: 'fe-6',
    type: 'content',
    timeAgo: '5h ago',
    message: (
      <>
        <Em>쫀쫀</Em> submitted live VOD for 운빨존많겜
      </>
    ),
  },
  {
    id: 'fe-7',
    type: 'creator',
    timeAgo: '8h ago',
    message: (
      <>
        New studio <Em>Pixel Forge</Em> joined the platform
      </>
    ),
  },
];

export function ActivityFeed() {
  return (
    <Panel title="Recent activity" ctaHref="/admin/events" cta="All events">
      <ul className="flex flex-col">
        {EVENTS.map((e, i) => {
          const style = TYPE_STYLE[e.type];
          return (
            <li
              key={e.id}
              className={[
                'flex items-start gap-3 py-3',
                i === EVENTS.length - 1 ? '' : 'border-b border-white/[0.06]',
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
                <span className="text-xs leading-relaxed text-text-secondary">{e.message}</span>
                <span className="text-[10px] text-text-muted mt-0.5">{e.timeAgo}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
