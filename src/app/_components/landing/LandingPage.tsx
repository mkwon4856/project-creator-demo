'use client';

import {
  BadgeCheck,
  Coins,
  Compass,
  Megaphone,
  Receipt,
  TrendingUp,
  Video,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';

import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { RATE_MATRIX } from '@/lib/pricing';
import { SITE_NAME, CONTACT_EMAIL } from '@/lib/siteConfig';
import type { ContentType, Grade, Platform } from '@/lib/db.types';
import type { ShowcaseCreator } from '@/lib/api/creators.server';
import type { PublicCampaignWithStats } from '@/lib/api/campaigns.server';

interface LandingPageProps {
  creators: ShowcaseCreator[];
  creatorTotal: number;
  campaigns: PublicCampaignWithStats[];
  campaignTotal: number;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  live: '라이브',
  longform: '롱폼',
  shortform: '숏폼',
};

const GRADE_COLORS: Record<Grade, string> = {
  S: 'text-yellow-400',
  A: 'text-orange-400',
  B: 'text-[#9B7EC8]',
  C: 'text-blue-400',
  D: 'text-green-400',
  E: 'text-white/50',
};

const AVATAR_BG = ['#6D4FA0', '#A0524F', '#4F73A0', '#4FA08A', '#A0904F', '#8A4FA0'];
function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_BG[Math.abs(h) % AVATAR_BG.length];
}

