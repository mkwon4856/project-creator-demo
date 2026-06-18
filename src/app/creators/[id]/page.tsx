import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { fetchPublicCreator } from '@/lib/api/creators.server';
import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { SITE_NAME, SITE_URL, truncateText } from '@/lib/siteConfig';
import type { ContentType, Grade, Platform } from '@/lib/db.types';

import { BackBar } from './_components/BackBar';

interface PageProps {
  params: Promise<{ id: string }>;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
};

const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: 'YouTube',
  chzzk: '치지직',
  soop: 'SOOP',
  tiktok: 'TikTok',
};

// 등급 뱃지 색: S/A 골드 계열, B/C 우베, D/E 차분한 톤
const GRADE_BADGE: Record<Grade, string> = {
  S: 'bg-[#E5B567]/20 text-[#E5B567] border-[#E5B567]/40',
  A: 'bg-[#E5B567]/15 text-[#E5B567] border-[#E5B567]/30',
  B: 'bg-[#9B7EC8]/20 text-[#9B7EC8] border-[#9B7EC8]/40',
  C: 'bg-[#9B7EC8]/15 text-[#9B7EC8] border-[#9B7EC8]/30',
  D: 'bg-white/10 text-white/60 border-white/20',
  E: 'bg-white/5 text-white/40 border-white/10',
};

const AVATAR_BG = ['#6D4FA0', '#A0524F', '#4F73A0', '#4FA08A', '#A0904F', '#8A4FA0'];
function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_BG[Math.abs(h) % AVATAR_BG.length];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchPublicCreator(id);

  if (!profile) {
    return { title: '크리에이터를 찾을 수 없습니다' };
  }

  const { creator, channels } = profile;
  const platforms = [...new Set(channels.map((c) => PLATFORM_LABELS[c.platform]))].join(' · ');
  const description =
    truncateText(creator.bio ?? '', 100) ||
    (platforms
      ? `${creator.name} — ${platforms}에서 활동 중인 크리에이터 · ${SITE_NAME}`
      : `${creator.name} · ${SITE_NAME}`);

  return {
    title: `${creator.name} — 크리에이터`,
    description,
    openGraph: {
      title: `${creator.name} — 크리에이터`,
      description,
      type: 'profile',
      url: `${SITE_URL}/creators/${id}`,
      ...(creator.avatar_url ? { images: [creator.avatar_url] } : {}),
    },
  };
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const profile = await fetchPublicCreator(id);

  if (!profile) notFound();

  const { creator, channels, campaignCount } = profile;

  // 채널은 구독자 내림차순으로 이미 정렬됨 → [0] 이 대표 채널
  const topChannel = channels[0] ?? null;
  const totalSubscribers = channels.reduce((sum, c) => sum + c.subscribers, 0);

  // 활동 정보 집계
  const contentTypes = [...new Set(channels.map((c) => c.content_type))] as ContentType[];
  // 등급 분포 (높은 등급부터)
  const GRADE_ORDER: Grade[] = ['S', 'A', 'B', 'C', 'D', 'E'];
  const gradeCounts = GRADE_ORDER.map((g) => ({
    grade: g,
    count: channels.filter((c) => c.grade === g).length,
  })).filter((g) => g.count > 0);

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <BackBar />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* 1. 헤더 영역 */}
        <header className="flex flex-col sm:flex-row gap-5 sm:items-center">
          <div
            className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 mx-auto sm:mx-0"
            style={{ background: avatarColor(creator.name) }}
          >
            {creator.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-white/80" style={{ fontFamily: 'Arial Black' }}>
                {creator.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <h1
              className="text-3xl font-black text-white leading-tight"
              style={{ fontFamily: 'Arial Black' }}
            >
              {creator.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
              {topChannel && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${GRADE_BADGE[topChannel.grade]}`}
                >
                  대표 {topChannel.grade}등급
                </span>
              )}
              {totalSubscribers > 0 && (
                <span className="text-sm text-white/60">
                  총 구독자{' '}
                  <span className="text-white font-bold">{totalSubscribers.toLocaleString()}</span>
                </span>
              )}
            </div>
            {channels.length > 0 && (
              <div className="flex gap-1.5 mt-3 justify-center sm:justify-start">
                {[...new Set(channels.map((c) => c.platform))].map((p) => (
                  <PlatformIcon key={p} platform={p} size={18} />
                ))}
              </div>
            )}
          </div>
        </header>

        {/* bio (있으면) */}
        {creator.bio && (
          <p className="text-sm text-white/70 whitespace-pre-line leading-relaxed bg-white/5 rounded-xl p-5 border border-white/5">
            {creator.bio}
          </p>
        )}

        {/* 2. 보유 채널 */}
        <section>
          <h2 className="text-sm font-medium text-white/50 mb-3">보유 채널</h2>
          {channels.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-8 text-center border border-dashed border-white/10">
              <p className="text-white/30 text-sm">등록된 채널이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-3 transition-colors hover:border-[#9B7EC8]/30"
                >
                  {/* 썸네일 또는 플랫폼 아이콘 */}
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-white/5 shrink-0 flex items-center justify-center">
                    {ch.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ch.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <PlatformIcon platform={ch.platform} size={24} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-white truncate">{ch.channel_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-white/40">
                      <PlatformIcon platform={ch.platform} size={13} />
                      <span>{PLATFORM_LABELS[ch.platform]}</span>
                      <span className="text-white/20">·</span>
                      <span>{CONTENT_TYPE_LABELS[ch.content_type]}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${GRADE_BADGE[ch.grade]}`}
                    >
                      {ch.grade}
                    </span>
                    <div className="text-xs text-white/50 mt-1">
                      {ch.subscribers.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. 활동 정보 (채널이 있을 때만) */}
        {channels.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-white/50 mb-3">활동 정보</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 가능한 콘텐츠 타입 */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="text-xs text-white/40 mb-2">가능한 콘텐츠</div>
                <div className="flex flex-wrap gap-1.5">
                  {contentTypes.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-1 rounded-full bg-[#9B7EC8]/15 text-[#9B7EC8]"
                    >
                      {CONTENT_TYPE_LABELS[t]}
                    </span>
                  ))}
                </div>
              </div>

              {/* 등급 분포 */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="text-xs text-white/40 mb-2">등급 분포</div>
                <div className="flex flex-wrap gap-1.5">
                  {gradeCounts.map(({ grade, count }) => (
                    <span
                      key={grade}
                      className={`text-xs font-bold px-2 py-1 rounded-full border ${GRADE_BADGE[grade]}`}
                    >
                      {grade}
                      {count > 1 && <span className="font-normal opacity-70"> ×{count}</span>}
                    </span>
                  ))}
                </div>
              </div>

              {/* 참여 캠페인 수 (있으면) */}
              {campaignCount > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-white/40 mb-1">참여 캠페인</div>
                  <div className="text-xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
                    {campaignCount}개
                  </div>
                </div>
              )}

              {/* 채널 수 */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="text-xs text-white/40 mb-1">보유 채널</div>
                <div className="text-xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
                  {channels.length}개
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
