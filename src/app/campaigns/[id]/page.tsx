import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { fetchPublicCampaign } from '@/lib/api/campaigns.server';
import { createClient } from '@/lib/supabase/server';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, truncateText } from '@/lib/siteConfig';
import type { ContentType, Grade, Role } from '@/lib/db.types';

// 보는 사람의 역할을 서버에서 판별 (로고/목록 링크/CTA 분기에 사용)
async function getViewerRole(): Promise<Role | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    return (data?.role as Role | undefined) ?? null;
  } catch {
    return null;
  }
}

const HOME_HREF: Record<Role, string> = {
  studio: '/studio',
  creator: '/creator',
  admin: '/admin',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const campaign = await fetchPublicCampaign(id);

  if (!campaign) {
    return {
      title: '캠페인을 찾을 수 없습니다',
      description: SITE_DESCRIPTION,
    };
  }

  const description =
    truncateText(campaign.description ?? '', 100) ||
    `${campaign.game_name} · ${campaign.genre ?? '게임'} 캠페인 — ${SITE_NAME}`;

  return {
    title: campaign.title,
    description,
    openGraph: {
      title: campaign.title,
      description,
      type: 'website',
      url: `${SITE_URL}/campaigns/${id}`,
    },
  };
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [campaign, role] = await Promise.all([fetchPublicCampaign(id), getViewerRole()]);

  if (!campaign) notFound();

  const missions = campaign.missions ?? [];
  const allGrades = [
    ...new Set(missions.flatMap((m) => m.allowed_grades)),
  ] as Grade[];

  // 로고는 역할 홈(로그인) 또는 랜딩(비로그인)으로
  const homeHref = role ? HOME_HREF[role] : '/';
  // 막다른 페이지 방지용 "나가기" 링크 (역할별 목록)
  const exit =
    role === 'studio'
      ? { href: '/studio/campaigns', label: '← 캠페인 둘러보기' }
      : role === 'creator'
        ? { href: '/creator', label: '← 캠페인 탐색' }
        : role === 'admin'
          ? { href: '/admin/campaigns', label: '← 캠페인 관리' }
          : { href: '/', label: '← 홈으로' };
  // 게임사/관리자에게는 "크리에이터로 참여" CTA를 노출하지 않음
  const showApplyCta = role !== 'studio' && role !== 'admin';

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      {/* 상단 바: 나가기 + 로고 (막다른 페이지 방지) */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center justify-between">
          <Link href={exit.href} className="text-sm text-white/50 hover:text-white transition-colors">
            {exit.label}
          </Link>
          <Link
            href={homeHref}
            className="text-sm font-black text-white whitespace-nowrap hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'Arial Black' }}
          >
            Project Creator
          </Link>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* 헤더 */}
        <div className="flex gap-4 items-start">
          {campaign.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={campaign.thumbnail_url}
              alt=""
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[#9B7EC8]/20 flex items-center justify-center text-2xl flex-shrink-0">
              🎮
            </div>
          )}
          <div className="min-w-0">
            <h1
              className="text-2xl font-black text-white leading-tight"
              style={{ fontFamily: 'Arial Black' }}
            >
              {campaign.title}
            </h1>
            <p className="text-sm text-white/40 mt-1">
              {campaign.game_name}
              {campaign.genre ? ` · ${campaign.genre}` : ''}
            </p>
          </div>
        </div>

        {/* 설명 */}
        {campaign.description && (
          <div className="bg-white/5 rounded-xl p-5 border border-white/5">
            <p className="text-sm text-white/70 whitespace-pre-line leading-relaxed">
              {campaign.description}
            </p>
          </div>
        )}

        {/* 모집 콘텐츠 유형 */}
        <div>
          <div className="text-sm font-medium text-white mb-3">모집 콘텐츠</div>
          {missions.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-6 text-center border border-dashed border-white/10">
              <p className="text-white/30 text-sm">등록된 미션이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {missions.map((m) => (
                <div
                  key={m.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center"
                >
                  <div>
                    <span className="text-sm font-medium text-[#9B7EC8]">
                      {CONTENT_TYPE_LABELS[m.content_type]}
                    </span>
                    <div className="text-xs text-white/40 mt-1">
                      참여 가능 등급: {m.allowed_grades.join(' / ')}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      m.status === 'open'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {m.status === 'open' ? '모집 중' : m.status === 'filled' ? '모집 완료' : '종료'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {allGrades.length > 0 && (
          <p className="text-xs text-white/30">
            전체 참여 가능 등급: {allGrades.sort().join(' / ')}
          </p>
        )}

        {/* CTA — 게임사/관리자에겐 참여 CTA 대신 목록 이동 */}
        {showApplyCta ? (
          <div className="bg-[#9B7EC8]/10 border border-[#9B7EC8]/20 rounded-xl p-5 text-center">
            <p className="text-sm text-white/70">
              이 캠페인에 참여하고 싶으신가요?
            </p>
            <Link
              href="/creator"
              className="inline-block mt-3 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: '#9B7EC8' }}
            >
              크리에이터로 참여하기 →
            </Link>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
            <p className="text-sm text-white/50">다른 게임사들의 캠페인 운영 현황을 둘러보세요</p>
            <Link
              href={exit.href}
              className="inline-block mt-3 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: '#9B7EC8' }}
            >
              캠페인 둘러보기 →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
