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
    { label: 'For game studios', href: '#studios' },
    { label: 'For creators', href: '#creators' },
    { label: 'Pricing', href: '#' },
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
          Log in
        </Button>
        <Button variant="primary" size="md" onClick={() => router.push('/signup')}>
          Get started
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
        Game creator marketing, globally
      </span>

      <h1 className="text-4xl font-medium tracking-tight leading-[1.2] mt-5">
        Connect your game with{' '}
        <span className="text-ube-bright">the right creators</span>
      </h1>

      <p className="text-base text-text-secondary leading-relaxed mt-4 mb-8">
        Run influencer campaigns at any scale — from 5K micro creators to
        top-tier streamers. Manage briefs, track content, and settle payments
        in one place.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="launch"
          size="lg"
          onClick={() => router.push('/studio')}
        >
          Start a campaign
        </Button>
        <Button
          variant="ghost"
          size="lg"
          icon={<Play size={16} />}
          onClick={scrollToHow}
        >
          See how it works
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
    { value: '20+', label: 'Verified creators' },
    { value: '6', label: 'Active campaigns' },
    { value: 'YouTube · SOOP · Chzzk', label: 'Supported platforms' },
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
    step: 'Step 1',
    title: 'Create a campaign',
    desc: 'Set your game, budget, and mission types. Choose which creator tiers to invite.',
  },
  {
    icon: Users,
    step: 'Step 2',
    title: 'Creators apply',
    desc: 'Matched creators browse and apply. Review profiles and approve — or let auto-match handle it.',
  },
  {
    icon: BarChart3,
    step: 'Step 3',
    title: 'Track and pay',
    desc: 'Content goes live. Monitor views and engagement. Approve and settle in one click.',
  },
];

function HowItWorks() {
  return (
    <section id="how" className="py-14">
      <SectionHeader
        eyebrow="HOW IT WORKS"
        title="Three steps to launch"
        subtitle="From brief to payment — no spreadsheets, no back-and-forth emails."
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
        eyebrow="WHO IT'S FOR"
        title="Built for two sides"
        subtitle="Whether you're launching a game or growing your channel — this platform works for you."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RoleCard
          id="studios"
          iconBg="bg-ube/15"
          iconColor="text-ube-bright"
          Icon={Gamepad2}
          title="Game studios"
          badge="Indie to AAA"
          bullets={[
            'Launch campaigns without an agency',
            'Access 5K+ subscriber creators overlooked elsewhere',
            'Real-time content tracking and ROI visibility',
            'Transparent pricing — no hidden fees',
          ]}
          cta="Start as a game studio"
          ctaVariant="primary"
          onCta={() => router.push('/studio')}
        />
        <RoleCard
          id="creators"
          iconBg="bg-green-500/15"
          iconColor="text-green-400"
          Icon={Video}
          title="Creators"
          badge="5K subscribers and above"
          bullets={[
            'Find game campaigns that match your content',
            'See your rate upfront — no negotiation guesswork',
            'Submit content and get paid automatically',
            'Works on YouTube, SOOP, and Chzzk',
          ]}
          cta="Join as a creator"
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
    title: 'Micro creator access',
    desc: 'Reach creators from 5K subscribers — the tier most platforms ignore.',
  },
  {
    icon: PlaySquare,
    title: 'Korean platform native',
    desc: 'SOOP and Chzzk alongside YouTube — the first to support all three.',
  },
  {
    icon: Eye,
    title: 'Full transparency',
    desc: 'No agency black box. See every creator, every piece of content, every payment.',
  },
  {
    icon: Globe,
    title: 'Global from day one',
    desc: 'Campaigns across regions. Payouts in local currencies. No geographic limits.',
  },
];

function WhyUs() {
  return (
    <section className="py-14 border-t border-white/[0.06]">
      <SectionHeader
        eyebrow="WHY US"
        title="What makes this different"
        subtitle="Built specifically for the gaming creator market — not a general influencer tool."
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
        Ready to launch your first campaign?
      </h2>
      <p className="text-sm text-text-secondary mt-3 mb-7">
        Free to get started. No credit card required.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push('/studio')}
        >
          Start as a game studio
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => router.push('/creator')}
        >
          Join as a creator
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
    <footer className="py-6 border-t border-white/[0.06] flex flex-wrap justify-between items-center gap-2">
      <Logo size="sm" />
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
