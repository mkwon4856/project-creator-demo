'use client';

import { PlaySquare, Radio, Tv, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { ProfileCompletion } from '@/components/creator/ProfileCompletion';
import { Alert, Badge, Button, Card, Input, Textarea, toast } from '@/components/ui';
import type { Grade, Database, Json } from '@/lib/db.types';
import { CURRENT_CREATOR, formatSubscribers } from '@/lib/mockCreators';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

import { getCreatorSidebar } from '../_config/sidebar';

type CreatorRow = Database['public']['Tables']['creators']['Row'];

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

type PlatformKey = 'youtube' | 'soop' | 'chzzk';

interface PlatformMeta {
  label: string;
  icon: LucideIcon;
  urlPlaceholder: string;
}

const PLATFORM_META: Record<PlatformKey, PlatformMeta> = {
  youtube: {
    label: 'YouTube',
    icon: PlaySquare,
    urlPlaceholder: 'https://youtube.com/@channel',
  },
  soop: {
    label: 'SOOP',
    icon: Radio,
    urlPlaceholder: 'https://sooplive.co.kr/...',
  },
  chzzk: {
    label: '치지직',
    icon: Tv,
    urlPlaceholder: 'https://chzzk.naver.com/...',
  },
};

interface PlatformFormState {
  url: string;
  subscribers: number;
}

type PlatformsState = Record<PlatformKey, PlatformFormState>;

const EMPTY_PLATFORMS: PlatformsState = {
  youtube: { url: '', subscribers: 0 },
  soop: { url: '', subscribers: 0 },
  chzzk: { url: '', subscribers: 0 },
};

function gradeForSubscribers(n: number): Grade {
  if (n >= 500_000) return 'A';
  if (n >= 100_000) return 'B';
  if (n >= 30_000) return 'C';
  if (n >= 10_000) return 'D';
  return 'E';
}

function parsePlatforms(raw: unknown): PlatformsState {
  const next: PlatformsState = {
    youtube: { url: '', subscribers: 0 },
    soop: { url: '', subscribers: 0 },
    chzzk: { url: '', subscribers: 0 },
  };
  if (!Array.isArray(raw)) return next;
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const p = item as { type?: string; url?: string; subscribers?: number | string };
    if (p.type === 'youtube' || p.type === 'soop' || p.type === 'chzzk') {
      next[p.type] = {
        url: typeof p.url === 'string' ? p.url : '',
        subscribers: Number(p.subscribers ?? 0) || 0,
      };
    }
  }
  return next;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-[11px] uppercase tracking-widest text-text-muted mb-4">
      {children}
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-bg-elevated border border-white/10 p-4">
      <div className="text-[11px] uppercase tracking-widest text-text-muted mb-1.5">
        {label}
      </div>
      <div className="text-lg font-medium text-text-primary tabular-nums leading-tight">
        {value}
      </div>
      {sub && <div className="text-[11px] text-text-secondary mt-0.5">{sub}</div>}
    </div>
  );
}

function ConnectedPill({ connected }: { connected: boolean }) {
  if (connected) {
    return (
      <span className="inline-flex items-center bg-green-500/15 text-green-400 text-[10px] font-medium px-2 py-0.5 rounded-full leading-none">
        연결됨
      </span>
    );
  }
  return (
    <span className="inline-flex items-center bg-bg-hover text-text-muted text-[10px] font-medium px-2 py-0.5 rounded-full leading-none">
      미연결
    </span>
  );
}

function PlatformCard({
  type,
  value,
  onChange,
}: {
  type: PlatformKey;
  value: PlatformFormState;
  onChange: (next: PlatformFormState) => void;
}) {
  const meta = PLATFORM_META[type];
  const Icon = meta.icon;
  const connected = value.url.trim().length > 0;

  return (
    <div className="bg-bg-elevated border border-white/10 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <Icon size={16} className="text-text-secondary" aria-hidden />
          <span className="text-sm font-medium text-text-primary">{meta.label}</span>
        </div>
        <ConnectedPill connected={connected} />
      </div>
      <Input
        label="채널 URL"
        type="url"
        placeholder={meta.urlPlaceholder}
        value={value.url}
        onChange={(e) => onChange({ ...value, url: e.target.value })}
      />
      <Input
        label="구독자"
        type="number"
        min={0}
        inputMode="numeric"
        value={value.subscribers === 0 ? '' : String(value.subscribers)}
        placeholder="0"
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange({ ...value, subscribers: Number.isFinite(n) && n >= 0 ? n : 0 });
        }}
      />
    </div>
  );
}

