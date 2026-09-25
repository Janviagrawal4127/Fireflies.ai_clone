/**
 * Format seconds into MM:SS display string
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Format seconds into human-readable duration (e.g. "1h 30m" or "45m")
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * Format ISO date string to readable format (e.g. "Sep 25, 2026")
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format ISO date to relative time (e.g. "2 days ago")
 */
export function formatRelativeDate(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(isoString);
}

/**
 * Get speaker colour — deterministic based on name
 */
const SPEAKER_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-indigo-100 text-indigo-700',
];

export function getSpeakerColor(speaker: string): string {
  let hash = 0;
  for (let i = 0; i < speaker.length; i++) {
    hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SPEAKER_COLORS[Math.abs(hash) % SPEAKER_COLORS.length];
}

/**
 * Get speaker avatar initials colour (background only)
 */
const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-amber-500',
  'bg-indigo-500',
];

export function getSpeakerAvatarColor(speaker: string): string {
  let hash = 0;
  for (let i = 0; i < speaker.length; i++) {
    hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Get initials from full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Binary search — find the active transcript line index for current playback time.
 * Returns the index of the last line whose start_time <= currentTime.
 */
export function findActiveLineIndex(
  lines: Array<{ start_time: number; end_time: number }>,
  currentTime: number
): number {
  if (!lines.length) return -1;
  if (currentTime < lines[0].start_time) return -1;

  let lo = 0;
  let hi = lines.length - 1;
  let result = 0;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (lines[mid].start_time <= currentTime) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}

/**
 * Highlight search matches in text with <mark> spans
 */
export function highlightText(text: string, query: string): string {
  // Escape HTML entities to prevent XSS
  const escapeHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const escapedText = escapeHtml(text);
  if (!query.trim()) return escapedText;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escapedText.replace(
    new RegExp(escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
    (match) => `<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5">${match}</mark>`
  );
}

/**
 * Parse a plain-text transcript file into structured lines.
 * Supports simple format:
 *   [Speaker Name]
 *   text line
 *
 * Or VTT-like:
 *   00:00:05.000 --> 00:00:12.000
 *   Speaker: text
 */
export function parsePlainTranscript(
  raw: string
): Array<{ speaker: string; text: string; start_time: number; end_time: number; sequence: number }> {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const result: Array<{ speaker: string; text: string; start_time: number; end_time: number; sequence: number }> = [];
  let currentSpeaker = 'Speaker';
  let seq = 0;
  let t = 0;

  for (const line of lines) {
    // Speaker header: [Name] or Name:
    if (line.startsWith('[') && line.endsWith(']')) {
      currentSpeaker = line.slice(1, -1).trim();
    } else if (/^[a-zA-Z0-9 \.]+:[ \t]*./.test(line)) {
      const colonIdx = line.indexOf(':');
      currentSpeaker = line.slice(0, colonIdx).trim();
      const text = line.slice(colonIdx + 1).trim();
      if (text) {
        const dur = Math.max(5, text.split(' ').length * 0.5);
        result.push({ speaker: currentSpeaker, text, start_time: t, end_time: t + dur, sequence: seq++ });
        t += dur + 1.5;
      }
    } else if (line.length > 5) {
      const dur = Math.max(5, line.split(' ').length * 0.5);
      result.push({ speaker: currentSpeaker, text: line, start_time: t, end_time: t + dur, sequence: seq++ });
      t += dur + 1.5;
    }
  }
  return result;
}
