import { AuthShell } from '@/components/shell/AuthShell';
import { OnboardingTopics } from '@/features/auth/OnboardingTopics';
import { getUser } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Yo’nalishlar · bondi' };

export default function OnboardingStep1() {
  const user = getUser();
  return (
    <AuthShell wide>
      <OnboardingTopics initialTopics={user.topics} initialUniversity={user.university} />
    </AuthShell>
  );
}
