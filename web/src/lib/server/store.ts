import {
  mockConversations,
  mockEvents,
  mockJournal,
  mockNotifications,
  mockNotificationSettings,
  mockPeople,
  mockPosts,
  mockUser,
} from '../mock-data';
import type {
  ChatMessage,
  Conversation,
  ConversationSummary,
  Counts,
  CurrentUser,
  EventItem,
  FeedTab,
  JournalState,
  Mood,
  NotificationItem,
  NotificationSettings,
  Person,
  Post,
  PostView,
  StudyTime,
  Topic,
} from '../types';
import { MOODS, STUDY_TIMES, TOPICS } from '../types';

/**
 * In-memory data store seeded from the mock layer.
 * Swap this module for real API/database calls when the backend is ready;
 * the route handlers and server pages only talk to the functions below.
 */
interface DB {
  user: CurrentUser;
  people: Person[];
  posts: Post[];
  events: EventItem[];
  conversations: Conversation[];
  notifications: NotificationItem[];
  journal: { today: { mood: Mood; note: string } | null; streakBeforeToday: number };
  settings: NotificationSettings;
  seq: number;
}

function seed(): DB {
  const clone = <T,>(v: T): T => structuredClone(v);
  return {
    user: clone(mockUser),
    people: clone(mockPeople),
    posts: clone(mockPosts),
    events: clone(mockEvents),
    conversations: clone(mockConversations),
    notifications: clone(mockNotifications),
    journal: { today: null, streakBeforeToday: mockJournal.streakBeforeToday },
    settings: clone(mockNotificationSettings),
    seq: 1,
  };
}

// Survive hot reloads in development.
const g = globalThis as unknown as { __bondiDb?: DB };
const db: DB = (g.__bondiDb ??= seed());

export class StoreError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const nextId = (prefix: string) => `${prefix}${Date.now().toString(36)}${db.seq++}`;

function person(id: string): Person {
  const p = db.people.find((x) => x.id === id);
  if (!p) throw new StoreError(404, 'Topilmadi');
  return p;
}

/* ───────── Current user ───────── */

export function getUser(): CurrentUser {
  return db.user;
}

export function updateUser(patch: Partial<Pick<CurrentUser, 'name' | 'email' | 'university' | 'topics' | 'studyTimes'>>): CurrentUser {
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) throw new StoreError(400, 'Ism bo’sh bo’lmasligi kerak');
    db.user.name = name;
    db.user.initials = initialsOf(name, db.user.initials);
  }
  if (patch.email !== undefined) {
    const email = patch.email.trim();
    if (!isEmail(email)) throw new StoreError(400, 'Email manzilini to’liq kiriting');
    db.user.email = email;
  }
  if (patch.university !== undefined) db.user.university = patch.university.trim();
  if (patch.topics !== undefined) db.user.topics = patch.topics.filter((t): t is Topic => TOPICS.includes(t));
  if (patch.studyTimes !== undefined) db.user.studyTimes = patch.studyTimes.filter((t): t is StudyTime => STUDY_TIMES.includes(t));
  return db.user;
}

export function isEmail(v: string): boolean {
  return v.indexOf('@') > 0 && v.indexOf('.') > 0 && !/\s/.test(v);
}

function initialsOf(name: string, fallback: string): string {
  const parts = name.trim().split(/\s+/);
  const letters = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  return letters ? letters.toUpperCase() : fallback;
}

/* ───────── Badges ───────── */

export function getCounts(): Counts {
  return {
    unreadChats: db.conversations.reduce((n, c) => n + c.unread, 0),
    unreadNotifications: db.notifications.filter((n) => !n.read).length,
  };
}

/* ───────── Daily journal ───────── */

export function getJournal(): JournalState {
  const saved = !!db.journal.today;
  const streak = db.journal.streakBeforeToday + (saved ? 1 : 0);
  const week = Array.from({ length: 7 }, (_, i) => (i < 6 ? i >= 6 - db.journal.streakBeforeToday : saved));
  return { today: db.journal.today, streak, week };
}

export function saveJournal(mood: string, note: string): JournalState {
  if (!MOODS.includes(mood as Mood)) throw new StoreError(400, 'Avval kayfiyatni tanlang');
  db.journal.today = { mood: mood as Mood, note: note.trim().slice(0, 500) };
  return getJournal();
}

export function clearJournalToday(): JournalState {
  db.journal.today = null;
  return getJournal();
}

/* ───────── Feed ───────── */

