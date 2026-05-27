'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Film,
  Link2,
  Radio,
  Video,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Input, Modal, toast } from '@/components/ui';
import { submitContentUrl, type DisplayActivity } from '@/lib/api/submissions';
import { useAppStore, type ActivityMission } from '@/lib/store';

const MISSION_ICON: Record<ActivityMission, LucideIcon> = {
  shortform: Film,
  longform: Video,
  live: Radio,
};

const MISSION_LABEL: Record<ActivityMission, string> = {
  shortform: 'Shortform',
  longform: 'Longform',
  live: 'Live',
};

const URL_PLACEHOLDERS: Record<ActivityMission, string> = {
  shortform: 'https://youtube.com/shorts/...',
  longform: 'https://youtube.com/watch?v=...',
  live: 'https://chzzk.naver.com/live/...',
};

// ─────────────────────────────────────────────────────────────────────────────
// URL validation
// ─────────────────────────────────────────────────────────────────────────────

type ValidationSeverity = 'idle' | 'success' | 'warning' | 'error';

interface UrlValidation {
  /** True if the URL is structurally valid enough to submit. */
  valid: boolean;
  severity: ValidationSeverity;
  /** Recognized platform name when severity === 'success'. */
  platform?: string;
  /** Human-readable feedback (success / warning / error). */
  message?: string;
}

/**
 * Recognize whether the given URL belongs to a supported platform.
 * Order matters: more specific patterns (YouTube Shorts) come before
 * generic ones (YouTube). "Other https" is allowed but warns the user.
 */
export function validateContentUrl(rawUrl: string): UrlValidation {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return { valid: false, severity: 'idle' };
  }

  // YouTube Shorts (must come before generic YouTube)
  if (/^https?:\/\/(www\.)?youtube\.com\/shorts\/.+/i.test(trimmed)) {
    return { valid: true, severity: 'success', platform: 'YouTube Shorts' };
  }

  // YouTube (watch, /channel, /@handle, /playlist, embed) + youtu.be
  if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(trimmed)) {
    return { valid: true, severity: 'success', platform: 'YouTube' };
  }

  // SOOP (rebrand of AfreecaTV) — both domains accepted
  if (/^https?:\/\/(www\.|play\.|vod\.|ch\.)?(soop\.co\.kr|sooplive\.co\.kr|afreecatv\.com)\/.+/i.test(trimmed)) {
    return { valid: true, severity: 'success', platform: 'SOOP' };
  }

  // Chzzk (Naver)
  if (/^https?:\/\/(www\.)?chzzk\.naver\.com\/.+/i.test(trimmed)) {
    return { valid: true, severity: 'success', platform: 'Chzzk' };
  }

  // TikTok
  if (/^https?:\/\/(www\.|vm\.|m\.)?tiktok\.com\/.+/i.test(trimmed)) {
    return { valid: true, severity: 'success', platform: 'TikTok' };
  }

  // Generic https(http) URL — allowed with a warning so creators with niche
  // platforms aren't blocked, but they get a clear nudge.
  if (/^https?:\/\/[^\s]+\..+/i.test(trimmed)) {
    return {
      valid: true,
      severity: 'warning',
      platform: 'Other',
      message: '지원 플랫폼(YouTube, SOOP, Chzzk, TikTok) URL을 권장합니다',
    };
  }

  return {
    valid: false,
    severity: 'error',
    message: '올바른 URL을 입력해주세요 (https://로 시작)',
  };
}

// ─────────────────────────────────────────────────────────────────────────────

