'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ToastContainer from '@/components/ui/ToastContainer';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import { getRecentItems } from '@/lib/library';
import type { RecentItem } from '@/lib/library';
import { Clock, Search, Mic2, BookOpen, ChevronRight } from 'lucide-react';

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export default function RecentPage() {
  const router = useRouter();
  const [items, setItems] = useState<RecentItem[]>([]);
  const [search, setSearch] = useState('');
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  const reload = useCallback(() => {
    setItems(getRecentItems());
  }, []);

  useEffect(() => {
    reload();
    // Re-read if the user navigates back
    const onFocus = () => reload();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [reload]);

  const q = search.toLowerCase();
  const filtered = items.filter((i) => i.title.toLowerCase().includes(q));

  const todayItems = filtered.filter((i) => isToday(i.accessedAt));
  const earlierItems = filtered.filter((i) => !isToday(i.accessedAt));

  function handleItemClick(item: RecentItem) {
    if (item.type === 'meeting') {
      router.push(`/meetings/${item.id}`);
    } else {
      router.push('/notebook');
    }
  }

  function RecentItemRow({ item }: { item: RecentItem }) {
    return (
      <div
        onClick={() => handleItemClick(item)}
        className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all group"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          item.type === 'meeting' ? 'bg-indigo-50' : 'bg-violet-50'
        }`}>
          {item.type === 'meeting'
            ? <Mic2 className="w-4 h-4 text-indigo-500" />
            : <BookOpen className="w-4 h-4 text-violet-500" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-700 transition-colors">
            {item.title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">
            {item.type} · {formatRelativeTime(item.accessedAt)}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar onNewMeeting={() => setMeetingModalOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-indigo-500" />
              <h1 className="text-2xl font-bold text-gray-900">Recent</h1>
            </div>
            <p className="text-sm text-gray-500">
              {items.length > 0 ? `${items.length} recently accessed item${items.length !== 1 ? 's' : ''}` : 'Recently opened meetings and notes'}
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recent items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                {search ? 'No results found' : 'No recent activity'}
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                {search
                  ? 'Try a different search term.'
                  : 'Your recently opened meetings and notes will appear here.'}
              </p>
            </div>
          )}

          {/* Today */}
          {todayItems.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Today</h2>
              <div className="space-y-2">
                {todayItems.map((item) => (
                  <RecentItemRow key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Earlier */}
          {earlierItems.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Earlier</h2>
              <div className="space-y-2">
                {earlierItems.map((item) => (
                  <RecentItemRow key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            </section>
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
