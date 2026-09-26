// lib/library.ts
// Reusable localStorage utilities for the Library feature (Starred, Recent, Shared)

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface RecentItem {
  id: string;
  type: 'meeting' | 'note';
  title: string;
  accessedAt: string; // ISO
}

export interface SharedItem {
  meetingId: string;
  meetingTitle: string;
  sharedWith: string;
  sharedBy: string;
  sharedAt: string; // ISO
}

// ─────────────────────────────────────────────
// KEYS
// ─────────────────────────────────────────────

const STARRED_MEETINGS_KEY = 'ff_starred_meetings';
const RECENT_KEY = 'ff_recent_items';
const SHARED_KEY = 'ff_shared_items';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

function setJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─────────────────────────────────────────────
// STARRED MEETINGS
// ─────────────────────────────────────────────

export function getStarredMeetingIds(): string[] {
  return getJSON<string[]>(STARRED_MEETINGS_KEY, []);
}

export function isMeetingStarred(id: string): boolean {
  return getStarredMeetingIds().includes(id);
}

export function toggleStarredMeeting(id: string): boolean {
  const current = getStarredMeetingIds();
  const alreadyStarred = current.includes(id);
  const updated = alreadyStarred ? current.filter((x) => x !== id) : [...current, id];
  setJSON(STARRED_MEETINGS_KEY, updated);
  // Dispatch so other components can react
  window.dispatchEvent(new CustomEvent('ff_starred_changed'));
  return !alreadyStarred;
}

// ─────────────────────────────────────────────
// RECENT ITEMS
// ─────────────────────────────────────────────

const MAX_RECENT = 20;

export function getRecentItems(): RecentItem[] {
  return getJSON<RecentItem[]>(RECENT_KEY, []);
}

export function addRecentItem(item: Omit<RecentItem, 'accessedAt'>): void {
  if (typeof window === 'undefined') return;
  const existing = getRecentItems().filter(
    (r) => !(r.id === item.id && r.type === item.type)
  );
  const updated: RecentItem[] = [
    { ...item, accessedAt: new Date().toISOString() },
    ...existing,
  ].slice(0, MAX_RECENT);
  setJSON(RECENT_KEY, updated);
}

export function clearRecentItems(): void {
  setJSON(RECENT_KEY, []);
}

// ─────────────────────────────────────────────
// SHARED ITEMS
// ─────────────────────────────────────────────

export function getSharedItems(): SharedItem[] {
  return getJSON<SharedItem[]>(SHARED_KEY, []);
}

export function shareMeeting(
  meetingId: string,
  meetingTitle: string,
  sharedWith: string,
  sharedBy: string
): void {
  const existing = getSharedItems().filter((s) => s.meetingId !== meetingId);
  const updated: SharedItem[] = [
    {
      meetingId,
      meetingTitle,
      sharedWith,
      sharedBy,
      sharedAt: new Date().toISOString(),
    },
    ...existing,
  ];
  setJSON(SHARED_KEY, updated);
  window.dispatchEvent(new CustomEvent('ff_shared_changed'));
}

export function unshareItem(meetingId: string): void {
  const updated = getSharedItems().filter((s) => s.meetingId !== meetingId);
  setJSON(SHARED_KEY, updated);
  window.dispatchEvent(new CustomEvent('ff_shared_changed'));
}
