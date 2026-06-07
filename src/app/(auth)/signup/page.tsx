import { Suspense } from 'react';

import { AuthForm } from '../_components/AuthForm';

export const metadata = {
  title: '회원가입',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-10">
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
