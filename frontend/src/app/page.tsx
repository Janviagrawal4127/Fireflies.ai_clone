'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MeetingCard from '@/components/meetings/MeetingCard';
import MeetingFiltersBar from '@/components/meetings/MeetingFilters';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import ToastContainer from '@/components/ui/ToastContainer';
import { getMeetings } from '@/lib/api';
import type { MeetingListItem, MeetingFilters, Meeting } from '@/types';
import { LayoutGrid, List, Mic2 } from 'lucide-react';

const DEFAULT_FILTERS: MeetingFilters = {
  search: '',
  sort: 'recent',
  date_from: '',
  date_to: '',
  participant: '',
};

export default function DashboardPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MeetingFilters>(DEFAULT_FILTERS);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMeetings = useCallback(async (f: MeetingFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMeetings(f);
      setMeetings(data);
    } catch {
      setError('Failed to load meetings. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce filter changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMeetings(filters);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, fetchMeetings]);

  const handleFiltersChange = (partial: Partial<MeetingFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleCreated = (meeting: Meeting) => {
    router.push(`/meetings/${meeting.id}`);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onNewMeeting={() => setCreateOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {loading ? 'Loading...' : `${meetings.length} meeting${meetings.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Mic2 className="w-4 h-4" />
                New Meeting
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <MeetingFiltersBar filters={filters} onChange={handleFiltersChange} />
          </div>

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 text-sm font-medium">{error}</p>
              <button
                onClick={() => fetchMeetings(filters)}
                className="mt-3 text-sm text-red-600 underline hover:text-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && !error && (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
                  <div className="flex gap-2 mb-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-3 bg-gray-100 rounded w-16" />
                    <div className="h-3 bg-gray-100 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && meetings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                <Mic2 className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No meetings found</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">
                {filters.search || filters.date_from || filters.date_to
                  ? 'No meetings match your current filters.'
                  : 'Create your first meeting to get started.'}
              </p>
              <button
                onClick={() => setCreateOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Create Meeting
              </button>
            </div>
          )}

          {/* Meeting grid / list */}
          {!loading && !error && meetings.length > 0 && (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl'}`}>
              {meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onClick={() => router.push(`/meetings/${meeting.id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals & toasts */}
      <CreateMeetingModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
      <ToastContainer />
    </div>
  );
}
