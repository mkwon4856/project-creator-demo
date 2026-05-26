import { Suspense } from 'react';

import { AuthForm } from '../_components/AuthForm';

export const metadata = {
  title: 'Sign up · Project Creator',
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
