import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';
import type { Creator, CreatorChannel, ContentType, Grade, Platform } from '@/lib/db.types';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** 공개 프로필에 필요한 크리에이터 단건 필드 */
export type PublicCreatorProfile = {
  creator: Pick<Creator, 'id' | 'name' | 'avatar_url' | 'bio'>;
  channels: Pick<
    CreatorChannel,
    'id' | 'platform' | 'channel_name' | 'subscribers' | 'grade' | 'content_type' | 'thumbnail_url'
  >[];
  /** 이 크리에이터의 참여(지원) 캠페인 수. RLS로 가려지면 0. best-effort. */
  campaignCount: number;
};

/**
 * 공개 크리에이터 프로필을 조회한다 (요청당 React cache로 dedupe).
 *
 * RLS: creators 는 "Anyone can read creators"(anon 포함) 로 열려 있고,
 * creator_channels 는 anon select 정책(20260611000007 마이그레이션)으로 공개 열람 가능.
 * 따라서 로그인 없이도 보이기 전용 시드 크리에이터를 열람할 수 있다.
 *
 * 못 찾으면 null 을 반환한다 (호출부에서 notFound()).
 */
export const fetchPublicCreator = cache(
  async (id: string): Promise<PublicCreatorProfile | null> => {
    if (!HAS_SUPABASE_ENV) return null;

    const supabase = await createClient();

    const { data: creator, error } = await supabase
      .from('creators')
      .select('id, name, avatar_url, bio')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('fetchPublicCreator:', error);
      return null;
    }
    if (!creator) return null;

    const { data: channels, error: chError } = await supabase
      .from('creator_channels')
      .select('id, platform, channel_name, subscribers, grade, content_type, thumbnail_url')
      .eq('creator_id', id)
      .order('subscribers', { ascending: false });

    if (chError) {
      console.error('fetchPublicCreator (channels):', chError);
    }

    // 참여 캠페인 수는 best-effort: RLS 로 anon/타인에게 가려지면 0 으로 표시된다.
    const { count } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', id);

    return {
      creator: creator as PublicCreatorProfile['creator'],
      channels: (channels ?? []) as PublicCreatorProfile['channels'],
      campaignCount: count ?? 0,
    };
  },
);

// ─── 랜딩 쇼케이스용 크리에이터 목록 ───────────────────────────────
export type ShowcaseCreator = {
  id: string;
  name: string;
  avatar_url: string | null;
  topChannel: {
    platform: Platform;
    subscribers: number;
    grade: Grade;
    content_type: ContentType;
  };
  platforms: Platform[];
};

type ShowcaseChannelRow = Pick<
  CreatorChannel,
  'creator_id' | 'platform' | 'subscribers' | 'grade' | 'content_type'
>;

/**
 * 랜딩 신뢰 요소용: 채널을 보유한 크리에이터를 대표 채널 구독자 기준 상위 N명 반환.
 * studio 대시보드 쇼케이스와 동일 집계 로직을 서버에서 수행한다.
 * RLS: creators(anon 공개) + creator_channels(anon 공개)라 비로그인도 조회 가능.
 */
