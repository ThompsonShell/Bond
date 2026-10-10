export type Topic = 'AI' | 'Python' | 'ML' | 'Web Dev' | 'Mobile' | 'Flutter' | 'UI/UX' | 'Backend' | 'Data Science';

export const TOPICS: Topic[] = ['AI', 'Python', 'ML', 'Web Dev', 'Mobile', 'Flutter', 'UI/UX', 'Backend', 'Data Science'];

export const STUDY_TIMES = ['Ertalab', 'Kunduzi', 'Kechqurun', 'Dam olish kunlari'] as const;
export type StudyTime = (typeof STUDY_TIMES)[number];

export const MOODS = ['Zo’r', 'Yaxshi', 'O’rtacha', 'Charchagan', 'Xafa'] as const;
export type Mood = (typeof MOODS)[number];

export const FEED_TABS = ['Barchasi', 'Do’stlar', 'Guruhlar', 'Tadbirlar'] as const;
export type FeedTab = (typeof FEED_TABS)[number];

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  university: string;
  topics: Topic[];
  studyTimes: StudyTime[];
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  tags: Topic[];
  /** Short extra line, e.g. university or "3 umumiy do’st". */
  extra: string;
  university: string;
  matchPercent: number;
  /** Two human-readable reasons shown on the matching card. */
  reasons: [string, string];
  /** Sub-line shown in "Siz uchun mos" lists. */
  matchNote: string;
  requested: boolean;
  invited: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  tag: Topic;
  university: string;
  timeAgo: string;
  text: string;
  likes: number;
  liked: boolean;
  comments: number;
  feed: Exclude<FeedTab, 'Barchasi'>;
}

export interface PostView extends Post {
  author: Pick<Person, 'id' | 'name' | 'initials'>;
}

export interface EventItem {
  id: string;
  month: string;
  day: string;
  title: string;
  place: string;
  dateLabel: string;
  tags: Topic[];
  going: boolean;
}

export type ChatMessage =
  | { id: string; kind: 'text'; from: 'me' | 'them'; text: string }
  | { id: string; kind: 'session'; title: string; when: string; status: string };

export interface Conversation {
  personId: string;
  sub: string;
  unread: number;
  messages: ChatMessage[];
}

export interface ConversationSummary {
  personId: string;
  name: string;
  initials: string;
  sub: string;
  unread: number;
}

export type NotificationKind = 'match' | 'post' | 'event';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  text: string;
  meta: string;
  read: boolean;
}

export interface JournalState {
  /** Today's entry, if saved. */
  today: { mood: Mood; note: string } | null;
  /** Streak in days, including today when saved. */
  streak: number;
  /** Last 7 days, oldest first; true when the journal was filled that day. */
  week: boolean[];
}

export interface NotificationSettings {
  match: boolean;
  chat: boolean;
  event: boolean;
}

export interface Counts {
  unreadChats: number;
  unreadNotifications: number;
}
