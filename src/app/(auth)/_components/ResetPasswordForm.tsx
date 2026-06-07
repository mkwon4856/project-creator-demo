'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

import { Alert, Button, Card, Input } from '@/components/ui';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

export function ResetPasswordForm() {
  const supabase = createBrowserSupabaseClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const client = createBrowserSupabaseClient();

    const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' || session) {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    void client.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) {
        setSessionReady(true);
      }
      setCheckingSession(false);
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    void (async () => {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setLoading(false);
    })();
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
          새 비밀번호 설정
        </h1>
        <p className="text-sm text-text-secondary text-center mt-1 mb-6">
          새 비밀번호를 입력해주세요.
        </p>

        {checkingSession ? (
          <p className="text-sm text-text-secondary text-center py-4">확인 중…</p>
        ) : !sessionReady && !success ? (
          <Alert variant="warning" className="mb-4">
            유효하지 않거나 만료된 재설정 링크입니다.{' '}
            <Link href="/forgot-password" className="text-primary hover:underline">
              다시 요청하기
            </Link>
          </Alert>
        ) : null}

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {success ? (
          <Alert variant="success" className="mb-4">
            비밀번호가 변경되었습니다.{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              로그인하기
            </Link>
          </Alert>
        ) : sessionReady && !checkingSession ? (
          <>
            <div className="mb-4">
              <Input
                label="새 비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <Input
                label="비밀번호 확인"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              full
              loading={loading}
            >
              비밀번호 변경
            </Button>
          </>
        ) : null}

        {!success && (
          <p className="text-center mt-6 text-sm text-text-secondary">
            <Link href="/login" className="text-primary hover:underline">
              로그인으로 돌아가기
            </Link>
          </p>
        )}
      </Card>
    </form>
  );
}
