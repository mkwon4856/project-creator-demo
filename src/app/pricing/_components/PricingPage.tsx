'use client';

import { ChevronDown, Gamepad2, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { FooterBar, NavBar } from '@/app/_components/landing/PublicChrome';
import { DemoBanner } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card } from '@/components/ui';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'payout-timing',
    question: '정산 시점은 언제인가요?',
    answer:
      '콘텐츠 제출 후 게임사 1차 검수와 플랫폼 관리자 최종 검수를 모두 통과하면 정산 대상이 됩니다. 최종 승인 이후 정산 처리 일정은 플랫폼에서 순차 안내드립니다.',
  },
  {
    id: 'budget',
    question: '캠페인 예산은 어떻게 책정하나요?',
    answer:
      '미션 유형(숏폼·롱폼·라이브)과 크리에이터 등급별 단가표를 기준으로 책정합니다. 캠페인 생성 마법사에서 참여 인원과 미션 구성을 입력하면 예상 예산이 자동 산출됩니다.',
  },
  {
    id: 'review',
    question: '검수 기준은 무엇인가요?',
    answer:
      '캠페인 브리프와 미션 요건(형식, 필수 포함 요소, 플랫폼 가이드) 충족 여부를 게임사와 플랫폼이 2단계로 검수합니다. 미션 요건과 맞지 않으면 수정 요청 또는 반려될 수 있습니다.',
  },
  {
    id: 'tax-invoice',
    question: '세금계산서 발행이 되나요?',
    answer:
      '게임사(사업자) 대상 거래는 세금계산서 발행을 지원합니다. 크리에이터 정산은 관련 세법에 따라 원천징수 등이 적용될 수 있으며, 구체 절차는 가입 후 안내드립니다.',
  },
];

function PricingCard({
  title,
  icon: Icon,
  badge,
  items,
}: {
  title: string;
  icon: typeof Gamepad2;
  badge?: string;
  items: string[];
}) {
  return (
    <Card padding="lg" className="flex flex-col gap-5 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex w-10 h-10 rounded-md bg-primary-dim items-center justify-center shrink-0">
            <Icon size={20} className="text-primary" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        </div>
        {badge && (
          <Badge variant="primary" size="sm">
            {badge}
          </Badge>
        )}
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed">
            <span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  return (
    <section className="py-12 border-t border-border">
      <h2 className="text-xl font-semibold text-text-primary mb-6">자주 묻는 질문</h2>
      <div className="flex flex-col gap-2">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <Card key={item.id} padding="none" className="overflow-hidden">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface-hover transition-colors duration-150 ease-out"
              >
                <span className="text-sm font-medium text-text-primary">{item.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-text-secondary transition-transform duration-200 ease-out ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed border-t border-border pt-3">
                  {item.answer}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export function PricingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="sticky top-0 z-40">
        <DemoBanner />
      </div>
      <div className="w-full max-w-5xl mx-auto px-6 md:px-8">
        <NavBar />

        <div className="py-10 md:py-14">
          <PageHeader
            title="가격 정책"
            description="캠페인 성과에 따라 합리적으로"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <PricingCard
              title="게임사"
              icon={Gamepad2}
              items={[
                '캠페인 등록 무료',
                '크리에이터 정산액 기준 수수료 부과',
                '콘텐츠 검수·정산 관리 포함',
              ]}
            />
            <PricingCard
              title="크리에이터"
              icon={Video}
              badge="수수료 0%"
              items={[
                '가입·지원 무료',
                '수수료 없이 미션 단가 그대로 정산',
              ]}
            />
          </div>

          <Card padding="lg" variant="featured" className="text-center">
            <p className="text-sm text-text-secondary leading-relaxed">
              플랫폼 수수료율은{' '}
              <span className="text-text-primary font-medium">출시 기념 할인 협의 중</span>
              입니다.
              <br className="hidden sm:inline" />
              {' '}게임사·크리에이터 모두 부담 없이 상담 후 시작하실 수 있습니다.
            </p>
            <Button
              variant="secondary"
              size="md"
              className="mt-5"
              onClick={() => router.push('/signup')}
            >
              문의 및 시작하기
            </Button>
          </Card>

          <FaqAccordion />

          <section className="py-16 text-center border-t border-border">
            <h2 className="text-xl md:text-2xl font-semibold text-text-primary">
              첫 캠페인을 시작해 보세요
            </h2>
            <p className="mt-3 text-sm text-text-secondary">
              등록부터 검수·정산까지 한 곳에서 관리할 수 있습니다.
            </p>
            <div className="mt-8 flex justify-center">
              <Button variant="primary" size="lg" onClick={() => router.push('/signup')}>
                캠페인 시작하기
              </Button>
            </div>
          </section>
        </div>

        <FooterBar />
      </div>
    </main>
  );
}
