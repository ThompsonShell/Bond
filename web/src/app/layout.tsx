import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { resolveTheme, THEME_COOKIE } from '@/lib/theme';
import './globals.css';

const geist = Geist({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'bondi',
  description: 'Talabalar uchun hamfikr va dars sherigini topish, yozishish, tadbirlarga borish.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const theme = resolveTheme((await cookies()).get(THEME_COOKIE)?.value);
  return (
    <html lang="uz" data-theme={theme} className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
