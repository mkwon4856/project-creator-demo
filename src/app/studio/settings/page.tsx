'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Alert, Button, Card, Input, Textarea, toast } from '@/components/ui';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentProfile, useCurrentStudio } from '@/lib/supabase/hooks';

import { getStudioSidebar } from '../_config/sidebar';

const HAS_SUPABASE_ENV =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-[11px] uppercase tracking-widest text-text-muted mb-4">
      {children}
    </div>
  );
}

export default function StudioSettingsPage() {
  const router = useRouter();
  const descId = useId();
  const { data: studio, loading: studioLoading } = useCurrentStudio();
  const { data: profile, loading: profileLoading } = useCurrentProfile();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (studio) {
      setName(studio.company_name);
      // description/logo_url have no backing column in the new schema.
      // TODO(rebuild): source from a future studio profile table if reintroduced.
      setDescription('');
      setLogoUrl('');
    }
  }, [studio]);

  const handleSaveProfile = async () => {
    if (!studio) {
      toast.error('스튜디오 프로필이 없습니다');
      return;
    }
    if (!name.trim()) {
      toast.error('게임사 이름을 입력해주세요');
      return;
    }
    setSaving(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from('studios')
        .update({
          // description/logo_url removed from schema — only company_name persists.
          company_name: name.trim(),
        })
        .eq('id', studio.id);
      if (error) {
        toast.error(`저장 실패: ${error.message}`);
        return;
      }
      toast.success('게임사 프로필이 저장되었습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!HAS_SUPABASE_ENV) {
      toast.error('Supabase 환경이 설정되지 않았습니다');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('비밀번호 확인이 일치하지 않습니다');
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(`비밀번호 변경 실패: ${error.message}`);
        return;
      }
      setNewPassword('');
      setConfirmPassword('');
      toast.success('비밀번호가 변경되었습니다');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      if (HAS_SUPABASE_ENV) {
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.signOut();
      }
    } catch {
      // demo mode — ignore
    }
    router.push('/login');
  };

  if (studioLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">불러오는 중…</span>
      </div>
    );
  }

  return (
    <WorkspaceLayout
      persona="studio"
      userName={studio?.company_name ?? '테스트 게임사 1'}
      userAvatar="🎮"
      userBadge="게임사"
      sidebarSections={getStudioSidebar('settings')}
    >
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
          게임사 · 설정
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          설정
        </h1>
        <p className="text-sm text-text-secondary mt-1">게임사 프로필을 관리하세요</p>
      </header>

      {!studio && (
        <Alert variant="warning" className="mb-6">
          스튜디오 프로필이 없습니다. 회원가입 시 role을 <code>studio</code>로 선택해야
          이 페이지가 작동합니다.
        </Alert>
      )}

      <Card variant="default" padding="lg" className="mb-6">
        <SectionLabel>게임사 프로필</SectionLabel>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="게임사 이름"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="게임사 이름"
          />
          <Input
            label="로고 URL"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="mb-4">
          <Textarea
            id={descId}
            label="소개"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="게임사 소개"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.06]">
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveProfile}
            disabled={!studio || saving}
            loading={saving}
          >
            {saving ? '저장 중…' : '변경사항 저장'}
          </Button>
        </div>
      </Card>

      <Card variant="default" padding="lg" className="mb-6">
        <SectionLabel>계정</SectionLabel>

        <div className="mb-5 pb-5 border-b border-white/[0.06]">
          <div className="text-xs font-medium text-text-secondary mb-1.5">이메일</div>
          <div className="text-sm text-text-primary tabular-nums">
            {profile?.email ?? '—'}
          </div>
          <div className="text-[11px] text-text-muted mt-1">
            이메일은 변경할 수 없습니다
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="새 비밀번호"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="6자 이상"
            helper="6자 이상 입력"
          />
          <Input
            label="비밀번호 확인"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 재입력"
          />
        </div>

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword || !confirmPassword}
            loading={changingPassword}
          >
            {changingPassword ? '변경 중…' : '비밀번호 저장'}
          </Button>
        </div>
      </Card>

      <Card
        variant="default"
        padding="lg"
        className="mb-12 border-red-500/30"
      >
        <SectionLabel>위험 구역</SectionLabel>

        <div className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.06]">
          <div>
            <div className="text-sm font-medium text-text-primary">로그아웃</div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              로그아웃하고 로그인 페이지로 돌아갑니다
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut size={14} aria-hidden />}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? '로그아웃 중…' : '로그아웃'}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 pt-3">
          <div>
            <div className="text-sm font-medium text-red-400">계정 삭제</div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              계정과 모든 데이터를 영구 삭제합니다 (복구 불가)
            </div>
          </div>
          <Button variant="ghost" size="sm" disabled>
            준비 중
          </Button>
        </div>
      </Card>
    </WorkspaceLayout>
  );
}
