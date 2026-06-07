'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { Alert, Button, Card, Input } from '@/components/ui';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

export function ForgotPasswordForm() {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    setError(null);
    setLoading(true);

    void (async () => {
      try {
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      } catch {
        // 계정 존재 여부를 노출하지 않기 위해 오류를 표시하지 않음.
      } finally {
        setSuccess(true);
        setLoading(false);
      }
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
          비밀번호 재설정
        </h1>
        <p className="text-sm text-text-secondary text-center mt-1 mb-6">
          가입한 이메일로 재설정 링크를 보내드립니다.
        </p>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {success ? (
          <Alert variant="success" className="mb-4">
            메일함을 확인해주세요. 재설정 링크를 보냈습니다.
          </Alert>
        ) : (
          <>
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              full
              loading={loading}
            >
              재설정 링크 보내기
            </Button>
          </>
        )}

        <p className="text-center mt-6 text-sm text-text-secondary">
          <Link href="/login" className="text-primary hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </Card>
    </form>
  );
}
