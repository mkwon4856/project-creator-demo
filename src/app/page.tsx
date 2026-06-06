'use client';

import {
  BarChart3,
  Check,
  Eye,
  Gamepad2,
  Globe,
  LayoutGrid,
  Play,
  PlaySquare,
  Users,
  UsersRound,
  Video,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { DemoBanner } from '@/components/layout';
import { Button } from '@/components/ui';

// ─────────────────────────────────────────────────────────────
// 1. Navigation
// ─────────────────────────────────────────────────────────────
function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const cls =
    size === 'sm'
      ? 'text-sm font-semibold tracking-tight'
      : 'text-base font-semibold tracking-tight';
  return (
    <Link href="/" className={`${cls} text-text-primary`}>
      Project <span className="text-ube-bright">Creator</span>
    </Link>
  );
}

function NavBar() {
  const router = useRouter();
  const navLinks: ReadonlyArray<{ label: string; href: string }> = [
    { label: '게임사', href: '#studios' },
    { label: '크리에이터', href: '#creators' },
    { label: '요금제', href: '#' },
  ];
  return (
    <nav className="flex items-center justify-between py-5">
      <Logo />
      <div className="hidden md:flex items-center gap-7">
        {navLinks.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 ease-out"
          >
            {l.label}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="md" onClick={() => router.push('/login')}>
          로그인
        </Button>
        <Button variant="primary" size="md" onClick={() => router.push('/signup')}>
          시작하기
        </Button>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Hero
// ─────────────────────────────────────────────────────────────
function HeroSection() {
  const router = useRouter();

  const scrollToHow = () => {
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="text-center py-20 max-w-[640px] mx-auto">
      <span className="inline-flex items-center gap-1.5 bg-bg-card border border-white/10 rounded-full px-4 py-1.5 text-xs text-text-secondary">
        <Globe size={14} className="text-ube-bright" aria-hidden />
        게임 크리에이터 마케팅, 전 세계로
      </span>

      <h1 className="text-4xl font-medium tracking-tight leading-[1.2] mt-5">
        내 게임을 위한{' '}
        <span className="text-ube-bright">최적의 크리에이터</span>를 만나보세요
      </h1>

      <p className="text-base text-text-secondary leading-relaxed mt-4 mb-8">
        구독자 5천 명의 마이크로 크리에이터부터 최상위 스트리머까지, 어떤 규모의
        인플루언서 캠페인도 운영하세요. 브리프 관리, 콘텐츠 추적, 정산까지 한곳에서
        해결합니다.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="launch"
          size="lg"
          onClick={() => router.push('/studio')}
        >
          캠페인 시작하기
        </Button>
        <Button
          variant="ghost"
          size="lg"
          icon={<Play size={16} />}
          onClick={scrollToHow}
        >
          작동 방식 보기
        </Button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Stats bar
// ─────────────────────────────────────────────────────────────
function StatsBar() {
  const stats: ReadonlyArray<{ value: string; label: string }> = [
    { value: '20+', label: '인증 크리에이터' },
    { value: '6', label: '진행 중 캠페인' },
    { value: 'YouTube · SOOP · 치지직', label: '지원 플랫폼' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 border border-white/[0.06] rounded-lg overflow-hidden mt-6">
      {stats.map((s, i) => {
        const last = i === stats.length - 1;
        return (
          <div
            key={s.label}
            className={[
              'bg-bg-card text-center py-5 px-4',
              !last
                ? 'border-b sm:border-b-0 sm:border-r border-white/[0.06]'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="text-xl font-medium text-text-primary tracking-tight">
              {s.value}
            </div>
            <div className="text-xs text-text-secondary mt-1">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. How it works
// ─────────────────────────────────────────────────────────────
function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-2 mb-8 max-w-[560px]">
      <span className="text-[11px] text-ube-bright uppercase tracking-widest font-medium">
        {eyebrow}
      </span>
      <h2 className="text-2xl font-medium tracking-tight text-text-primary">
        {title}
      </h2>
      <p className="text-sm text-text-secondary">{subtitle}</p>
    </div>
  );
}

interface HowStep {
  icon: LucideIcon;
  step: string;
  title: string;
  desc: string;
}

const HOW_STEPS: ReadonlyArray<HowStep> = [
  {
    icon: LayoutGrid,
    step: '1단계',
    title: '캠페인 만들기',
    desc: '게임, 예산, 미션 유형을 설정하고 초대할 크리에이터 등급을 선택하세요.',
  },
  {
    icon: Users,
    step: '2단계',
    title: '크리에이터 지원',
    desc: '매칭된 크리에이터가 캠페인을 둘러보고 지원합니다. 프로필을 검토해 승인하거나 자동 매칭에 맡기세요.',
  },
  {
    icon: BarChart3,
    step: '3단계',
    title: '추적하고 정산',
    desc: '콘텐츠가 공개됩니다. 조회수와 참여도를 확인하고, 클릭 한 번으로 승인·정산하세요.',
  },
];

function HowItWorks() {
  return (
    <section id="how" className="py-14">
      <SectionHeader
        eyebrow="이용 방법"
        title="시작까지 단 3단계"
        subtitle="브리프부터 정산까지 — 스프레드시트도, 주고받는 이메일도 필요 없어요."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HOW_STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="bg-bg-card border border-white/[0.06] rounded-lg p-5 transition-colors duration-150 ease-out hover:border-white/15"
            >
              <span className="inline-flex w-9 h-9 rounded-md bg-bg-elevated border border-white/10 items-center justify-center">
                <Icon size={18} className="text-ube-bright" aria-hidden />
              </span>
              <div className="text-[11px] text-text-muted mt-3">{s.step}</div>
              <h3 className="text-sm font-medium text-text-primary mt-1">
                {s.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mt-1.5">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. Who it's for
// ─────────────────────────────────────────────────────────────
function CheckRow({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-text-secondary leading-relaxed">
      <Check
        size={14}
        className="text-ube-bright shrink-0 mt-1"
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}

function RoleCard({
  id,
  iconBg,
  iconColor,
  Icon,
  title,
  badge,
  bullets,
  cta,
  ctaClass,
  ctaVariant,
  onCta,
}: {
  id: string;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
  title: string;
  badge: string;
  bullets: string[];
  cta: string;
  ctaClass?: string;
  ctaVariant?: 'primary' | 'ghost';
  onCta: () => void;
}) {
  return (
    <div
      id={id}
      className="bg-bg-card border border-white/[0.06] rounded-lg p-6 flex flex-col gap-5 transition-colors duration-150 ease-out hover:border-white/15"
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex w-10 h-10 rounded-md items-center justify-center ${iconBg}`}
        >
          <Icon size={20} className={iconColor} aria-hidden />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-medium text-text-primary">
            {title}
          </span>
          <span className="text-xs text-text-secondary">{badge}</span>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5">
        {bullets.map((b) => (
          <CheckRow key={b}>{b}</CheckRow>
        ))}
      </ul>

      {ctaClass ? (
        <button
          type="button"
          onClick={onCta}
          className={`inline-flex items-center justify-center w-full px-5 py-2.5 rounded-md text-sm font-medium leading-tight cursor-pointer transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base ${ctaClass}`}
        >
          {cta}
        </button>
      ) : (
        <Button
          variant={ctaVariant ?? 'primary'}
          size="lg"
          full
          onClick={onCta}
        >
          {cta}
        </Button>
      )}
    </div>
  );
}

function WhoItsFor() {
  const router = useRouter();
  return (
    <section className="py-14 border-t border-white/[0.06]">
      <SectionHeader
        eyebrow="대상"
        title="양쪽 모두를 위한 플랫폼"
        subtitle="게임을 출시하든 채널을 키우든 — 이 플랫폼은 당신을 위해 작동합니다."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RoleCard
          id="studios"
          iconBg="bg-ube/15"
          iconColor="text-ube-bright"
          Icon={Gamepad2}
          title="게임사"
          badge="인디부터 AAA까지"
          bullets={[
            '에이전시 없이 직접 캠페인을 시작하세요',
            '다른 곳에서 놓치는 구독자 5천 명 이상 크리에이터까지',
            '실시간 콘텐츠 추적과 ROI 가시성',
            '투명한 요금제 — 숨은 비용 없음',
          ]}
          cta="게임사로 시작하기"
          ctaVariant="primary"
          onCta={() => router.push('/studio')}
        />
        <RoleCard
          id="creators"
          iconBg="bg-green-500/15"
          iconColor="text-green-400"
          Icon={Video}
          title="크리에이터"
          badge="구독자 5천 명 이상"
          bullets={[
            '내 콘텐츠에 맞는 게임 캠페인을 찾으세요',
            '단가를 미리 확인 — 협상 눈치 게임은 그만',
            '콘텐츠를 제출하면 자동으로 정산',
            'YouTube, SOOP, 치지직 모두 지원',
          ]}
          cta="크리에이터로 시작하기"
          ctaClass="bg-green-500 hover:bg-green-600 text-white border-0 focus-visible:ring-green-400/60"
          onCta={() => router.push('/creator')}
        />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. Why us
// ─────────────────────────────────────────────────────────────
interface DiffPoint {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const DIFF_POINTS: ReadonlyArray<DiffPoint> = [
  {
    icon: UsersRound,
    title: '마이크로 크리에이터 접근',
    desc: '대부분의 플랫폼이 외면하는 구독자 5천 명 규모 크리에이터까지 닿습니다.',
  },
  {
    icon: PlaySquare,
    title: '국내 플랫폼 네이티브',
    desc: 'YouTube와 함께 SOOP, 치지직까지 — 세 플랫폼을 모두 지원하는 최초의 서비스.',
  },
  {
    icon: Eye,
    title: '완전한 투명성',
    desc: '에이전시 블랙박스는 없습니다. 모든 크리에이터, 모든 콘텐츠, 모든 정산을 확인하세요.',
  },
  {
    icon: Globe,
    title: '시작부터 글로벌',
    desc: '지역을 넘나드는 캠페인. 현지 통화로 정산. 지리적 제약 없음.',
  },
];

function WhyUs() {
  return (
    <section className="py-14 border-t border-white/[0.06]">
      <SectionHeader
        eyebrow="차별점"
        title="무엇이 다른가요"
        subtitle="범용 인플루언서 툴이 아니라, 게임 크리에이터 시장만을 위해 만들었습니다."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DIFF_POINTS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="bg-bg-card border border-white/[0.06] rounded-lg p-4 flex gap-3 transition-colors duration-150 ease-out hover:border-white/15"
            >
              <span className="inline-flex w-8 h-8 rounded-md bg-bg-elevated border border-white/10 items-center justify-center shrink-0">
                <Icon size={16} className="text-ube-bright" aria-hidden />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-text-primary">
                  {p.title}
                </span>
                <p className="text-xs text-text-secondary leading-relaxed mt-1">
                  {p.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. Final CTA
// ─────────────────────────────────────────────────────────────
function FinalCTA() {
  const router = useRouter();
  return (
    <section className="py-16 text-center border-t border-white/[0.06]">
      <h2 className="text-2xl font-medium tracking-tight text-text-primary">
        첫 캠페인을 시작할 준비가 되셨나요?
      </h2>
      <p className="text-sm text-text-secondary mt-3 mb-7">
        무료로 시작하세요. 신용카드가 필요 없습니다.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push('/studio')}
        >
          게임사로 시작하기
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => router.push('/creator')}
        >
          크리에이터로 시작하기
        </Button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. Footer
// ─────────────────────────────────────────────────────────────
function FooterBar() {
  return (
    <footer className="py-6 border-t border-white/[0.06] flex flex-wrap justify-between items-center gap-3">
      <Logo size="sm" />
      <nav aria-label="법적 고지" className="flex items-center gap-4 text-xs text-text-secondary">
        <Link
          href="/terms"
          className="hover:text-text-primary transition-colors duration-150 ease-out"
        >
          이용약관
        </Link>
        <Link
          href="/privacy"
          className="hover:text-text-primary transition-colors duration-150 ease-out"
        >
          개인정보처리방침
        </Link>
      </nav>
      <span className="text-xs text-text-secondary">
        © 2025 Project Creator. All rights reserved.
      </span>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <div className="sticky top-0 z-40">
        <DemoBanner />
      </div>
      <div className="w-full max-w-[1080px] mx-auto px-8">
        <NavBar />
        <HeroSection />
        <StatsBar />
        <HowItWorks />
        <WhoItsFor />
        <WhyUs />
        <FinalCTA />
        <FooterBar />
      </div>
    </main>
  );
}
