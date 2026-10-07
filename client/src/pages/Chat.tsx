import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { get, post, type Conversation, type Message, type PublicUser, type Session } from '../api';
import { BackIcon, PlusCircleIcon, SearchIcon, SendIcon, VideoIcon } from '../components/Icons';
import { ProposeSessionModal, SessionProposal } from '../components/Sessions';
import { Avatar, Empty, ErrorBox, Loader } from '../components/ui';
import { errMsg, firstName, timeAgo, timeHM, useFetch, useIsMobile } from '../lib';
import { useApp } from '../state';

export function ChatPage() {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const otherId = id ? Number(id) : null;

  return (
    <div className="chat-page">
      {(!isMobile || !otherId) && <ConversationList activeId={otherId} />}
      {otherId ? (
        <Conversation key={otherId} otherId={otherId} />
      ) : (
        !isMobile && (
          <div className="chat-empty">
            <Empty title="Suhbatni tanlang" hint="Chap tomondagi ro'yxatdan sherigingizni tanlang yoki Mos sheriklar bo'limidan yangi sherik toping." />
          </div>
        )
      )}
    </div>
  );
}

function ConversationList({ activeId }: { activeId: number | null }) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useFetch<{ conversations: Conversation[] }>(
    `/chat/conversations?filter=${filter}${q ? `&q=${encodeURIComponent(q)}` : ''}`,
    5000,
  );

  return (
    <aside className="conv-list">
      <div className="conv-list-head">
        <h2>Xabarlar</h2>
        <div className="conv-search">
          <SearchIcon size={14} />
          <input placeholder="Qidirish..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Suhbatlarni qidirish" />
        </div>
        <div className="seg mob-only">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            Hammasi
          </button>
          <button className={filter === 'unread' ? 'active' : ''} onClick={() => setFilter('unread')}>
            O'qimagan
          </button>
        </div>
      </div>
      <div className="conv-items">
        {loading && !data ? (
          <Loader />
        ) : error ? (
          <ErrorBox message={error} onRetry={() => reload()} />
        ) : data!.conversations.length === 0 ? (
          <Empty title={filter === 'unread' ? "O'qilmagan xabar yo'q" : "Hali suhbat yo'q"} hint="Mos sheriklar bo'limidan sherik toping." />
        ) : (
          data!.conversations.map((c) => (
            <Link key={c.user.id} to={`/chat/${c.user.id}`} className={`conv ${activeId === c.user.id ? 'active' : ''}`}>
              <Avatar name={c.user.name} color={c.user.avatarColor} size={44} radius={14} online={c.user.online} />
              <div className="conv-text">
                <div className="conv-top">
                  <b className="desk-only">{firstName(c.user.name)}</b>
                  <b className="mob-only">{c.user.name}</b>
                  <small>{timeAgo(c.lastMessage.createdAt)}</small>
                </div>
                <div className={`conv-preview ${c.unread ? 'unread' : ''}`}>{preview(c.lastMessage)}</div>
              </div>
              {c.unread > 0 && <em className="conv-badge">{c.unread}</em>}
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}

function preview(m: Message) {
  if (m.kind === 'session') return `📅 Seans taklifi: ${m.session?.title ?? ''}`;
  return m.body;
}

function Conversation({ otherId }: { otherId: number }) {
  const { toast, refreshUnread } = useApp();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [params, setParams] = useSearchParams();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [proposing, setProposing] = useState(false);
  const lastId = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  const load = useCallback(
    async (initial = false) => {
      try {
        const r = await get<{ user: PublicUser; messages: Message[] }>(`/chat/conversations/${otherId}/messages?after=${initial ? 0 : lastId.current}`);
        setUser(r.user);
        if (r.messages.length) {
          lastId.current = r.messages[r.messages.length - 1].id;
          setMessages((m) => (initial ? r.messages : [...m, ...r.messages.filter((x) => !m.some((y) => y.id === x.id))]));
          refreshUnread();
        }
        setError(null);
      } catch (e) {
        if (initial) setError(errMsg(e));
      }
    },
    [otherId, refreshUnread],
  );

  useEffect(() => {
    lastId.current = 0;
    load(true);
    // Poll for new messages; every 5th tick refresh everything so session cards pick up status changes.
    let tick = 0;
    const t = setInterval(() => document.visibilityState === 'visible' && load(++tick % 5 === 0), 3000);
    return () => clearInterval(t);
  }, [load]);

  // "Qo'shilish" from home/map arrives with ?join=1 — prefill a friendly request.
  useEffect(() => {
    if (params.get('join') && user) {
      setText(
        user.placeType === 'online'
          ? `Salom ${firstName(user.name)}! Online birga o'qiymizmi?`
          : `Salom ${firstName(user.name)}! ${user.place}da sizga qo'shilsam bo'ladimi?`,
      );
      params.delete('join');
      setParams(params, { replace: true });
    }
  }, [params, setParams, user]);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const r = await post<{ message: Message }>(`/chat/conversations/${otherId}/messages`, { body });
      stick.current = true;
      setText('');
      setMessages((m) => [...m, r.message]);
      lastId.current = Math.max(lastId.current, r.message.id);
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setSending(false);
    }
  }

  function updateSession(s: Session) {
    setMessages((ms) => ms.map((m) => (m.session?.id === s.id ? { ...m, session: s } : m)));
  }

  if (error) return <div className="chat-empty"><ErrorBox message={error} onRetry={() => load(true)} /></div>;
  if (!user) return <div className="chat-empty"><Loader /></div>;

  return (
    <section className="convo">
      <header className="convo-head">
        {isMobile && (
          <button className="icon-btn" onClick={() => navigate('/chat')} aria-label="Orqaga">
            <BackIcon />
          </button>
        )}
        <Link to={`/u/${user.id}`} className="convo-user">
          <Avatar name={user.name} color={user.avatarColor} size={40} radius={12} />
          <span>
            <b>{user.name}</b>
            <small>
              {user.online ? 'Online' : 'Offline'}
              {user.place && !isMobile ? ` · ${user.place}` : ''}
            </small>
          </span>
        </Link>
        <button
          className="icon-btn"
          onClick={() => toast("Video qo'ng'iroq tez orada qo'shiladi", 'info')}
          aria-label="Video qo'ng'iroq"
          title="Video qo'ng'iroq"
        >
          <VideoIcon />
        </button>
      </header>

      <div
        className="messages"
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        {messages.length === 0 && <Empty title="Suhbatni boshlang" hint={`${firstName(user.name)}ga birinchi xabaringizni yozing.`} />}
        {messages.map((m) =>
          m.kind === 'session' && m.session ? (
            <div key={m.id} className={`msg-row ${m.mine ? 'mine' : ''}`}>
              <SessionProposal session={m.session} onChange={updateSession} />
            </div>
          ) : (
            <div key={m.id} className={`msg-row ${m.mine ? 'mine' : ''}`}>
              <div className="bubble">
                <p>{m.body}</p>
                <small>
                  {timeHM(m.createdAt)}
                  {m.mine && (m.readAt ? ' ✓✓' : ' ✓')}
                </small>
              </div>
            </div>
          ),
        )}
      </div>

      <form className="composer" onSubmit={send}>
        <button type="button" className="icon-btn" onClick={() => setProposing(true)} aria-label="Seans taklif qilish" title="Seans taklif qilish">
          <PlusCircleIcon size={22} />
        </button>
        <input
          placeholder="Xabar yozing..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          aria-label="Xabar"
        />
        <button type="submit" className="send-btn" disabled={!text.trim() || sending} aria-label="Yuborish">
          <SendIcon size={isMobile ? 14 : 18} />
        </button>
      </form>

      {proposing && (
        <ProposeSessionModal
          partnerId={user.id}
          defaultPlace={user.placeType === 'online' ? 'Online' : user.place}
          onClose={() => setProposing(false)}
          onCreated={() => {
            stick.current = true;
            load();
          }}
        />
      )}
    </section>
  );
}
