import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';
import type { Creator, CreatorChannel } from '@/lib/db.types';

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
