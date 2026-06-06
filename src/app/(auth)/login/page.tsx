import { Suspense } from 'react';

import { AuthForm } from '../_components/AuthForm';

export const metadata = {
  title: '로그인 · Project Creator',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-10">
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
