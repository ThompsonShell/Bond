import { AuthShell } from '@/components/shell/AuthShell';
import { TextLink } from '@/components/ui';
import { ResetPasswordForm } from '@/features/auth/ResetPasswordForm';

export const metadata = { title: 'Parolni tiklash · bondi' };

export default function ResetPasswordPage() {
  return (
    <AuthShell footer={<TextLink href="/login">Kirishga qaytish</TextLink>}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