export default function CreatorProfilePage() {
  const bioId = useId();
  const [creator, setCreator] = useState<CreatorRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [platforms, setPlatforms] = useState<PlatformsState>(EMPTY_PLATFORMS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!HAS_SUPABASE_ENV) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('creators')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) {
          toast.error(`프로필 조회 실패: ${error.message}`);
        }
        if (data && !cancelled) {
          setCreator(data);
          setDisplayName(data.display_name);
          setHandle(data.handle);
          setBio(data.bio ?? '');
          setPlatforms(parsePlatforms(data.platforms));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalSubscribers =
    platforms.youtube.subscribers + platforms.soop.subscribers + platforms.chzzk.subscribers;
  const computedGrade = gradeForSubscribers(totalSubscribers);

  const currentGrade: Grade = creator?.grade ?? 'E';
  const avgViews = creator?.avg_views ?? 0;
  const rating = Number(creator?.rating ?? 0);
  const completedCampaigns = creator?.completed_campaigns ?? 0;

  const handleSave = async () => {
    if (!creator) {
      toast.error('프로필 정보가 없습니다');
      return;
    }
    if (!displayName.trim()) {
      toast.error('활동명을 입력해주세요');
      return;
    }
    if (!handle.trim()) {
      toast.error('핸들을 입력해주세요');
      return;
    }

    setSaving(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const normalizedHandle = handle.startsWith('@') ? handle : `@${handle}`;
      const newGrade = gradeForSubscribers(totalSubscribers);
      const prevGrade = creator.grade;

      const platformsJson = [
        platforms.youtube.url.trim()
          ? {
              type: 'youtube',
              url: platforms.youtube.url.trim(),
              subscribers: platforms.youtube.subscribers,
            }
          : null,
        platforms.soop.url.trim()
          ? {
              type: 'soop',
              url: platforms.soop.url.trim(),
              subscribers: platforms.soop.subscribers,
            }
          : null,
        platforms.chzzk.url.trim()
          ? {
              type: 'chzzk',
              url: platforms.chzzk.url.trim(),
              subscribers: platforms.chzzk.subscribers,
            }
          : null,
      ].filter(Boolean) as Json;

      const { data: updated, error } = await supabase
        .from('creators')
        .update({
          display_name: displayName.trim(),
          handle: normalizedHandle,
          bio,
          subscribers: totalSubscribers,
          grade: newGrade,
          platforms: platformsJson,
        })
        .eq('id', creator.id)
        .select()
        .single();

      if (error) {
        toast.error(`저장 실패: ${error.message}`);
        return;
      }

      if (updated) setCreator(updated);
      setHandle(normalizedHandle);
      toast.success('프로필이 저장되었습니다');

      if (newGrade !== prevGrade) {
        setTimeout(() => {
          toast.success(`등급이 ${prevGrade} → ${newGrade}로 변경되었습니다!`);
        }, 250);
      }
    } catch (err) {
      toast.error(
        `오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">불러오는 중…</span>
      </div>
    );
  }

  const userName = creator?.display_name || CURRENT_CREATOR.name;
  const userAvatar = CURRENT_CREATOR.emoji;
  const userBadge = `${currentGrade}티어`;

  const canSave = Boolean(creator) && !saving;

  return (
    <WorkspaceLayout
      persona="creator"
      userName={userName}
      userAvatar={userAvatar}
      userBadge={userBadge}
      sidebarSections={getCreatorSidebar('profile')}
    >
      <header className="mb-6">
        <h1 className="text-xl font-medium text-text-primary leading-tight">프로필</h1>
        <p className="text-sm text-text-secondary mt-1">
          크리에이터 프로필과 연결된 플랫폼을 관리하세요
        </p>
      </header>

      {creator && (
        <ProfileCompletion
          displayName={displayName}
          handle={handle}
          bio={bio}
          connectedPlatforms={
            (platforms.youtube.url.trim() ? 1 : 0) +
            (platforms.soop.url.trim() ? 1 : 0) +
            (platforms.chzzk.url.trim() ? 1 : 0)
          }
          subscribers={totalSubscribers}
          showEditLink={false}
        />
      )}

      {!creator && (
        <Alert variant="warning" className="mb-6">
          크리에이터 프로필이 없습니다. 회원가입 시 role을 <code>creator</code>로 선택해야 이 페이지에서 수정할 수 있습니다.
        </Alert>
      )}

      <Card variant="default" padding="lg" className="mb-6">
        <SectionLabel>기본 정보</SectionLabel>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input
            label="활동명"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="채널/활동명"
          />
          <Input
            label="핸들"
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@your_handle"
            helper="저장 시 자동으로 @가 붙습니다"
          />
        </div>

        <Textarea
          id={bioId}
          label="소개"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="자기소개 (어떤 게임을 주로 다루는지, 채널 컨셉 등)"
          className="min-h-[100px] resize-vertical"
          containerClassName="mb-4"
        />

        <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06] mt-2">
          <span className="text-xs font-medium text-text-secondary">등급</span>
          <Badge variant="primary" size="sm">
            {currentGrade}티어
          </Badge>
          {computedGrade !== currentGrade && (
            <span className="text-[11px] text-warning">
              저장 시 {currentGrade} → {computedGrade}로 자동 변경
            </span>
          )}
          <span className="text-[11px] text-text-secondary ml-auto">
            등급은 구독자 수에 따라 자동 결정됩니다
          </span>
        </div>
      </Card>

      <Card variant="default" padding="lg" className="mb-6">
        <SectionLabel>연결된 플랫폼</SectionLabel>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['youtube', 'soop', 'chzzk'] as const).map((key) => (
            <PlatformCard
              key={key}
              type={key}
              value={platforms[key]}
              onChange={(next) =>
                setPlatforms((prev) => ({ ...prev, [key]: next }))
              }
            />
          ))}
        </div>
      </Card>

      <Card variant="default" padding="lg" className="mb-6">
        <SectionLabel>통계</SectionLabel>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox
            label="구독자"
            value={formatSubscribers(totalSubscribers)}
            sub="플랫폼 합산"
          />
          <StatBox label="평균 조회수" value={formatSubscribers(avgViews)} sub="영상당" />
          <StatBox label="평점" value={rating.toFixed(1)} sub="5.0 만점" />
          <StatBox
            label="완료"
            value={completedCampaigns.toString()}
            sub="캠페인"
          />
        </div>
      </Card>

      <div className="flex justify-end gap-2 pb-12">
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={!canSave}
          loading={saving}
        >
          {saving ? '저장 중…' : '변경사항 저장'}
        </Button>
      </div>
    </WorkspaceLayout>
  );
}
