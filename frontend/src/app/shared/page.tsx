'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ToastContainer from '@/components/ui/ToastContainer';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import { useAppStore } from '@/store/appStore';
import { getSharedItems, unshareItem } from '@/lib/library';
import type { SharedItem } from '@/lib/library';
import {
  Users, Search, ExternalLink, X, Calendar, ChevronRight,
} from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Demo data shown when no real shared items exist
const DEMO_ITEMS: SharedItem[] = [
  {
    meetingId: 'demo-1',
    meetingTitle: 'Q3 Product Planning — Demo',
    sharedWith: 'you@example.com',
    sharedBy: 'team@company.com',
    sharedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export default function SharedPage() {
  const router = useRouter();
  const { addToast } = useAppStore();
  const [items, setItems] = useState<SharedItem[]>([]);
  const [search, setSearch] = useState('');
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  const reload = useCallback(() => {
    const real = getSharedItems();
    setItems(real.length > 0 ? real : DEMO_ITEMS);
  }, []);

  useEffect(() => {
    reload();
    const onChange = () => reload();
    window.addEventListener('ff_shared_changed', onChange);
    return () => window.removeEventListener('ff_shared_changed', onChange);
  }, [reload]);

  const q = search.toLowerCase();
  const filtered = items.filter(
    (i) => i.meetingTitle.toLowerCase().includes(q) || i.sharedBy.toLowerCase().includes(q)
  );

  function handleRemove(meetingId: string) {
    unshareItem(meetingId);
    addToast('Removed from shared');
    reload();
  }

  function handleOpen(item: SharedItem) {
    if (!item.meetingId.startsWith('demo-')) {
      router.push(`/meetings/${item.meetingId}`);
    } else {
      addToast('This is a demo shared item');
    }
  }

  const real = getSharedItems();
  const isShowingDemo = real.length === 0;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar onNewMeeting={() => setMeetingModalOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-indigo-500" />
              <h1 className="text-2xl font-bold text-gray-900">Shared with me</h1>
            </div>
            <p className="text-sm text-gray-500">
              {isShowingDemo
                ? 'Meetings shared with you will appear here. Showing demo data.'
                : `${real.length} shared meeting${real.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {isShowingDemo && (
            <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
              <span className="text-xs font-medium text-amber-700">
                🔮 Demo mode — Share a meeting from its detail page to see it here.
              </span>
            </div>
          )}

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shared meetings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Empty state after search */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Nothing has been shared with you yet</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Open a meeting and use the Share button to share it.
              </p>
            </div>
          )}

          {/* Items */}
          {filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div
                  key={item.meetingId}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5 flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-indigo-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-700 transition-colors">
                      {item.meetingTitle}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                      <span>Shared by <span className="font-medium text-gray-600">{item.sharedBy}</span></span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(item.sharedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpen(item)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      Open <ChevronRight className="w-3 h-3" />
                    </button>
                    {!item.meetingId.startsWith('demo-') && (
                      <button
                        onClick={() => handleRemove(item.meetingId)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
