'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MediaPlayer from '@/components/player/MediaPlayer';
import TranscriptPanel from '@/components/transcript/TranscriptPanel';
import { SummaryTab, ActionItemsTab } from '@/components/summary/SummaryPanel';
import EditMeetingModal from '@/components/meetings/EditMeetingModal';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import ToastContainer from '@/components/ui/ToastContainer';
import { getMeeting, deleteMeeting } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { findActiveLineIndex, formatDate, formatDuration, getInitials, getSpeakerAvatarColor } from '@/lib/utils';
import type { Meeting, ActionItem, Summary } from '@/types';
import {
  ChevronLeft, Calendar, Clock, Users, Edit2, Trash2,
  FileText, CheckSquare, BookOpen, StickyNote, Loader2, AlertCircle, Download
} from 'lucide-react';

type Tab = 'summary' | 'actions' | 'transcript-info';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function MeetingDetailPage({ params, searchParams }: PageProps) {
  const { id } = use(params);
  const searchProps = use(searchParams);
  const router = useRouter();
  const { currentTime, setCurrentTime, setActiveLineIndex, setTranscriptQuery } = useAppStore();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset transcript search when unmounting
  useEffect(() => {
    return () => { setTranscriptQuery(''); setActiveLineIndex(-1); };
  }, [setTranscriptQuery, setActiveLineIndex]);

  const loadMeeting = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMeeting(id);
      setMeeting(data);
    } catch {
      setError('Meeting not found or server unavailable.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadMeeting(); }, [loadMeeting]);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, [setCurrentTime]);

  useEffect(() => {
    if (meeting && searchProps.t) {
      const t = parseFloat(searchProps.t as string);
      if (!isNaN(t)) {
        handleSeek(t);
        const seekFn = (window as unknown as Record<string, (t: number) => void>).__seekAudio;
        if (seekFn) seekFn(t);
      }
    }
  }, [meeting, searchProps.t, handleSeek]);

  // Update active line index whenever currentTime or transcript changes
  useEffect(() => {
    if (!meeting?.transcript_lines?.length) return;
    const idx = findActiveLineIndex(meeting.transcript_lines, currentTime);
    if (idx !== useAppStore.getState().activeLineIndex) {
      setActiveLineIndex(idx);
    }
  }, [currentTime, meeting?.transcript_lines, setActiveLineIndex]);

  const handleDelete = async () => {
    if (!meeting) return;
    setDeleting(true);
    try {
      await deleteMeeting(meeting.id);
      router.push('/');
    } catch {
      useAppStore.getState().addToast('Failed to delete meeting', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    if (!meeting) return;
    const lines = meeting.transcript_lines ?? [];
    const summary = meeting.summary;
    const actions = meeting.action_items ?? [];

    let content = `# ${meeting.title}\n`;
    content += `Date: ${formatDate(meeting.date)} | Duration: ${formatDuration(meeting.duration)}\n`;
    content += `Participants: ${meeting.participants.join(', ')}\n\n`;

    if (summary?.overview) {
      content += `## Summary\n${summary.overview}\n\n`;
    }
    if (summary?.key_topics?.length) {
      content += `## Key Topics\n${summary.key_topics.map((t) => `- ${t}`).join('\n')}\n\n`;
    }
    if (actions.length) {
      content += `## Action Items\n${actions.map((a) => `- [${a.completed ? 'x' : ' '}] ${a.task}${a.assignee ? ` (${a.assignee})` : ''}`).join('\n')}\n\n`;
    }
    if (lines.length) {
      content += `## Transcript\n`;
      for (const line of lines) {
        const min = Math.floor(line.start_time / 60).toString().padStart(2, '0');
        const sec = Math.floor(line.start_time % 60).toString().padStart(2, '0');
        content += `[${min}:${sec}] ${line.speaker}: ${line.text}\n`;
      }
    }

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    useAppStore.getState().addToast('Transcript exported');
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar onNewMeeting={() => setCreateOpen(true)} />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar onNewMeeting={() => setCreateOpen(true)} />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-gray-600">{error}</p>
            <Link href="/" className="text-violet-600 hover:underline text-sm">
              Back to Meetings
            </Link>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  const lines = meeting.transcript_lines ?? [];
  const summary = meeting.summary ?? null;
  const actions = meeting.action_items ?? [];

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'summary', label: 'Summary', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'actions', label: 'Action Items', icon: <CheckSquare className="w-3.5 h-3.5" />, count: actions.filter((a) => !a.completed).length },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onNewMeeting={() => setCreateOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Meeting header */}
          <div className="bg-white border-b border-gray-100 px-6 py-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-3">
              <Link
                href="/"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Meetings
              </Link>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 mb-2">{meeting.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(meeting.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(meeting.duration)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {meeting.participants.length} participants
                  </span>
                </div>
                {/* Participant avatars */}
                {meeting.participants.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3">
                    {meeting.participants.map((name) => (
                      <div
                        key={name}
                        title={name}
                        className={`w-7 h-7 rounded-full ${getSpeakerAvatarColor(name)} flex items-center justify-center text-white text-xs font-semibold`}
                      >
                        {getInitials(name)}
                      </div>
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      {meeting.participants.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                {deleteConfirm ? (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-red-700 font-medium">Delete?</span>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-xs text-red-700 font-semibold hover:text-red-900"
                    >
                      {deleting ? 'Deleting...' : 'Yes'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main content — two-column layout */}
          <div className="flex-1 overflow-hidden flex">
            {/* Left: Player + Transcript */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100 overflow-hidden">
              {/* Player */}
              <div className="px-5 pt-4 pb-3 border-b border-gray-50">
                <MediaPlayer
                  audioUrl={meeting.audio_url}
                  totalDuration={meeting.duration}
                  onSeek={handleSeek}
                />
              </div>

              {/* Transcript header */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Transcript
                  </span>
                  <span className="text-xs text-gray-400">({lines.length} segments)</span>
                </div>
              </div>

              {/* Transcript body */}
              <div className="flex-1 overflow-hidden">
                <TranscriptPanel lines={lines} onSeek={handleSeek} />
              </div>
            </div>

            {/* Right: Summary / Actions panel */}
            <div className="w-96 flex-shrink-0 flex flex-col overflow-hidden bg-white">
              {/* Tabs */}
              <div className="flex border-b border-gray-100 px-4 pt-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors mr-1 ${
                      activeTab === tab.id
                        ? 'border-violet-600 text-violet-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-5">
                {activeTab === 'summary' && summary && (
                  <SummaryTab
                    summary={summary}
                    meetingId={meeting.id}
                    onUpdated={(s) => setMeeting((m) => m ? { ...m, summary: s } : m)}
                  />
                )}
                {activeTab === 'summary' && !summary && (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <StickyNote className="w-8 h-8 mb-2" />
                    <p className="text-sm">No summary for this meeting.</p>
                  </div>
                )}
                {activeTab === 'actions' && (
                  <ActionItemsTab
                    items={actions}
                    meetingId={meeting.id}
                    onChange={(updated: ActionItem[]) =>
                      setMeeting((m) => m ? { ...m, action_items: updated } : m)
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editOpen && (
        <EditMeetingModal
          meeting={meeting}
          onClose={() => setEditOpen(false)}
          onUpdated={(updated) => {
            setMeeting((m) => m ? { ...m, ...updated } : m);
            setEditOpen(false);
          }}
        />
      )}
      <CreateMeetingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(m) => router.push(`/meetings/${m.id}`)}
      />
      <ToastContainer />
    </div>
  );
}
