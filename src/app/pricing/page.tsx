import type { Metadata } from 'next';

import { SITE_NAME } from '@/lib/siteConfig';

import { PricingPage } from './_components/PricingPage';

export const metadata: Metadata = {
  title: '가격 정책',
  description: `${SITE_NAME}의 게임사·크리에이터 가격 정책. 캠페인 등록 무료, 미션 단가 기반 정산, 2단계 검수 후 정산.`,
};

export default function Page() {
  return <PricingPage />;
}
