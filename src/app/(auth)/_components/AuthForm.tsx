'use client';

import { Gamepad2, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { Alert, Button, Card, Input } from '@/components/ui';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

type AuthRole = 'studio' | 'creator';

export interface AuthFormProps {
  mode: 'login' | 'signup';
}

/** Only allow same-origin paths starting with a single `/` to prevent open redirects. */
function sanitizeRedirect(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//')) return null;
  return value;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirect(searchParams.get('redirect'));
  const supabase = createBrowserSupabaseClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AuthRole>('creator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  const validate = (): string | null => {
    if (!email) return '이메일을 입력해주세요.';
    if (!password) return '비밀번호를 입력해주세요.';
    if (password.length < 6) return '비밀번호는 6자 이상이어야 합니다.';
    if (isSignup && !name.trim()) return '이름을 입력해주세요.';
    return null;
  };

  const handleSignup = async () => {
    const trimmedName = name.trim();
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: trimmedName,
          role,
        },
      },
    });
    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }
    if (!data.session || !data.user) {
      setError(
        '이메일 인증이 필요합니다. Supabase 대시보드에서 "Confirm email"을 끄거나, 메일함을 확인한 뒤 로그인해주세요.',
      );
      setLoading(false);
      return;
    }

    // The handle_new_user() trigger creates the public.profiles row.
    // We additionally insert into studios/creators based on the chosen role.
    const userId = data.user.id;
    if (role === 'studio') {
      const { error: studioErr } = await supabase.from('studios').insert({
        user_id: userId,
        name: trimmedName,
      });
      if (studioErr) {
        setError(`게임사 프로필 생성에 실패했습니다: ${studioErr.message}`);
        setLoading(false);
        return;
      }
    } else {
      // Derive a tentative handle from the email local-part; user can edit later.
      const handle = '@' + email.split('@')[0];
      const { error: creatorErr } = await supabase.from('creators').insert({
        user_id: userId,
        display_name: trimmedName,
        handle,
        grade: 'E',
        subscribers: 0,
        avg_views: 0,
        rating: 0,
        completed_campaigns: 0,
        is_verified: false,
        bio: '',
        platforms: [],
      });
      if (creatorErr) {
        setError(`크리에이터 프로필 생성에 실패했습니다: ${creatorErr.message}`);
        setLoading(false);
        return;
      }
    }

    router.push(redirectTo ?? (role === 'studio' ? '/studio' : '/creator'));
  };

  const handleLogin = async () => {
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }
    if (!data.user) {
      setError('로그인에 실패했습니다.');
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    // RLS may briefly block reads — fall back to creator if profile not yet visible.
    if (profileError) {
      router.push(redirectTo ?? '/creator');
      return;
    }

    if (redirectTo) router.push(redirectTo);
    else if (profile?.role === 'admin') router.push('/admin');
    else if (profile?.role === 'studio') router.push('/studio');
    else router.push('/creator');
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setLoading(true);
    if (isSignup) {
      void handleSignup();
    } else {
      void handleLogin();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-[420px] w-full">
      <Card padding="lg">
      <div className="flex justify-center mb-7">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-text-primary"
        >
          Project <span className="text-primary">Creator</span>
        </Link>
      </div>

      <h1 className="text-xl font-medium text-text-primary text-center leading-tight">
        {isSignup ? '계정 만들기' : '다시 오신 걸 환영해요'}
      </h1>
      <p className="text-sm text-text-secondary text-center mt-1 mb-6">
        {isSignup
          ? '게임사 또는 크리에이터로 시작하세요'
          : '워크스페이스에 로그인하세요'}
      </p>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {isSignup && (
        <>
          <div className="mb-4">
            <Input
              label="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              autoComplete="name"
              disabled={loading}
            />
          </div>

          <fieldset className="mb-4">
            <legend className="text-xs font-medium text-text-secondary mb-1.5">
              저는…
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <RoleCard
                Icon={Gamepad2}
                label="게임사"
                hint="캠페인 운영"
                selected={role === 'studio'}
                selectedClass="border-primary bg-primary-dim"
                iconColor={role === 'studio' ? 'text-primary' : 'text-text-secondary'}
                onClick={() => setRole('studio')}
                disabled={loading}
              />
              <RoleCard
                Icon={Video}
                label="크리에이터"
                hint="캠페인에 지원"
                selected={role === 'creator'}
                selectedClass="border-success bg-success/10"
                iconColor={role === 'creator' ? 'text-success' : 'text-text-secondary'}
                onClick={() => setRole('creator')}
                disabled={loading}
              />
            </div>
          </fieldset>
        </>
      )}

      <div className="mb-4">
        <Input
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <Input
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isSignup ? '6자 이상' : '비밀번호를 입력하세요'}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={6}
          required
          disabled={loading}
        />
        {!isSignup && (
          <p className="mt-1.5 text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-text-secondary hover:text-primary transition-colors duration-150 ease-out"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant={isSignup ? 'launch' : 'primary'}
        size="lg"
        full
        loading={loading}
      >
        {isSignup ? '계정 만들기' : '로그인'}
      </Button>

      <p className="text-center mt-6 text-sm text-text-secondary">
        {isSignup ? (
          <>
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary hover:underline">
              로그인
            </Link>
          </>
        ) : (
          <>
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              회원가입
            </Link>
          </>
        )}
      </p>
      </Card>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
function RoleCard({
  Icon,
  label,
  hint,
  selected,
  selectedClass,
  iconColor,
  onClick,
  disabled,
}: {
  Icon: typeof Gamepad2;
  label: string;
  hint: string;
  selected: boolean;
  selectedClass: string;
  iconColor: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Card
      padding="md"
      hover
      onClick={disabled ? undefined : onClick}
      role="button"
      aria-pressed={selected}
      className={[
        'flex flex-col items-center justify-center gap-1.5 text-center',
        selected ? 'border-primary bg-primary-dim' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <Icon size={20} className={selected ? 'text-primary' : 'text-text-secondary'} aria-hidden />
      <span className="text-sm font-medium text-text-primary leading-none">
        {label}
      </span>
      <span className="text-[11px] text-text-secondary leading-none">{hint}</span>
    </Card>
  );
}