const FEEDBACK_ICON: Record<Exclude<ValidationSeverity, 'idle'>, LucideIcon> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const FEEDBACK_CLASS: Record<Exclude<ValidationSeverity, 'idle'>, string> = {
  success: 'text-green-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

function ValidationFeedback({ result }: { result: UrlValidation }) {
  if (result.severity === 'idle') return null;
  const Icon = FEEDBACK_ICON[result.severity];
  const cls = FEEDBACK_CLASS[result.severity];

  const text =
    result.severity === 'success'
      ? `${result.platform} 링크 확인됨`
      : (result.message ?? '');

  return (
    <p
      className={`text-[11px] inline-flex items-center gap-1.5 ${cls}`}
      role={result.severity === 'error' ? 'alert' : 'status'}
    >
      <Icon size={12} aria-hidden />
      <span>{text}</span>
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export interface SubmitUrlModalProps {
  open: boolean;
  activity: DisplayActivity | null;
  onClose: () => void;
  /**
   * Called after a successful submit (DB or store). Use this in
   * DB-backed lists to refetch and reflect the new `review` status.
   */
  onSubmitted?: () => void;
}

export function SubmitUrlModal({
  open,
  activity,
  onClose,
  onSubmitted,
}: SubmitUrlModalProps) {
  const storeSubmitUrl = useAppStore((s) => s.submitUrl);
  const [url, setUrl] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl('');
      setSubmitError(null);
      setSubmitting(false);
    }
  }, [open]);

  // Live recognition. We avoid showing feedback for very short input so users
  // don't see noise while they're still typing the protocol.
  const validation = useMemo<UrlValidation>(() => {
    if (url.trim().length < 6) return { valid: false, severity: 'idle' };
    return validateContentUrl(url);
  }, [url]);

  if (!activity) {
    return (
      <Modal open={open} onClose={onClose} size="sm" ariaLabel="Submit content URL">
        <Modal.Body>
          <p className="text-sm text-text-secondary">활동 정보를 불러올 수 없습니다.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" size="md" onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const Icon = MISSION_ICON[activity.mission];
  const missionLabel = MISSION_LABEL[activity.mission];
  const placeholder = URL_PLACEHOLDERS[activity.mission];

  const handleSubmit = async () => {
    if (submitting) return;
    const trimmed = url.trim();

    // Re-run validation at submit time as a safety net (covers the case
    // where validation had not been computed yet because of the length gate).
    const result = validateContentUrl(trimmed);
    if (!result.valid) {
      setSubmitError(result.message ?? '올바른 URL을 입력해주세요');
      return;
    }
    setSubmitError(null);

    setSubmitting(true);
    try {
      // 1) DB-backed activity → update submissions row.
      if (activity.submissionId) {
        const res = await submitContentUrl(activity.submissionId, trimmed);
        if (res.kind === 'error') {
          toast.error(`제출 실패: ${res.message}`);
          return;
        }
        // 'skip' (env missing) just means we couldn't reach DB; treat it as
        // a soft failure but still close — there is no store activity id.
        if (res.kind === 'skip' && !activity.storeActivityId) {
          toast.error('Supabase 연결이 설정되지 않았습니다.');
          return;
        }
      }

      // 2) Always mirror to the Zustand store when a store id exists, so the
      //    demo path and the DB path both update immediately.
      if (activity.storeActivityId) {
        storeSubmitUrl(activity.storeActivityId, trimmed);
      }

      const successSuffix =
        validation.severity === 'success' && validation.platform
          ? ` (${validation.platform})`
          : '';
      toast.success(`제출 완료${successSuffix}! 관리자 검수를 기다려주세요`);
      onClose();
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  };

  const submitDisabled =
    submitting || !url.trim() || (validation.severity !== 'idle' && !validation.valid);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      ariaLabel={`Submit content for ${activity.campaignName}`}
    >
      <Modal.Hero>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            Submit content
          </span>
          <h2 className="text-base font-medium text-text-primary leading-tight">
            {activity.campaignName}
          </h2>
          <p className="text-[12px] text-text-secondary inline-flex items-center gap-1.5">
            <Icon size={12} aria-hidden /> {missionLabel} · {activity.developer}
          </p>
        </div>
      </Modal.Hero>

      <Modal.Body>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Input
              label="콘텐츠 URL"
              placeholder={placeholder}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (submitError) setSubmitError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSubmit();
              }}
              icon={<Link2 size={14} />}
              error={submitError ?? undefined}
              helper={
                submitError
                  ? undefined
                  : 'YouTube, SOOP, Chzzk, TikTok URL을 붙여넣어주세요'
              }
              autoFocus
              disabled={submitting}
            />
            <ValidationFeedback result={validation} />
          </div>

          <div className="rounded-[var(--radius-md)] bg-bg-elevated border border-white/[0.06] p-3 flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              검수 안내
            </span>
            <p className="text-[11px] leading-relaxed text-text-secondary">
              제출 후 관리자가 콘텐츠를 검수합니다. 승인되면 자동으로 정산되며,
              반려 시 사유와 함께 재제출 안내를 드립니다.
            </p>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="ghost" size="md" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={submitDisabled}
          loading={submitting}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
