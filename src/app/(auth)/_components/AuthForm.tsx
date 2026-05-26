'use client';

import { Gamepad2, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { Button, Input } from '@/components/ui';
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
    if (!email) return 'Email is required.';
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (isSignup && !name.trim()) return 'Name is required.';
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
        'Email confirmation is required. Disable "Confirm email" in your Supabase dashboard, or check your inbox before signing in.',
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
        description: '',
      });
      if (studioErr) {
        setError(`Could not create studio profile: ${studioErr.message}`);
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
        setError(`Could not create creator profile: ${creatorErr.message}`);
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
      setError('Login failed.');
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
    <form
      onSubmit={handleSubmit}
      className="max-w-[420px] w-full bg-bg-card border border-white/[0.06] rounded-xl p-8"
    >
      <div className="flex justify-center mb-7">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-text-primary"
        >
          Project <span className="text-ube-bright">Creator</span>
        </Link>
      </div>

      <h1 className="text-xl font-medium text-text-primary text-center leading-tight">
        {isSignup ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="text-sm text-text-secondary text-center mt-1 mb-6">
        {isSignup
          ? 'Start as a game studio or creator'
          : 'Log in to your workspace'}
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 px-3 py-2.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/30 text-xs leading-relaxed"
        >
          {error}
        </div>
      )}

      {isSignup && (
        <>
          <div className="mb-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              autoComplete="name"
              disabled={loading}
            />
          </div>

          <fieldset className="mb-4">
            <legend className="text-xs font-medium text-text-secondary mb-1.5">
              I am a…
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <RoleCard
                Icon={Gamepad2}
                label="Game studio"
                hint="Run campaigns"
                selected={role === 'studio'}
                selectedClass="border-ube bg-ube/10"
                iconColor={role === 'studio' ? 'text-ube-bright' : 'text-text-secondary'}
                onClick={() => setRole('studio')}
                disabled={loading}
              />
              <RoleCard
                Icon={Video}
                label="Creator"
                hint="Apply to campaigns"
                selected={role === 'creator'}
                selectedClass="border-green-500 bg-green-500/10"
                iconColor={role === 'creator' ? 'text-green-400' : 'text-text-secondary'}
                onClick={() => setRole('creator')}
                disabled={loading}
              />
            </div>
          </fieldset>
        </>
      )}

      <div className="mb-4">
        <Input
          label="Email"
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
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isSignup ? 'At least 6 characters' : 'Enter your password'}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={6}
          required
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        variant={isSignup ? 'launch' : 'primary'}
        size="lg"
        full
        loading={loading}
      >
        {isSignup ? 'Create account' : 'Log in'}
      </Button>

      <p className="text-center mt-6 text-sm text-text-secondary">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-ube-bright hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-ube-bright hover:underline">
              Sign up
            </Link>
          </>
        )}
      </p>
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        'flex flex-col items-center justify-center gap-1.5 px-3 py-4 rounded-lg border transition-colors duration-150 ease-out cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ube/60',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        selected
          ? selectedClass
          : 'bg-bg-elevated border-white/10 hover:border-white/20',
      ].join(' ')}
    >
      <Icon size={20} className={iconColor} aria-hidden />
      <span className="text-sm font-medium text-text-primary leading-none">
        {label}
      </span>
      <span className="text-[11px] text-text-secondary leading-none">{hint}</span>
    </button>
  );
}
