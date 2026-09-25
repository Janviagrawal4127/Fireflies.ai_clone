import axios from 'axios';
import type {
  Meeting,
  MeetingListItem,
  TranscriptLine,
  Summary,
  ActionItem,
  SearchResult,
  CreateMeetingPayload,
  UpdateMeetingPayload,
  CreateActionItemPayload,
  UpdateActionItemPayload,
  UpdateSummaryPayload,
  MeetingFilters,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Meetings ─────────────────────────────────────────────────────────────────

export async function getMeetings(filters?: Partial<MeetingFilters>): Promise<MeetingListItem[]> {
  const params: Record<string, string> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.sort) params.sort = filters.sort;
  if (filters?.date_from) params.date_from = filters.date_from;
  if (filters?.date_to) params.date_to = filters.date_to;
  if (filters?.participant) params.participant = filters.participant;

  const { data } = await client.get<MeetingListItem[]>('/api/meetings', { params });
  return data;
}

export async function getMeeting(id: string): Promise<Meeting> {
  const { data } = await client.get<Meeting>(`/api/meetings/${id}`);
  return data;
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
  const { data } = await client.post<Meeting>('/api/meetings', payload);
  return data;
}

export async function updateMeeting(id: string, payload: UpdateMeetingPayload): Promise<Meeting> {
  const { data } = await client.put<Meeting>(`/api/meetings/${id}`, payload);
  return data;
}

export async function deleteMeeting(id: string): Promise<void> {
  await client.delete(`/api/meetings/${id}`);
}

// ─── Transcripts ──────────────────────────────────────────────────────────────

export async function getTranscript(meetingId: string): Promise<TranscriptLine[]> {
  const { data } = await client.get<TranscriptLine[]>(`/api/meetings/${meetingId}/transcript`);
  return data;
}

// ─── Summaries ────────────────────────────────────────────────────────────────

export async function getSummary(meetingId: string): Promise<Summary> {
  const { data } = await client.get<Summary>(`/api/meetings/${meetingId}/summary`);
  return data;
}

export async function updateSummary(meetingId: string, payload: UpdateSummaryPayload): Promise<Summary> {
  const { data } = await client.put<Summary>(`/api/meetings/${meetingId}/summary`, payload);
  return data;
}

// ─── Action Items ─────────────────────────────────────────────────────────────

export async function getActionItems(meetingId: string): Promise<ActionItem[]> {
  const { data } = await client.get<ActionItem[]>(`/api/meetings/${meetingId}/actions`);
  return data;
}

export async function createActionItem(meetingId: string, payload: CreateActionItemPayload): Promise<ActionItem> {
  const { data } = await client.post<ActionItem>(`/api/meetings/${meetingId}/actions`, payload);
  return data;
}

export async function updateActionItem(itemId: number, payload: UpdateActionItemPayload): Promise<ActionItem> {
  const { data } = await client.put<ActionItem>(`/api/actions/${itemId}`, payload);
  return data;
}

export async function deleteActionItem(itemId: number): Promise<void> {
  await client.delete(`/api/actions/${itemId}`);
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function globalSearch(q: string): Promise<SearchResult[]> {
  const { data } = await client.get<SearchResult[]>('/api/search', { params: { q } });
  return data;
}
