import { AuthShell } from '@/components/shell/AuthShell';
import { TextLink } from '@/components/ui';
import { RegisterForm } from '@/features/auth/RegisterForm';

export const metadata = { title: 'Ro’yxatdan o’tish · bondi' };

export default function RegisterPage() {
  return (
    <AuthShell
      footer={
        <>
          Hisobingiz bormi? <TextLink href="/login">Kiring</TextLink>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
