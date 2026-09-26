'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ToastContainer from '@/components/ui/ToastContainer';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import { getMeetings } from '@/lib/api';
import type { MeetingListItem } from '@/types';
import { BarChart2, Clock, Users, Calendar, TrendingUp, Mic2 } from 'lucide-react';

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AnalyticsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  useEffect(() => {
    getMeetings()
      .then(setMeetings)
      .catch(() => setError('Could not load meeting data.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Compute analytics ──
  const totalMeetings = meetings.length;
  const totalDuration = meetings.reduce((acc, m) => acc + m.duration, 0);
  const avgDuration = totalMeetings ? Math.round(totalDuration / totalMeetings) : 0;
  const allParticipants = [...new Set(meetings.flatMap((m) => m.participants))];
  const totalParticipants = allParticipants.length;

  // Meetings by day of week
  const byDay = Array(7).fill(0);
  meetings.forEach((m) => {
    const d = new Date(m.date).getDay();
    byDay[d]++;
  });
  const maxByDay = Math.max(...byDay, 1);

  // Meetings by month (last 6 months)
  const now = new Date();
  const monthBuckets: { label: string; count: number; duration: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      count: 0,
      duration: 0,
    });
  }
  meetings.forEach((m) => {
    const mDate = new Date(m.date);
    const monthsAgo = (now.getFullYear() - mDate.getFullYear()) * 12 + (now.getMonth() - mDate.getMonth());
    if (monthsAgo >= 0 && monthsAgo < 6) {
      const bucket = monthBuckets[5 - monthsAgo];
      if (bucket) { bucket.count++; bucket.duration += m.duration; }
    }
  });
  const maxMonthCount = Math.max(...monthBuckets.map((b) => b.count), 1);

  // This week vs last week
  const thisWeek = meetings.filter((m) => {
    const w = getWeek(new Date(m.date));
    const y = new Date(m.date).getFullYear();
    return w === getWeek(now) && y === now.getFullYear();
  }).length;

  const thisMonth = meetings.filter((m) => {
    const d = new Date(m.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Top participants
  const participantCounts: Record<string, number> = {};
  meetings.forEach((m) => m.participants.forEach((p) => {
    participantCounts[p] = (participantCounts[p] ?? 0) + 1;
  }));
  const topParticipants = Object.entries(participantCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxPCount = topParticipants.length ? topParticipants[0][1] : 1;

  const statCards = [
    { label: 'Total Meetings', value: totalMeetings, icon: <Mic2 className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Total Duration', value: formatDuration(totalDuration), icon: <Clock className="w-5 h-5 text-violet-500" />, bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'Unique Participants', value: totalParticipants, icon: <Users className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Avg Duration', value: formatDuration(avgDuration), icon: <TrendingUp className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50', border: 'border-orange-100' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar onNewMeeting={() => setMeetingModalOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Insights from your meeting history</p>
          </div>

          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="h-7 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statCards.map(({ label, value, icon, bg, border }) => (
                  <div key={label} className={`bg-white rounded-xl border ${border} p-5 flex flex-col gap-2 shadow-sm`}>
                    <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Quick insights */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">{thisWeek}</p>
                  <p className="text-xs text-gray-400 mt-0.5">meetings scheduled</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{thisMonth}</p>
                  <p className="text-xs text-gray-400 mt-0.5">meetings held</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Avg Per Month</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {monthBuckets.length ? Math.round(monthBuckets.reduce((a, b) => a + b.count, 0) / 6) : '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">over last 6 months</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Meetings by Month bar chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="w-4 h-4 text-indigo-500" />
                    <p className="text-sm font-semibold text-gray-700">Meetings Over Time</p>
                    <span className="text-xs text-gray-400 ml-auto">Last 6 months</span>
                  </div>
                  {totalMeetings === 0 ? (
                    <p className="text-sm text-gray-400 py-8 text-center">No data available yet</p>
                  ) : (
                    <div className="flex items-end gap-2 h-32">
                      {monthBuckets.map((b) => (
                        <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-gray-500 font-medium">{b.count || ''}</span>
                          <div className="w-full bg-gray-100 rounded-t-md overflow-hidden" style={{ height: '88px' }}>
                            <div
                              className="w-full bg-indigo-500 rounded-t-md transition-all"
                              style={{ height: `${(b.count / maxMonthCount) * 88}px`, marginTop: `${88 - (b.count / maxMonthCount) * 88}px` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400">{b.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Meetings by Day of Week */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    <p className="text-sm font-semibold text-gray-700">Most Active Days</p>
                  </div>
                  {totalMeetings === 0 ? (
                    <p className="text-sm text-gray-400 py-8 text-center">No data available yet</p>
                  ) : (
                    <div className="space-y-2.5">
                      {DAY_NAMES.map((day, i) => (
                        <div key={day} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-gray-500 w-7">{day}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-violet-500 h-full rounded-full"
                              style={{ width: `${(byDay[i] / maxByDay) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-500 w-4 text-right">{byDay[i]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Participants */}
              {topParticipants.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <p className="text-sm font-semibold text-gray-700">Most Active Participants</p>
                  </div>
                  <div className="space-y-3">
                    {topParticipants.map(([name, count]) => (
                      <div key={name} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                          {name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700 flex-1 truncate">{name}</span>
                        <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(count / maxPCount) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalMeetings === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                    <BarChart2 className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No analytics yet</h3>
                  <p className="text-sm text-gray-400">Create meetings to see analytics here.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <CreateMeetingModal open={meetingModalOpen} onClose={() => setMeetingModalOpen(false)} onCreated={(m) => router.push(`/meetings/${m.id}`)} />
      <ToastContainer />
    </div>
  );
}
