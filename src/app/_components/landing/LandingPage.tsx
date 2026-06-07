'use client';

import { Gamepad2, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CampaignCard } from '@/app/studio/_components/CampaignCard';
import { FooterBar, NavBar } from '@/app/_components/landing/PublicChrome';
import { DemoBanner } from '@/components/layout';
import { Badge, Button, Card } from '@/components/ui';

import type { Campaign } from '@/lib/campaigns/types';

interface LandingPageProps {
  liveCampaigns: Campaign[];
}

function HeroSection() {
  const router = useRouter();

  return (
    <section
      className="relative flex flex-col justify-center min-h-[80vh] py-16 text-left"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(167, 139, 250, 0.08), transparent 70%)',
      }}
    >
      <Badge variant="primary" size="sm" className="w-fit mb-6">
        게임사 × 크리에이터 마케팅 플랫폼
      </Badge>

      <h1 className="text-[1.75rem] leading-[1.2] sm:text-4xl md:text-6xl font-extrabold tracking-tight max-w-2xl">
        게임 마케팅,
        <br className="hidden min-[400px]:inline" />
        <span className="text-primary">크리에이터</span>와 함께
      </h1>

      <p className="text-lg text-text-secondary leading-relaxed mt-5 max-w-xl">
        캠페인 등록부터 콘텐츠 검수, 정산까지 한 곳에서. YouTube · SOOP · 치지직
        크리에이터를 만나보세요.
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-8 w-full sm:w-auto">
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => router.push('/signup')}
        >
          게임사로 시작하기
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => router.push('/signup')}
        >
          크리에이터로 시작하기
        </Button>
      </div>
    </section>
  );
}

function LiveCampaignsSection({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();

  if (campaigns.length === 0) return null;

  return (
    <section className="py-16 border-t border-border">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-medium tracking-tight text-text-primary">
          지금 진행 중인 캠페인
        </h2>
        <Button variant="ghost" size="md" onClick={() => router.push('/login')}>
          전체 보기
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={`/campaigns/${campaign.id}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 rounded-xl"
          >
            <CampaignCard campaign={campaign} footer="joined" />
          </Link>
        ))}
      </div>
    </section>
  );
}

interface FlowStep {
  step: number;
  label: string;
}

const STUDIO_FLOW: FlowStep[] = [
  { step: 1, label: '캠페인 등록' },
  { step: 2, label: '크리에이터 매칭' },
  { step: 3, label: '콘텐츠 검수' },
  { step: 4, label: '정산' },
];

const CREATOR_FLOW: FlowStep[] = [
  { step: 1, label: '캠페인 지원' },
  { step: 2, label: '콘텐츠 제작' },
  { step: 3, label: '검수 통과' },
  { step: 4, label: '수익 정산' },
];

function FlowColumn({
  title,
  icon: Icon,
  steps,
}: {
  title: string;
  icon: typeof Gamepad2;
  steps: FlowStep[];
}) {
  return (
    <Card padding="lg" className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex w-10 h-10 rounded-md bg-primary-dim items-center justify-center">
          <Icon size={20} className="text-primary" aria-hidden />
        </span>
        <h3 className="text-base font-medium text-text-primary">{title}</h3>
      </div>
      <ol className="flex flex-col gap-4">
        {steps.map((s) => (
          <li key={s.step} className="flex items-center gap-3">
            <span className="inline-flex w-7 h-7 shrink-0 rounded-full bg-surface-hover border border-border items-center justify-center text-xs font-medium text-text-secondary tabular-nums">
              {s.step}
            </span>
            <span className="text-sm text-text-secondary">{s.label}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function HowItWorksSection() {
  return (
    <section id="how" className="py-16 border-t border-border">
      <div className="flex flex-col gap-2 mb-8 max-w-xl">
        <span className="text-xs font-medium text-primary uppercase tracking-widest">
          이용 방법
        </span>
        <h2 className="text-2xl font-medium tracking-tight text-text-primary">
          처음부터 정산까지, 한곳에서
        </h2>
        <p className="text-sm text-text-secondary">
          게임사와 크리에이터 모두 같은 플랫폼에서 캠페인을 운영하고 수익을 관리합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FlowColumn title="게임사" icon={Gamepad2} steps={STUDIO_FLOW} />
        <FlowColumn title="크리에이터" icon={Video} steps={CREATOR_FLOW} />
      </div>
    </section>
  );
}

function FinalCtaSection() {
  const router = useRouter();

  return (
    <section className="py-20 text-center border-t border-border">
      <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-text-primary">
        지금 바로 시작해 보세요
      </h2>
      <div className="mt-8 flex justify-center">
        <Button variant="primary" size="lg" onClick={() => router.push('/signup')}>
          무료로 시작하기
        </Button>
      </div>
    </section>
  );
}

export function LandingPage({ liveCampaigns }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="sticky top-0 z-40">
        <DemoBanner />
      </div>
      <div className="w-full max-w-5xl mx-auto px-6 md:px-8">
        <NavBar />
        <HeroSection />
        <LiveCampaignsSection campaigns={liveCampaigns} />
        <HowItWorksSection />
        <FinalCtaSection />
        <FooterBar />
      </div>
    </main>
  );
}
