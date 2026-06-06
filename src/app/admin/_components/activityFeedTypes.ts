export type FeedType = 'payment' | 'creator' | 'flag' | 'content' | 'deposit';

export interface FeedEventPart {
  text: string;
  em?: boolean;
}

export interface FeedEvent {
  id: string;
  type: FeedType;
  timeAgo: string;
  parts: FeedEventPart[];
}

export interface FeedEventDraft {
  id: string;
  type: FeedType;
  at: Date;
  parts: FeedEventPart[];
}
