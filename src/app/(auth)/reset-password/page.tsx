import { ResetPasswordForm } from '../_components/ResetPasswordForm';

export const metadata = {
  title: '새 비밀번호 설정 · Project Creator',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-10">
      <ResetPasswordForm />
    </div>
  );
}
