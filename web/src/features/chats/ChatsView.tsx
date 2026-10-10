'use client';

import { useEffect, useRef, useState } from 'react';
import { useCounts } from '@/components/shell/CountsProvider';
import { Icon } from '@/components/icons';
import { Avatar, Badge, Button, Card, EmptyState, H2, InlineError, Input, Meta } from '@/components/ui';
import { cx } from '@/components/ui/cx';
import { api, ApiError } from '@/lib/api';
import type { ChatMessage, ConversationSummary } from '@/lib/types';
import ui from '@/components/ui/ui.module.css';
import s from './chats.module.css';

export function ChatsView({ initialList, initialId, initialThread }: { initialList: ConversationSummary[]; initialId: string | null; initialThread: ChatMessage[] }) {
  const counts = useCounts();
  const [list, setList] = useState(initialList);
  const [currentId, setCurrentId] = useState(initialId);
  const [thread, setThread] = useState(initialThread);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const current = list.find((c) => c.personId === currentId) ?? null;

  // The server marked the initially opened conversation as read; sync the menu badge.
  useEffect(() => {
    counts.refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [thread]);

  async function open(id: string) {
    setCurrentId(id);
    setError(null);
    setList((l) => l.map((c) => (c.personId === id ? { ...c, unread: 0 } : c)));
    setThread(await api.openChat(id));
    counts.refresh();
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!currentId) return;
    if (!draft.trim()) return setError('Avval xabar yozing');
    try {
      const msg = await api.sendMessage(currentId, draft);
      setThread((t) => [...t, msg]);
      setDraft('');
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xabar yuborilmadi');
    }
  }

  if (list.length === 0) return <EmptyState title="Hali suhbat yo’q" text="Mos sheriklarga yozing — suhbatlar shu yerda ko’rinadi." />;

  return (
    <div className={s.layout}>
      <section aria-label="Suhbatlar" className={s.list}>
        {list.map((c) => (
          <button key={c.personId} type="button" aria-pressed={c.personId === currentId} className={s.conv} onClick={() => open(c.personId)}>
            <Avatar initials={c.initials} size={40} />
            <span className={s.convText}>
              <span className={s.convName}>{c.name}</span>
              <span className={cx(ui.meta, s.ellipsis)}>
                {c.sub}
              </span>
            </span>
            <Badge count={c.unread} label={`${c.unread} ta o’qilmagan`} />
          </button>
        ))}
      </section>

      {current && (
        <Card aria-label="Suhbat" className={s.thread}>
          <div className={s.threadHead}>
            <Avatar initials={current.initials} size={40} />
            <div style={{ minWidth: 0 }}>
              <H2>{current.name}</H2>
              <Meta>{current.sub}</Meta>
            </div>
          </div>

          <div className={s.messages} aria-live="polite">
            {thread.map((m) =>
              m.kind === 'session' ? (
                <div key={m.id} className={s.session}>
                  <Meta>{m.title}</Meta>
                  <div className={s.sessionWhen}>{m.when}</div>
                  <div className={s.sessionStatus}>
                    <Icon name="check" size={16} />
                    <span>{m.status}</span>
                  </div>
                </div>
              ) : (
                <div key={m.id} className={cx(s.bubble, m.from === 'me' && s.mine)}>
                  {m.text}
                </div>
              ),
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className={s.composer}>
            <div className={s.composerRow}>
              <Input
                type="text"
                aria-label="Xabar"
                placeholder="Xabar yozing"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError(null);
                }}
              />
              <Button type="submit" style={{ flex: 'none' }}>
                Yuborish
              </Button>
            </div>
            {error && <InlineError>{error}</InlineError>}
          </form>
        </Card>
      )}
    </div>
  );
}
