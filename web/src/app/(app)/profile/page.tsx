import { PageMain } from '@/components/shell/PageMain';
import { Avatar, ButtonLink, Card, EmptyState, H1, H2, Meta, StreakDots } from '@/components/ui';
import { ProfileTopics } from '@/features/profile/ProfileTopics';
import s from '@/features/profile/profile.module.css';
import { getJournal, getPosts, getUser } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Profil · bondi' };

export default function ProfilePage() {
  const user = getUser();
  const journal = getJournal();
  const myPosts = getPosts().filter((p) => p.authorId === user.id);
  const filled = journal.week.filter(Boolean).length;

  return (
    <PageMain narrow>
      <Card className={s.header}>
        <Avatar initials={user.initials} size={72} self />
        <div className={s.who}>
          <H1>{user.name}</H1>
          <Meta style={{ fontSize: 14 }}>{user.email}</Meta>
        </div>
        <ButtonLink href="/settings" variant="secondary">
          Profilni tahrirlash
        </ButtonLink>
      </Card>

      <ProfileTopics initial={user.topics} />

      <Card className={s.streak}>
        <div>
          <H2>Kundalik</H2>
          <Meta>{journal.streak} kunlik seriya</Meta>
        </div>
        <StreakDots week={journal.week} large label={`7 kundan ${filled} kuni to’ldirilgan`} />
      </Card>

      {myPosts.length === 0 ? (
        <EmptyState
          title="Hali post yozmadingiz"
          text="Nima o’rganayotganingizni ulashing, hamfikrlar sizni osonroq topadi."
          action={
            <ButtonLink href="/" variant="secondary">
              Post yozish
            </ButtonLink>
          }
        />
      ) : (
        <Card className={s.section}>
          <H2>Postlarim</H2>
          {myPosts.map((p) => (
            <div key={p.id}>
              <Meta>{p.timeAgo}</Meta>
              <p style={{ lineHeight: 1.55 }}>{p.text}</p>
            </div>
          ))}
        </Card>
      )}
    </PageMain>
  );
}
