import type { Metadata } from 'next';

import { NotFoundView } from '@/app/_components/not-found/NotFoundView';
import { SITE_NAME } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  description: `요청하신 페이지를 찾을 수 없습니다. ${SITE_NAME} 홈으로 돌아가 보세요.`,
};

export default function NotFound() {
  return <NotFoundView />;
}