export function getPosts(tab: FeedTab = 'Barchasi'): PostView[] {
  return db.posts
    .filter((p) => tab === 'Barchasi' || p.feed === tab)
    .map((p) => {
      const a = p.authorId === db.user.id ? db.user : person(p.authorId);
      return { ...p, author: { id: a.id, name: a.name, initials: a.initials } };
    });
}

export function createPost(text: string): PostView {
  const body = text.trim();
  if (!body) throw new StoreError(400, 'Avval post matnini yozing');
  const post: Post = {
    id: nextId('p'),
    authorId: db.user.id,
    tag: db.user.topics[0] ?? 'AI',
    university: db.user.university,
    timeAgo: 'Hozirgina',
    text: body.slice(0, 2000),
    likes: 0,
    liked: false,
    comments: 0,
    feed: 'Do’stlar',
  };
  db.posts.unshift(post);
  return getPosts().find((p) => p.id === post.id)!;
}

export function toggleLike(postId: string): Post {
  const p = db.posts.find((x) => x.id === postId);
  if (!p) throw new StoreError(404, 'Post topilmadi');
  p.liked = !p.liked;
  p.likes += p.liked ? 1 : -1;
  return p;
}

/* ───────── People, matching, discover ───────── */

export function getMatches(topic?: string): Person[] {
  return db.people
    .filter((p) => p.matchPercent > 0)
    .filter((p) => !topic || topic === 'Barchasi' || p.tags.includes(topic as Topic))
    .sort((a, b) => b.matchPercent - a.matchPercent);
}

export function toggleInvite(personId: string): Person {
  const p = person(personId);
  p.invited = !p.invited;
  return p;
}

export function searchPeople(q = '', topic = 'Barchasi'): Person[] {
  const needle = q.trim().toLowerCase();
  return db.people.filter((p) => matches(p.name, p.tags, needle, topic));
}

export function toggleRequest(personId: string): Person {
  const p = person(personId);
  p.requested = !p.requested;
  return p;
}

function matches(text: string, tags: Topic[], needle: string, topic: string): boolean {
  const okTopic = topic === 'Barchasi' || tags.includes(topic as Topic);
  const okQ = !needle || `${text} ${tags.join(' ')}`.toLowerCase().includes(needle);
  return okTopic && okQ;
}

/* ───────── Events ───────── */

export function getEvents(opts: { q?: string; topic?: string; going?: boolean } = {}): EventItem[] {
  const needle = (opts.q ?? '').trim().toLowerCase();
  return db.events
    .filter((e) => !opts.going || e.going)
    .filter((e) => matches(`${e.title} ${e.place}`, e.tags, needle, opts.topic ?? 'Barchasi'));
}

export function toggleGoing(eventId: string): EventItem {
  const e = db.events.find((x) => x.id === eventId);
  if (!e) throw new StoreError(404, 'Tadbir topilmadi');
  e.going = !e.going;
  return e;
}

/* ───────── Chats ───────── */

export function getConversations(): ConversationSummary[] {
  return db.conversations.map((c) => {
    const p = person(c.personId);
    return { personId: c.personId, name: p.name, initials: p.initials, sub: c.sub, unread: c.unread };
  });
}

function conversation(personId: string): Conversation {
  const c = db.conversations.find((x) => x.personId === personId);
  if (!c) throw new StoreError(404, 'Suhbat topilmadi');
  return c;
}

/** Returns the thread and marks it as read. */
export function openConversation(personId: string): ChatMessage[] {
  const c = conversation(personId);
  c.unread = 0;
  return c.messages;
}

export function sendMessage(personId: string, text: string): ChatMessage {
  const body = text.trim();
  if (!body) throw new StoreError(400, 'Avval xabar yozing');
  const msg: ChatMessage = { id: nextId('m'), kind: 'text', from: 'me', text: body.slice(0, 2000) };
  conversation(personId).messages.push(msg);
  return msg;
}

/* ───────── Notifications ───────── */

export function getNotifications(): NotificationItem[] {
  return db.notifications;
}

export function markNotificationRead(id: string): NotificationItem {
  const n = db.notifications.find((x) => x.id === id);
  if (!n) throw new StoreError(404, 'Bildirishnoma topilmadi');
  n.read = true;
  return n;
}

export function markAllNotificationsRead(): NotificationItem[] {
  db.notifications.forEach((n) => (n.read = true));
  return db.notifications;
}

/* ───────── Settings ───────── */

export function getSettings(): NotificationSettings {
  return db.settings;
}

export function updateSettings(patch: Partial<NotificationSettings>): NotificationSettings {
  for (const key of ['match', 'chat', 'event'] as const) {
    if (typeof patch[key] === 'boolean') db.settings[key] = patch[key];
  }
  return db.settings;
}
