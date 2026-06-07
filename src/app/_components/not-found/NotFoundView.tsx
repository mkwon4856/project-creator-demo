'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui';

export function NotFoundView() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-bg text-text-primary flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-md">
        <p className="text-7xl sm:text-8xl font-extrabold text-primary tabular-nums leading-none">
          404
        </p>
        <h1 className="mt-6 text-2xl font-bold text-text-primary">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-sm text-text-secondary leading-relaxed">
          요청하신 주소가 변경되었거나 존재하지 않습니다. 아래 버튼으로 이동해 주세요.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => router.push('/')}
          >
            홈으로
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => router.push('/')}
          >
            진행 중인 캠페인 보기
          </Button>
        </div>
      </div>
    </main>
  );
}