function gameGradient(seed: string): string {
  const g = [
    'from-purple-900 via-[#0A0A0F] to-indigo-900',
    'from-rose-900 via-[#0A0A0F] to-purple-900',
    'from-blue-900 via-[#0A0A0F] to-cyan-900',
    'from-amber-900 via-[#0A0A0F] to-orange-900',
    'from-emerald-900 via-[#0A0A0F] to-teal-900',
    'from-fuchsia-900 via-[#0A0A0F] to-purple-900',
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return g[Math.abs(h) % g.length];
}

// 원 → "○○만" 표기 (단가 미리보기용)
function won(amount: number): string {
  return `${(amount / 10000).toLocaleString()}만`;
}

// 원 → "N만원" / "N,NNN만원" (캠페인 최대 지급액 표기)
function formatManwon(amount: number): string {
  return `${Math.round(amount / 10000).toLocaleString()}만원`;
}

// 마감까지 남은 일수 (D-day). deadline 없으면 null.
function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${deadline}T00:00:00`);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

function formatDeadline(deadline: string): string {
  const d = new Date(`${deadline}T00:00:00`);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 미션 타입 뱃지 색 (라이브=보라 / 롱폼=골드 / 숏폼=#7c3aed)
const MISSION_BADGE: Record<ContentType, { label: string; style: CSSProperties }> = {
  live: { label: '라이브', style: { background: '#9B7EC8', color: '#fff' } },
  longform: { label: '롱폼', style: { background: '#E5B567', color: '#0A0A0F' } },
  shortform: { label: '숏폼', style: { background: '#7c3aed', color: '#fff' } },
};

// ─── 네비게이션 ──────────────────────────────────────────────────
function NavBar() {
  const router = useRouter();
  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-black text-white whitespace-nowrap hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'Arial Black' }}
        >
          Project Creator
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push('/login')}
            className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white transition-colors"
          >
            로그인
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="px-4 py-1.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: '#9B7EC8' }}
          >
            시작하기
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── 히어로 ──────────────────────────────────────────────────────
function HeroSection() {
  const router = useRouter();
  return (
    <section
      className="relative overflow-hidden border-b border-white/10"
      style={{
        background:
          'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(155,126,200,0.18), transparent 70%)',
      }}
    >
      {/* 미묘한 그리드 */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center flex flex-col items-center">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#9B7EC8]/15 text-[#9B7EC8] border border-[#9B7EC8]/30 mb-6">
          게임사 × 크리에이터 마케팅 플랫폼
        </span>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.15] max-w-3xl"
          style={{ fontFamily: 'Arial Black' }}
        >
          게임 마케팅,
          <br />
          <span className="text-[#9B7EC8]">크리에이터</span>와 성과로 연결하다
        </h1>
        <p className="text-base sm:text-lg text-white/60 mt-6 max-w-xl leading-relaxed">
          게임사와 크리에이터를 잇는 성과 기반 마케팅 플랫폼. 캠페인 등록부터 콘텐츠 검수,
          정산까지 한 곳에서.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-9 w-full sm:w-auto">
          <button
            onClick={() => router.push('/signup')}
            className="px-7 py-3 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: '#9B7EC8' }}
          >
            게임사로 시작하기
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="px-7 py-3 rounded-xl font-bold text-white text-base bg-white/5 border border-white/15 transition-all hover:bg-white/10 hover:-translate-y-0.5"
          >
            크리에이터로 참여하기
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── 크리에이터 쇼케이스 ─────────────────────────────────────────
function ShowcaseSection({ creators, total }: { creators: ShowcaseCreator[]; total: number }) {
  if (creators.length === 0) return null;
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
            이미 다양한 크리에이터가 함께합니다
          </h2>
          <p className="text-sm text-white/50 mt-1.5">
            YouTube · 치지직 · SOOP · TikTok에서 활동 중인 검증된 크리에이터
          </p>
        </div>
        {total > 0 && (
          <div className="text-right shrink-0">
            <div className="text-3xl font-black text-[#E5B567]" style={{ fontFamily: 'Arial Black' }}>
              총 {total}명+
            </div>
            <div className="text-xs text-white/30 mt-0.5">활동 크리에이터</div>
          </div>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
        {creators.map((cr) => (
          <Link
            key={cr.id}
            href={`/creators/${cr.id}`}
            className="shrink-0 w-44 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center cursor-pointer transition-all hover:-translate-y-1 hover:border-[#9B7EC8]/40"
          >
            <div
              className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mb-3"
              style={{ background: avatarColor(cr.name) }}
            >
              {cr.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cr.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-white/80" style={{ fontFamily: 'Arial Black' }}>
                  {cr.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="font-bold text-white text-sm truncate w-full">{cr.name}</div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-white/50">
              <PlatformIcon platform={cr.topChannel.platform} size={16} />
              <span>{cr.topChannel.subscribers.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-xs font-bold ${GRADE_COLORS[cr.topChannel.grade]}`}>
                {cr.topChannel.grade}등급
              </span>
              <span className="text-xs text-white/30">
                {CONTENT_TYPE_LABELS[cr.topChannel.content_type]}
              </span>
            </div>
            {cr.platforms.length > 1 && (
              <div className="flex gap-1 mt-2.5 pt-2.5 border-t border-white/10 w-full justify-center">
                {cr.platforms.map((p: Platform) => (
                  <PlatformIcon key={p} platform={p} size={16} />
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── 진행 중인 캠페인 (간소화 카드) ──────────────────────────────
function CampaignCard({ campaign }: { campaign: PublicCampaignWithStats }) {
  const missions = campaign.missions ?? [];
  // 모집 미션 타입 (중복 제거, 표시는 라이브→롱폼→숏폼 순)
  const ORDER: ContentType[] = ['live', 'longform', 'shortform'];
  const types = ORDER.filter((t) => missions.some((m) => m.content_type === t));
  // 최대 지급액 = missions creator_amount 최댓값
  const maxAmount = missions.reduce((max, m) => Math.max(max, m.creator_amount ?? 0), 0);
  const dday = daysUntil(campaign.deadline);
  const urgent = dday !== null && dday <= 3;
  const participants = campaign.applications?.[0]?.count ?? 0;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group flex flex-col rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all hover:-translate-y-1 hover:border-[#9B7EC8]/40"
    >
      {/* 썸네일 */}
      <div className="relative h-[150px] overflow-hidden">
        {campaign.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={campaign.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gameGradient(campaign.game_name)} flex items-center justify-center`}
          >
            <span className="text-5xl font-black text-white/15" style={{ fontFamily: 'Arial Black' }}>
              {campaign.game_name.charAt(0)}
            </span>
          </div>
        )}
        {campaign.genre && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[11px] font-medium text-white/90">
            {campaign.genre}
          </span>
        )}
        {dday !== null && (
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${
              urgent ? 'bg-red-500 text-white' : 'bg-black/50 backdrop-blur-sm text-white/80'
            }`}
          >
            {dday < 0 ? '마감' : dday === 0 ? 'D-DAY' : `D-${dday}`}
          </span>
        )}
      </div>

      {/* 본문 */}
      <div className="flex flex-col flex-1 p-4">
        <div className="font-black text-white truncate" style={{ fontFamily: 'Arial Black' }}>
          {campaign.game_name}
        </div>

        {/* 모집 미션 + 최대 지급 */}
        <div className="flex items-end justify-between gap-3 mt-3">
          <div className="min-w-0">
            <div className="text-[11px] text-white/30 mb-1.5">모집 미션</div>
            <div className="flex flex-wrap gap-1.5">
              {types.length > 0 ? (
                types.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={MISSION_BADGE[t].style}
                  >
                    {MISSION_BADGE[t].label}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-white/30">미션 준비 중</span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] text-white/30 mb-0.5">최대 지급</div>
            <div className="text-lg font-black text-[#E5B567]" style={{ fontFamily: 'Arial Black' }}>
              {maxAmount > 0 ? `최대 ${formatManwon(maxAmount)}` : '—'}
            </div>
          </div>
        </div>

        {/* 하단 메타 */}
        <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-start text-[11px]">
          <div>
            <div className="text-white/30">모집 마감</div>
            <div className="text-white/70 font-medium mt-0.5">
              {campaign.deadline ? (
                <>
                  {formatDeadline(campaign.deadline)}
                  {dday !== null && dday >= 0 && (
                    <span className={urgent ? 'text-red-400' : 'text-white/40'}> · D-{dday}</span>
                  )}
                </>
              ) : (
                '상시 모집'
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/30">참여 현황</div>
            <div className="text-white/70 font-medium mt-0.5">{participants}명 참여 중</div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-3 text-center py-2.5 rounded-xl font-bold text-white text-sm transition-all group-hover:opacity-90"
          style={{ background: '#9B7EC8' }}
        >
          지원하러 가기
        </div>
      </div>
    </Link>
  );
}

function ActiveCampaignsSection({ campaigns }: { campaigns: PublicCampaignWithStats[] }) {
  const router = useRouter();
  // 마감 임박순으로 이미 정렬되어 옴 → 상위 3개
  const top = campaigns.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
            지금 진행 중인 캠페인
          </h2>
          <p className="text-sm text-white/50 mt-1.5">
            어떤 게임이 열려 있고 최대 얼마를 받는지 바로 확인하세요
          </p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="text-sm text-[#9B7EC8] hover:text-white transition-colors shrink-0"
        >
          전체 보기 →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {top.map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
      </div>
    </section>
  );
}

// ─── 작동 방식 ───────────────────────────────────────────────────
function FlowColumn({
  title,
  icon: Icon,
  steps,
  accent,
}: {
  title: string;
  icon: LucideIcon;
  steps: string[];
  accent: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <span
          className="inline-flex w-10 h-10 rounded-lg items-center justify-center"
          style={{ background: `${accent}26` }}
        >
          <Icon size={20} style={{ color: accent }} aria-hidden />
        </span>
        <h3 className="text-base font-bold text-white">{title}</h3>
      </div>
      <ol className="space-y-3">
        {steps.map((label, i) => (
          <li key={label} className="flex items-center gap-3">
            <span
              className="inline-flex w-7 h-7 shrink-0 rounded-full items-center justify-center text-xs font-bold tabular-nums"
              style={{ background: `${accent}26`, color: accent }}
            >
              {i + 1}
            </span>
            <span className="text-sm text-white/70">{label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold text-[#9B7EC8] uppercase tracking-widest">
            이용 방법
          </span>
          <h2
            className="text-2xl font-black text-white mt-2"
            style={{ fontFamily: 'Arial Black' }}
          >
            처음부터 정산까지, 한 곳에서
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FlowColumn
            title="게임사"
            icon={Megaphone}
            accent="#9B7EC8"
            steps={['캠페인 생성', '크리에이터 참여', '콘텐츠 검수', '성과 확인']}
          />
          <FlowColumn
            title="크리에이터"
            icon={Video}
            accent="#E5B567"
            steps={['캠페인 탐색', '캠페인 지원', '콘텐츠 제작·제출', '정산·출금']}
          />
        </div>
      </div>
    </section>
  );
}

// ─── 가치 카드 ───────────────────────────────────────────────────
function ValueCard({
  icon: Icon,
  title,
  desc,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 transition-colors hover:border-white/20">
      <span
        className="inline-flex w-10 h-10 rounded-lg items-center justify-center mb-4"
        style={{ background: `${accent}26` }}
      >
        <Icon size={20} style={{ color: accent }} aria-hidden />
      </span>
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-sm text-white/50 mt-1.5 leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── 게임사 섹션 ─────────────────────────────────────────────────
function StudioSection() {
  const router = useRouter();
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
        당신의 게임을 알릴 준비가 됐나요?
      </h2>
      <p className="text-sm text-white/50 mt-1.5 max-w-xl">
        검증된 크리에이터 풀과 성과 기반 과금으로, 마케팅 예산을 효율적으로 집행하세요.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <ValueCard
          icon={TrendingUp}
          accent="#9B7EC8"
          title="성과 기반 과금"
          desc="실제 제작·검수된 콘텐츠 기준으로 예산이 집행됩니다."
        />
        <ValueCard
          icon={BadgeCheck}
          accent="#9B7EC8"
          title="검증된 크리에이터 풀"
          desc="플랫폼·구독자 기반으로 등급이 매겨진 크리에이터를 만나보세요."
        />
        <ValueCard
          icon={Zap}
          accent="#9B7EC8"
          title="운영 자동화"
          desc="캠페인 모집·매칭·검수·정산까지 한 흐름으로 처리됩니다."
        />
      </div>

      <div className="mt-8">
        <button
          onClick={() => router.push('/signup')}
          className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
          style={{ background: '#9B7EC8' }}
        >
          게임사로 시작하기 →
        </button>
      </div>
    </section>
  );
}

// ─── 크리에이터 섹션 ─────────────────────────────────────────────
function CreatorSection() {
  const router = useRouter();
  const previewGrades: Grade[] = ['S', 'A', 'B', 'C'];
  const cols: ContentType[] = ['live', 'longform', 'shortform'];

  return (
    <section className="border-y border-white/10 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black' }}>
          당신의 영향력을 수익으로
        </h2>
        <p className="text-sm text-white/50 mt-1.5 max-w-xl">
          원하는 캠페인을 직접 골라 참여하고, 등급별 공정 단가로 투명하게 정산받으세요.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <ValueCard
            icon={Coins}
            accent="#E5B567"
            title="등급별 공정 단가"
            desc="플랫폼·구독자 기반 등급에 따라 단가가 명확하게 책정됩니다."
          />
          <ValueCard
            icon={Compass}
            accent="#E5B567"
            title="자유로운 캠페인 선택"
            desc="내 등급에 맞는 캠페인을 직접 탐색하고 지원할 수 있어요."
          />
          <ValueCard
            icon={Receipt}
            accent="#E5B567"
            title="투명한 정산"
            desc="검수 통과분이 적립되고, 원할 때 출금을 신청할 수 있습니다."
          />
        </div>

        {/* 등급별 단가 예시 */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-5 overflow-x-auto">
          <h3 className="text-sm font-medium text-white/50 mb-4">등급별 단가 예시 (크리에이터 수령액)</h3>
          <table className="w-full text-sm min-w-[360px]">
            <thead>
              <tr className="text-white/40 text-xs">
                <th className="text-left font-medium pb-3">등급</th>
                {cols.map((ct) => (
                  <th key={ct} className="text-right font-medium pb-3">
                    {CONTENT_TYPE_LABELS[ct]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewGrades.map((g) => (
                <tr key={g} className="border-t border-white/5">
                  <td className="py-2.5">
                    <span className={`font-bold ${GRADE_COLORS[g]}`}>{g}등급</span>
                  </td>
                  {cols.map((ct) => (
                    <td key={ct} className="py-2.5 text-right text-white/70 tabular-nums">
                      ₩{won(RATE_MATRIX[g][ct])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-white/30 mt-3">
            * 구독자 수에 따라 등급이 자동 산정됩니다. D·E 등급도 참여 가능합니다.
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push('/signup')}
            className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 bg-white/10 border border-white/15 hover:bg-white/15"
          >
            크리에이터로 참여하기 →
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── 신뢰 지표 ───────────────────────────────────────────────────
function TrustStats({
  creatorTotal,
  campaignTotal,
}: {
  creatorTotal: number;
  campaignTotal: number;
}) {
  const stats = [
    { label: '활동 크리에이터', value: creatorTotal, unit: '명' },
    { label: '진행 중 캠페인', value: campaignTotal, unit: '개' },
    { label: '연결 플랫폼', value: 4, unit: '개' },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
          >
            <div className="text-4xl font-black text-[#E5B567]" style={{ fontFamily: 'Arial Black' }}>
              {s.value.toLocaleString()}
              <span className="text-xl text-white/40 ml-1">{s.unit}</span>
            </div>
            <div className="text-sm text-white/40 mt-2">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 푸터 ────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <div className="text-base font-black text-white" style={{ fontFamily: 'Arial Black' }}>
              Project Creator
            </div>
            <p className="text-sm text-white/40 mt-1.5 max-w-xs">
              게임사와 크리에이터를 연결하는 성과 기반 마케팅 플랫폼.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-white/50">
            <Link href="/login" className="hover:text-white transition-colors">
              로그인
            </Link>
            <Link href="/signup" className="hover:text-white transition-colors">
              회원가입
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              개인정보처리방침
            </Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-2 mt-8 pt-6 border-t border-white/5 text-xs text-white/30">
          <span>
            (주)더플레이 ·{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white/60 transition-colors">
              {CONTACT_EMAIL}
            </a>
          </span>
          <span>© 2026 {SITE_NAME}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage({
  creators,
  creatorTotal,
  campaigns,
  campaignTotal,
}: LandingPageProps) {
  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white">
      <NavBar />
      <HeroSection />
      <ShowcaseSection creators={creators} total={creatorTotal} />
      <ActiveCampaignsSection campaigns={campaigns} />
      <HowItWorksSection />
      <StudioSection />
      <CreatorSection />
      <TrustStats creatorTotal={creatorTotal} campaignTotal={campaignTotal} />
      <Footer />
    </main>
  );
}
