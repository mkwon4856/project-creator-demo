'use client';

import { Database, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { seedCampaigns } from '@/lib/seed';
import { useAppStore } from '@/lib/store';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

export interface DemoBannerProps {
  /** Override the default demo message. */
  message?: string;
}

const DEFAULT_MESSAGE = '🎮 샘플 데이터로 구성된 데모입니다. 실제 서비스가 아닙니다.';

const HAS_SUPABASE_ENV =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const IS_DEV = process.env.NODE_ENV !== 'production';

export function DemoBanner({ message = DEFAULT_MESSAGE }: DemoBannerProps) {
  const [seeding, setSeeding] = useState(false);

  const handleReset = () => {
    useAppStore.getState().clearDemo();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleSeed = async () => {
    if (seeding) return;
    setSeeding(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }
      const { data: studio } = await supabase
        .from('studios')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!studio) {
        alert('Studio 프로필이 필요합니다. Studio 계정으로 가입해주세요.');
        return;
      }
      const r = await seedCampaigns(studio.id);
      const summary =
        `✅ ${r.inserted}개 캠페인 시드 완료` +
        (r.errors.length ? `\n\n에러:\n${r.errors.join('\n')}` : '');
      alert(summary);
      window.location.reload();
    } catch (e) {
      alert(`시드 실패: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSeeding(false);
    }
  };

  const showSeedButton = HAS_SUPABASE_ENV && IS_DEV;

  return (
    <div className="bg-ube/10 border-b border-ube/20 px-8 py-2">
      <div className="flex items-center justify-between gap-3 text-xs text-ube-bright">
        <span className="truncate">{message}</span>
        <div className="flex items-center gap-1">
          {showSeedButton && (
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              aria-label="DB에 캠페인 시드 데이터 입력"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-ube/20 transition-colors duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ube/60 disabled:opacity-60 disabled:cursor-wait"
            >
              <Database size={14} aria-hidden />
              <span className="font-medium">{seeding ? '시드 중…' : 'DB 시드'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            aria-label="데모 초기화"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-ube/20 transition-colors duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ube/60"
          >
            <RotateCcw size={14} aria-hidden />
            <span className="font-medium">데모 초기화</span>
          </button>
        </div>
      </div>
    </div>
  );
}
