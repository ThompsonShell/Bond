import { PageMain } from '@/components/shell/PageMain';
import { H1, Meta } from '@/components/ui';
import { MatchingView } from '@/features/matching/MatchingView';
import { getMatches } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'AI Matching · bondi' };

export default function MatchingPage() {
  return (
    <PageMain>
      <div>
        <H1>AI Matching</H1>
        <Meta style={{ fontSize: 14 }}>Yo’nalishingiz va tanishlaringiz bo’yicha eng mos sheriklar.</Meta>
      </div>
      <MatchingView initial={getMatches()} />
    </PageMain>
  );
}
