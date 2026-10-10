import Link from 'next/link';
import { Avatar, Card, DateTile, H2, MatchPercent, Meta } from '@/components/ui';
import { Feed } from '@/features/home/Feed';
import { HomeHeader } from '@/features/home/HomeHeader';
import { JournalCard } from '@/features/home/JournalCard';
import s from '@/features/home/home.module.css';
import { formatToday } from '@/lib/date';
import { getEvents, getJournal, getMatches, getPosts, getUser } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const user = getUser();
  const matches = getMatches().slice(0, 3);
  const events = getEvents().slice(0, 3);

  return (
    <div className={s.columns}>
      <main className={s.main}>
        <HomeHeader name={user.name} today={formatToday()} />
        <JournalCard initial={getJournal()} />
        <Feed user={{ initials: user.initials }} initial={getPosts()} />
      </main>

      <aside className={s.aside}>
        <Card className={s.listCard} aria-labelledby="home-matches">
          <div className={s.listHead}>
            <H2 small id="home-matches">
              Siz uchun mos
            </H2>
            <Link href="/matching">Barchasi</Link>
          </div>
          {matches.map((p) => (
            <div key={p.id} className={s.personRow}>
              <Avatar initials={p.initials} size={36} />
              <div className={s.grow}>
                <div className={s.rowTitle}>{p.name}</div>
                <Meta className={s.ellipsis}>{p.matchNote}</Meta>
              </div>
              <MatchPercent value={p.matchPercent} />
            </div>
          ))}
        </Card>

        <Card className={s.listCard} aria-labelledby="home-events">
          <div className={s.listHead}>
            <H2 small id="home-events">
              Yaqin tadbirlar
            </H2>
            <Link href="/events">Barchasi</Link>
          </div>
          {events.map((e, i) => (
            <div key={e.id} className={s.eventRow}>
              <DateTile month={e.month} day={e.day} tone={i === 0 ? 'accent' : 'neutral'} />
              <div style={{ minWidth: 0 }}>
                <div className={s.rowTitle}>{e.title}</div>
                <Meta>{e.place}</Meta>
              </div>
            </div>
          ))}
        </Card>
      </aside>
    </div>
  );
}
