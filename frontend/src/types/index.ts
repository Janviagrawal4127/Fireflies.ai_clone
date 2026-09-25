// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface TranscriptLine {
  id: number;
  meeting_id: string;
  speaker: string;
  text: string;
  start_time: number;
  end_time: number;
  sequence: number;
}

export interface Summary {
  id: number;
  meeting_id: string;
  overview: string;
  key_topics: string[];
  notes: string | null;
}

export interface ActionItem {
  id: number;
  meeting_id: string;
  task: string;
  assignee: string | null;
  due_date: string | null;
  completed: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: string[];
  audio_url: string | null;
  created_at: string;
  updated_at: string;
  summary_preview: string | null;
  summary?: Summary;
  transcript_lines?: TranscriptLine[];
  action_items?: ActionItem[];
}

export interface MeetingListItem {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: string[];
  audio_url: string | null;
  created_at: string;
  updated_at: string;
  summary_preview: string | null;
}

export interface SearchResult {
  meeting_id: string;
  meeting_title: string;
  line_id: number;
  speaker: string;
  text: string;
  start_time: number;
  sequence: number;
}

// ─── API Payload Types ────────────────────────────────────────────────────────

export interface CreateMeetingPayload {
  title: string;
  date: string;
  duration: number;
  participants: string[];
  audio_url?: string;
  transcript?: Omit<TranscriptLine, 'id' | 'meeting_id'>[];
  summary?: Omit<Summary, 'id' | 'meeting_id'>;
  action_items?: Omit<ActionItem, 'id' | 'meeting_id'>[];
  raw_transcript?: string;
}

export interface UpdateMeetingPayload {
  title?: string;
  date?: string;
  duration?: number;
  participants?: string[];
}

export interface CreateActionItemPayload {
  task: string;
  assignee?: string;
  due_date?: string;
  completed?: boolean;
}

export interface UpdateActionItemPayload {
  task?: string;
  assignee?: string;
  due_date?: string;
  completed?: boolean;
}

export interface UpdateSummaryPayload {
  overview?: string;
  key_topics?: string[];
  notes?: string;
}

// ─── Filter / Sort Types ──────────────────────────────────────────────────────

export interface MeetingFilters {
  search: string;
  sort: 'recent' | 'oldest';
  date_from: string;
  date_to: string;
  participant: string;
}
