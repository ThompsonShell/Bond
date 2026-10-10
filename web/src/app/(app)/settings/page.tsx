import { PageMain } from '@/components/shell/PageMain';
import { H1 } from '@/components/ui';
import { SettingsView } from '@/features/settings/SettingsView';
import { cookies } from 'next/headers';
import { getSettings, getUser } from '@/lib/server/store';
import { modeOf, resolveTheme, THEME_COOKIE } from '@/lib/theme';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sozlamalar · bondi' };

export default async function SettingsPage() {
  const user = getUser();
  const mode = modeOf(resolveTheme((await cookies()).get(THEME_COOKIE)?.value));
  return (
    <PageMain narrow>
      <H1>Sozlamalar</H1>
      <SettingsView user={{ name: user.name, email: user.email }} initialSettings={getSettings()} initialMode={mode} />
    </PageMain>
  );
}
