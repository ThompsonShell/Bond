import { AuthShell } from '@/components/shell/AuthShell';
import { TextLink } from '@/components/ui';
import { LoginForm } from '@/features/auth/LoginForm';

export const metadata = { title: 'Kirish · bondi' };

export default function LoginPage() {
  return (
    <AuthShell
      footer={
        <>
          Hisobingiz yo’qmi? <TextLink href="/register">Ro’yxatdan o’ting</TextLink>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
