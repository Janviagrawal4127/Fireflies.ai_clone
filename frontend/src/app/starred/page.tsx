'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ToastContainer from '@/components/ui/ToastContainer';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import { getMeetings } from '@/lib/api';
import { getStarredMeetingIds } from '@/lib/library';
import type { MeetingListItem } from '@/types';
import { Star, Search, BookOpen, Mic2, Clock, Calendar } from 'lucide-react';
import { formatDate, formatDuration } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  starred?: boolean;
  createdAt: string;
  updatedAt: string;
  meetingRef?: string;
}

function loadStarredNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const all: Note[] = JSON.parse(localStorage.getItem('ff_notes') ?? '[]');
    return all.filter((n) => n.pinned || n.starred);
  } catch {
    return [];
  }
}

export default function StarredPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const allMeetings = await getMeetings();
      const starredIds = getStarredMeetingIds();
      setMeetings(allMeetings.filter((m) => starredIds.includes(m.id)));
      setNotes(loadStarredNotes());
    } catch {
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    const onChanged = () => reload();
    window.addEventListener('ff_starred_changed', onChanged);
    return () => window.removeEventListener('ff_starred_changed', onChanged);
  }, [reload]);

  const q = search.toLowerCase();
  const filteredMeetings = meetings.filter((m) => m.title.toLowerCase().includes(q));
  const filteredNotes = notes.filter(
    (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  );
  const hasContent = filteredMeetings.length > 0 || filteredNotes.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar onNewMeeting={() => setMeetingModalOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              <h1 className="text-2xl font-bold text-gray-900">Starred</h1>
            </div>
            <p className="text-sm text-gray-500">Meetings and notes you have starred</p>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search starred items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-32" />
              ))}
            </div>
          )}

          {!loading && !hasContent && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No starred items yet</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Star meetings from the dashboard or notes from Notebook to find them here.
              </p>
            </div>
          )}

          {!loading && hasContent && (
            <div className="space-y-8">
              {filteredMeetings.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Mic2 className="w-3.5 h-3.5" /> Meetings
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        onClick={() => router.push(`/meetings/${meeting.id}`)}
                        className="bg-white rounded-xl border border-yellow-100 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all p-5 flex flex-col gap-3 group"
                      >
                        <div className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-300 mt-0.5 flex-shrink-0" />
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-700 transition-colors">
                            {meeting.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {meeting.summary_preview ?? 'No summary available.'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{formatDuration(meeting.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{formatDate(meeting.date)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {filteredNotes.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Notes
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNotes.map((note) => (
                      <Link
                        key={note.id}
                        href="/notebook"
                        className="bg-white rounded-xl border border-yellow-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5 flex flex-col gap-2 group"
                      >
                        <div className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-300 mt-0.5 flex-shrink-0" />
                          <p className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-indigo-700 transition-colors">
                            {note.title}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                          {note.content || 'No content'}
                        </p>
                        {note.meetingRef && (
                          <span className="text-[10px] text-indigo-500 mt-auto">{note.meetingRef}</span>
                        )}
                        <p className="text-[10px] text-gray-300">{formatDate(note.updatedAt)}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
      <CreateMeetingModal
        open={meetingModalOpen}
        onClose={() => setMeetingModalOpen(false)}
        onCreated={(m) => router.push(`/meetings/${m.id}`)}
      />
      <ToastContainer />
    </div>
  );
}
