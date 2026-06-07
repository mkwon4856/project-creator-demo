import { ForgotPasswordForm } from '../_components/ForgotPasswordForm';

export const metadata = {
  title: '비밀번호 재설정',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-10">
      <ForgotPasswordForm />
    </div>
  );
}