export const fetchShowcaseCreators = cache(
  async (limit = 12): Promise<{ creators: ShowcaseCreator[]; total: number }> => {
    if (!HAS_SUPABASE_ENV) return { creators: [], total: 0 };

    const supabase = await createClient();

    const [{ count }, { data: creatorRows }, { data: channelRows }] = await Promise.all([
      supabase.from('creators').select('id', { count: 'exact', head: true }),
      supabase.from('creators').select('id, name, avatar_url'),
      supabase
        .from('creator_channels')
        .select('creator_id, platform, subscribers, grade, content_type'),
    ]);

    const channelsByCreator = new Map<string, ShowcaseChannelRow[]>();
    for (const ch of (channelRows ?? []) as ShowcaseChannelRow[]) {
      const arr = channelsByCreator.get(ch.creator_id) ?? [];
      arr.push(ch);
      channelsByCreator.set(ch.creator_id, arr);
    }

    const creators = ((creatorRows ?? []) as Pick<Creator, 'id' | 'name' | 'avatar_url'>[])
      .map((cr): ShowcaseCreator | null => {
        const chs = (channelsByCreator.get(cr.id) ?? [])
          .slice()
          .sort((a, b) => b.subscribers - a.subscribers);
        if (chs.length === 0) return null;
        const platforms = [...new Set(chs.map((c) => c.platform))] as Platform[];
        return {
          id: cr.id,
          name: cr.name,
          avatar_url: cr.avatar_url,
          topChannel: {
            platform: chs[0].platform,
            subscribers: chs[0].subscribers,
            grade: chs[0].grade,
            content_type: chs[0].content_type,
          },
          platforms,
        };
      })
      .filter((c): c is ShowcaseCreator => c !== null)
      .sort((a, b) => b.topChannel.subscribers - a.topChannel.subscribers)
      .slice(0, limit);

    return { creators, total: count ?? 0 };
  },
);

// ─── 게임사 크리에이터 둘러보기용 전체 목록 ───────────────────────
export type BrowseChannel = {
  platform: Platform;
  subscribers: number;
  grade: Grade;
  content_type: ContentType;
};

export type BrowseCreator = {
  id: string;
  name: string;
  avatar_url: string | null;
  channels: BrowseChannel[]; // 구독자 내림차순
  topChannel: BrowseChannel; // 대표(최다 구독) 채널
  platforms: Platform[]; // 보유 플랫폼 전체
  contentTypes: ContentType[]; // 가능한 콘텐츠 타입 전체
  totalSubscribers: number;
};

/**
 * 게임사 둘러보기용: 채널을 보유한 모든 크리에이터 + 채널 목록을 카드 표시용으로 가공.
 * 대표 구독자수(최다 구독 채널) 내림차순 정렬. 필터링은 호출부(클라)에서 채널 단위로 수행.
 * RLS: creators(공개) + creator_channels(authenticated/anon)라 로그인 게임사가 조회 가능.
 */
export const fetchAllCreators = cache(
  async (): Promise<{ creators: BrowseCreator[]; total: number }> => {
    if (!HAS_SUPABASE_ENV) return { creators: [], total: 0 };

    const supabase = await createClient();

    const [{ count }, { data: creatorRows }, { data: channelRows }] = await Promise.all([
      supabase.from('creators').select('id', { count: 'exact', head: true }),
      supabase.from('creators').select('id, name, avatar_url'),
      supabase
        .from('creator_channels')
        .select('creator_id, platform, subscribers, grade, content_type'),
    ]);

    const channelsByCreator = new Map<string, ShowcaseChannelRow[]>();
    for (const ch of (channelRows ?? []) as ShowcaseChannelRow[]) {
      const arr = channelsByCreator.get(ch.creator_id) ?? [];
      arr.push(ch);
      channelsByCreator.set(ch.creator_id, arr);
    }

    const creators = ((creatorRows ?? []) as Pick<Creator, 'id' | 'name' | 'avatar_url'>[])
      .map((cr): BrowseCreator | null => {
        const chs = (channelsByCreator.get(cr.id) ?? [])
          .slice()
          .sort((a, b) => b.subscribers - a.subscribers)
          .map((c) => ({
            platform: c.platform,
            subscribers: c.subscribers,
            grade: c.grade,
            content_type: c.content_type,
          }));
        if (chs.length === 0) return null;
        return {
          id: cr.id,
          name: cr.name,
          avatar_url: cr.avatar_url,
          channels: chs,
          topChannel: chs[0],
          platforms: [...new Set(chs.map((c) => c.platform))] as Platform[],
          contentTypes: [...new Set(chs.map((c) => c.content_type))] as ContentType[],
          totalSubscribers: chs.reduce((sum, c) => sum + c.subscribers, 0),
        };
      })
      .filter((c): c is BrowseCreator => c !== null)
      .sort((a, b) => b.topChannel.subscribers - a.topChannel.subscribers);

    return { creators, total: count ?? 0 };
  },
);
