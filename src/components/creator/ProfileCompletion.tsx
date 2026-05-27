'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export interface ProfileCompletionInput {
  /** Display name (creators.display_name). */
  displayName: string;
  /** Handle (creators.handle). */
  handle: string;
  /** Bio (creators.bio). */
  bio: string;
  /** Number of platforms with a non-empty URL (0..3). */
  connectedPlatforms: number;
  /** Total subscribers across connected platforms. */
  subscribers: number;
}

export interface CompletionItem {
  label: string;
  done: boolean;
  /** When done === false, the message guides the user to fix it. */
}

export interface CompletionResult {
  score: number; // 0..100
  items: CompletionItem[];
}

/**
 * Compute a 0–100 profile completion score with per-item progress notes.
 * Weights: name 10, handle 5, bio 15, 1 platform 30, 2+ platforms 15,
 *          subscribers > 0 10, subscribers >= 5,000 15. Total = 100.
 */
export function calculateCompletion(input: ProfileCompletionInput): CompletionResult {
  let score = 0;
  const items: CompletionItem[] = [];

  if (input.displayName && input.displayName.trim().length > 1) {
    score += 10;
    items.push({ label: '이름 설정', done: true });
  } else {
    items.push({ label: '이름을 설정하세요', done: false });
  }

  if (input.handle && input.handle.trim().length > 1) {
    score += 5;
    items.push({ label: '핸들 설정', done: true });
  } else {
    items.push({ label: '핸들을 설정하세요', done: false });
  }

  if (input.bio && input.bio.trim().length >= 20) {
    score += 15;
    items.push({ label: '소개 작성', done: true });
  } else {
    items.push({ label: '소개를 20자 이상 작성하세요', done: false });
  }

  if (input.connectedPlatforms >= 1) {
    score += 30;
    items.push({ label: '채널 1개 연결', done: true });
  } else {
    items.push({
      label: 'YouTube, SOOP, 또는 Chzzk 채널을 연결하세요',
      done: false,
    });
  }

  if (input.connectedPlatforms >= 2) {
    score += 15;
    items.push({ label: '채널 2개 이상 연결', done: true });
  } else if (input.connectedPlatforms === 1) {
    items.push({
      label: '추가 채널을 연결하면 노출이 늘어나요',
      done: false,
    });
  } else {
    // No-op: covered by "1 platform" item.
  }

  if (input.subscribers > 0) {
    score += 10;
    items.push({ label: '구독자 수 확인', done: true });
  } else {
    items.push({ label: '구독자 수를 입력하세요', done: false });
  }

  if (input.subscribers >= 5000) {
    score += 15;
    items.push({ label: '등급 산정 완료', done: true });
  } else {
    items.push({
      label: '구독자 5,000명 이상이면 등급이 산정됩니다',
      done: false,
    });
  }

  return { score, items };
}

function barColor(score: number): string {
  if (score < 40) return 'bg-red-500';
  if (score < 70) return 'bg-amber-500';
  return 'bg-ube';
}

export interface ProfileCompletionProps extends ProfileCompletionInput {
  /** Show the "프로필 수정" link. Default true. Set false on the profile page itself. */
  showEditLink?: boolean;
  /** Optional className for outer wrapper. */
  className?: string;
}

export function ProfileCompletion({
  displayName,
  handle,
  bio,
  connectedPlatforms,
  subscribers,
  showEditLink = true,
  className,
}: ProfileCompletionProps) {
  const { score, items } = calculateCompletion({
    displayName,
    handle,
    bio,
    connectedPlatforms,
    subscribers,
  });

  const isComplete = score >= 100;
  const firstIncomplete = items.find((it) => !it.done);

  // 100% complete on a sub-page (showEditLink=false): hide entirely. On the
  // creator main page we still show the celebration message briefly.
  if (isComplete && !showEditLink) return null;

  return (
    <section
      aria-label="프로필 완성도"
      className={[
        'bg-bg-card border border-white/[0.06] rounded-lg p-5 mb-6',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className="flex items-center justify-between gap-3 mb-2.5">
        <span className="text-xs font-medium text-text-secondary">
          프로필 완성도
        </span>
        <span
          className={
            isComplete
              ? 'text-sm font-medium text-green-400 tabular-nums inline-flex items-center gap-1'
              : 'text-sm font-medium text-ube-bright tabular-nums'
          }
        >
          {isComplete && <CheckCircle2 size={14} aria-hidden />}
          {Math.min(100, score)}%
        </span>
      </header>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(100, score)}
        className="h-1.5 w-full bg-bg-hover rounded-full overflow-hidden"
      >
        <div
          className={`h-full ${barColor(score)} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        {isComplete ? (
          <p className="text-xs text-green-400 inline-flex items-center gap-1.5">
            <CheckCircle2 size={12} aria-hidden />
            <span>프로필 완성! 캠페인 매칭률이 가장 높은 상태입니다.</span>
          </p>
        ) : firstIncomplete ? (
          <p className="text-xs text-text-secondary inline-flex items-center gap-1.5 min-w-0">
            <span aria-hidden>💡</span>
            <span className="truncate">{firstIncomplete.label}</span>
          </p>
        ) : (
          <span />
        )}

        {showEditLink && !isComplete && (
          <Link
            href="/creator/profile"
            className="text-xs text-ube-bright hover:underline shrink-0"
          >
            프로필 수정 →
          </Link>
        )}
      </div>
    </section>
  );
}
