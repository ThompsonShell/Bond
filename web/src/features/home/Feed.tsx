'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Avatar, Button, Card, Chip, EmptyState, InlineError, Meta, Tabs } from '@/components/ui';
import { cx } from '@/components/ui/cx';
import { api, ApiError } from '@/lib/api';
import { FEED_TABS, type CurrentUser, type FeedTab, type PostView } from '@/lib/types';
import s from './home.module.css';

export function Feed({ user, initial }: { user: Pick<CurrentUser, 'initials'>; initial: PostView[] }) {
  const [tab, setTab] = useState<FeedTab>('Barchasi');
  const [posts, setPosts] = useState(initial);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function changeTab(t: FeedTab) {
    setTab(t);
    setPosts(await api.posts(t));
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return setError('Avval post matnini yozing');
    try {
      const post = await api.createPost(draft);
      setDraft('');
      setError(null);
      if (tab === 'Barchasi' || tab === post.feed) setPosts((p) => [post, ...p]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Post yuborilmadi');
    }
  }

  async function like(id: string) {
    const updated = await api.toggleLike(id);
    setPosts((list) => list.map((p) => (p.id === id ? { ...p, liked: updated.liked, likes: updated.likes } : p)));
  }

  return (
    <>
      <Card as="form" aria-label="Yangi post" className={s.composer} onSubmit={publish}>
        <Avatar initials={user.initials} size={32} self />
        <input
          className={s.composerInput}
          type="text"
          aria-label="Nima ulashmoqchisiz?"
          placeholder="Nima ulashmoqchisiz?"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
        />
        {/* Image upload is not designed yet (HANDOFF §12). */}
        <Button variant="ghost" iconOnly aria-label="Rasm qo’shish (tez orada)" disabled>
          <Icon name="image" />
        </Button>
        <Button variant="secondary" type="submit" style={{ flex: 'none' }}>
          Post
        </Button>
      </Card>
      {error && <InlineError>{error}</InlineError>}

      <Tabs label="Lenta" items={FEED_TABS.map((t) => ({ id: t, label: t }))} value={tab} onChange={changeTab} />

      {posts.length === 0 ? (
        <EmptyState title="Bu bo’limda hali post yo’q" text="Yangi postlar shu yerda ko’rinadi." />
      ) : (
        posts.map((p) => (
          <Card as="article" key={p.id} className={s.post}>
            <div className={s.author}>
              <Avatar initials={p.author.initials} size={40} self={p.authorId === 'me'} />
              <div style={{ minWidth: 0 }}>
                <div className={s.authorLine}>
                  <span className={s.authorName}>{p.author.name}</span>
                  <Chip>{p.tag}</Chip>
                </div>
                <Meta>
                  {p.university} · {p.timeAgo}
                </Meta>
              </div>
            </div>
            <p className={s.postText}>{p.text}</p>
            <div className={s.actions}>
              <Button variant="ghost" aria-label="Yoqdi" aria-pressed={p.liked} onClick={() => like(p.id)} className={cx(s.tabular, p.liked && s.liked)}>
                <Icon name="heart" filled={p.liked} />
                {p.likes > 0 && <span>{p.likes}</span>}
              </Button>
              {/* The comment list is not designed yet (HANDOFF §12). */}
              <Button variant="ghost" aria-label={p.comments ? `Izohlar, ${p.comments} ta` : 'Izoh yozish'} className={s.tabular} disabled>
                <Icon name="chat" />
                {p.comments > 0 && <span>{p.comments}</span>}
              </Button>
            </div>
          </Card>
        ))
      )}
    </>
  );
}
