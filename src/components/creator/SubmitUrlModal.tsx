'use client';

import { Film, Link2, Radio, Video, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl('');
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

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
    if (!trimmed) {
      setError('URL을 입력해주세요');
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setError('http:// 또는 https://로 시작하는 URL이어야 합니다');
      return;
    }

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

      toast.success('제출 완료! 관리자 검수를 기다려주세요');
      onClose();
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  };

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
          <Input
            label="콘텐츠 URL"
            placeholder={placeholder}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleSubmit();
            }}
            icon={<Link2 size={14} />}
            error={error ?? undefined}
            helper={
              error
                ? undefined
                : '업로드 후 게시된 영상/방송 URL을 그대로 붙여넣어주세요'
            }
            autoFocus
            disabled={submitting}
          />

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
          disabled={submitting}
          loading={submitting}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
