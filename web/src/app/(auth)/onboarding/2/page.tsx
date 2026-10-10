import { AuthShell } from '@/components/shell/AuthShell';
import { OnboardingTimes } from '@/features/auth/OnboardingTimes';
import { getMatches, getUser } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dars vaqti · bondi' };

export default function OnboardingStep2() {
  return (
    <AuthShell wide>
      <OnboardingTimes initialTimes={getUser().studyTimes} suggestion={getMatches()[0] ?? null} />
    </AuthShell>
  );
}
