/** Browser-side client for the `/api/*` route handlers. */
import type {
  ChatMessage,
  ConversationSummary,
  Counts,
  CurrentUser,
  EventItem,
  JournalState,
  NotificationItem,
  NotificationSettings,
  Person,
  Post,
  PostView,
} from './types';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error ?? 'Xatolik yuz berdi');
  return data as T;
}

const q = (params: Record<string, string | undefined>) => {
  const s = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1])).toString();
  return s ? `?${s}` : '';
};

export const api = {
  login: (email: string, password: string) => request<{ ok: true }>('POST', '/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => request<{ ok: true }>('POST', '/auth/register', { name, email, password }),
  resetPassword: (email: string) => request<{ ok: true; email: string }>('POST', '/auth/reset-password', { email }),
  logout: () => request<{ ok: true }>('POST', '/auth/logout'),

  me: () => request<CurrentUser>('GET', '/me'),
  updateMe: (patch: Partial<CurrentUser>) => request<CurrentUser>('PATCH', '/me', patch),
  counts: () => request<Counts>('GET', '/counts'),

  journal: () => request<JournalState>('GET', '/journal'),
  saveJournal: (mood: string, note: string) => request<JournalState>('POST', '/journal', { mood, note }),
  editJournal: () => request<JournalState>('DELETE', '/journal'),

  posts: (tab: string) => request<PostView[]>('GET', `/posts${q({ tab })}`),
  createPost: (text: string) => request<PostView>('POST', '/posts', { text }),
  toggleLike: (id: string) => request<Post>('POST', `/posts/${id}/like`),

  matches: (topic?: string) => request<Person[]>('GET', `/matches${q({ topic })}`),
  toggleInvite: (id: string) => request<Person>('POST', `/matches/${id}/invite`),
  people: (search: string, topic: string) => request<Person[]>('GET', `/people${q({ q: search, topic })}`),
  toggleRequest: (id: string) => request<Person>('POST', `/people/${id}/request`),

  events: (opts: { q?: string; topic?: string; going?: boolean } = {}) =>
    request<EventItem[]>('GET', `/events${q({ q: opts.q, topic: opts.topic, going: opts.going ? '1' : undefined })}`),
  toggleGoing: (id: string) => request<EventItem>('POST', `/events/${id}/going`),

  chats: () => request<ConversationSummary[]>('GET', '/chats'),
  openChat: (id: string) => request<ChatMessage[]>('GET', `/chats/${id}`),
  sendMessage: (id: string, text: string) => request<ChatMessage>('POST', `/chats/${id}/messages`, { text }),

  notifications: () => request<NotificationItem[]>('GET', '/notifications'),
  readNotification: (id: string) => request<NotificationItem>('POST', `/notifications/${id}/read`),
  readAllNotifications: () => request<NotificationItem[]>('POST', '/notifications/read-all'),

  settings: () => request<NotificationSettings>('GET', '/settings'),
  updateSettings: (patch: Partial<NotificationSettings>) => request<NotificationSettings>('PATCH', '/settings', patch),
};
