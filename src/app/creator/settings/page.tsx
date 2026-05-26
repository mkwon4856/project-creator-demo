'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { WorkspaceLayout } from '@/components/layout';
import { Button, Card, Input, toast } from '@/components/ui';
import { CURRENT_CREATOR } from '@/lib/mockCreators';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useCurrentCreator, useCurrentProfile } from '@/lib/supabase/hooks';

import { getCreatorSidebar } from '../_config/sidebar';

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

export default function CreatorSettingsPage() {
  const router = useRouter();
  const { data: creator, loading: creatorLoading } = useCurrentCreator();
  const { data: profile, loading: profileLoading } = useCurrentProfile();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

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

  if (creatorLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <span className="text-text-secondary text-sm">Loading…</span>
      </div>
    );
  }

  const userName = creator?.display_name || CURRENT_CREATOR.name;
  const userBadge = `${creator?.grade ?? CURRENT_CREATOR.grade}-tier`;

  return (
    <WorkspaceLayout
      persona="creator"
      userName={userName}
      userAvatar={CURRENT_CREATOR.emoji}
      userBadge={userBadge}
      sidebarSections={getCreatorSidebar('settings')}
    >
      <header className="mb-6">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ube-bright">
          Creator · Settings
        </span>
        <h1 className="text-[22px] font-medium text-text-primary leading-tight mt-1.5">
          Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">Manage your account</p>
      </header>

      <Card variant="default" padding="lg" className="mb-6">
        <SectionLabel>Account</SectionLabel>

        <div className="mb-5 pb-5 border-b border-white/[0.06]">
          <div className="text-xs font-medium text-text-secondary mb-1.5">Email</div>
          <div className="text-sm text-text-primary tabular-nums">
            {profile?.email ?? '—'}
          </div>
          <div className="text-[11px] text-text-muted mt-1">
            이메일은 변경할 수 없습니다
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            helper="6자 이상 입력"
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
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
            {changingPassword ? 'Updating…' : 'Save password'}
          </Button>
        </div>
      </Card>

      <Card
        variant="default"
        padding="lg"
        className="mb-6 border-blue-500/20 bg-blue-500/[0.03]"
      >
        <SectionLabel>Profile</SectionLabel>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-text-primary">
              Edit creator profile
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              Display name, handle, bio, 연결된 플랫폼을 수정하려면 프로필 페이지로
              이동하세요
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/creator/profile')}
          >
            Open profile
          </Button>
        </div>
      </Card>

      <Card
        variant="default"
        padding="lg"
        className="mb-12 border-red-500/30"
      >
        <SectionLabel>Danger Zone</SectionLabel>

        <div className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.06]">
          <div>
            <div className="text-sm font-medium text-text-primary">Log out</div>
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
            {loggingOut ? 'Logging out…' : 'Log out'}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 pt-3">
          <div>
            <div className="text-sm font-medium text-red-400">Delete account</div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              계정과 모든 데이터를 영구 삭제합니다 (복구 불가)
            </div>
          </div>
          <Button variant="ghost" size="sm" disabled>
            Coming soon
          </Button>
        </div>
      </Card>
    </WorkspaceLayout>
  );
}
