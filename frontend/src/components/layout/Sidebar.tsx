'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Mic2,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Plus,
  Star,
  Users,
  Clock,
  Book,
  Grid,
  BarChart2,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';

// Lightweight profile reader
const PROFILE_KEY = 'ff_profile';

interface ProfileSnap {
  name: string;
  email: string;
  initials: string;
}

function loadProfile(): ProfileSnap {
  if (typeof window === 'undefined') return { name: 'Janvi Agrawal', email: 'janvi@example.com', initials: 'JA' };
  try {
    const stored = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? 'null');
    if (!stored) return { name: 'Janvi Agrawal', email: 'janvi@example.com', initials: 'JA' };
    const name: string = stored.name ?? 'Janvi Agrawal';
    const email: string = stored.email ?? 'janvi@example.com';
    const parts = name.trim().split(' ');
    const initials = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
    return { name, email, initials };
  } catch {
    return { name: 'Janvi Agrawal', email: 'janvi@example.com', initials: 'JA' };
  }
}

const MAIN_NAV_ITEMS = [
  { href: '/dashboard', label: 'Meetings', icon: LayoutDashboard },
  { href: '/notebook', label: 'Notebook', icon: Book },
  { href: '/integrations', label: 'Integrations', icon: Grid },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const LIBRARY_ITEMS = [
  { label: 'Starred', icon: Star },
  { label: 'Shared with me', icon: Users },
  { label: 'Recent', icon: Clock },
];

interface SidebarProps {
  onNewMeeting?: () => void;
}

export default function Sidebar({ onNewMeeting }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { addToast } = useAppStore();
  const [profile, setProfile] = useState<ProfileSnap>({ name: 'Janvi Agrawal', email: 'janvi@example.com', initials: 'JA' });

  useEffect(() => {
    setProfile(loadProfile());
    // Listen for custom event from Settings page
    const onStorage = () => setProfile(loadProfile());
    window.addEventListener('ff_profile_updated', onStorage);
    return () => window.removeEventListener('ff_profile_updated', onStorage);
  }, []);

  const isActive = (href: string) =>
    pathname === href ||
    (href !== '/dashboard' && pathname.startsWith(href)) ||
    (href === '/dashboard' && pathname.startsWith('/meetings'));

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 text-slate-300">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Mic2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-lg tracking-tight">Fireflies</span>
      </div>

      {/* New Meeting Button */}
      <div className="px-4 pt-5 pb-2">
        <button
          onClick={onNewMeeting}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-2 space-y-0.5 overflow-y-auto">
        {MAIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(href)
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </Link>
        ))}

        {/* Library section */}
        <div className="pt-6 pb-2">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Library</p>
        </div>
        {LIBRARY_ITEMS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => addToast(`${label} — coming soon!`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </button>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => router.push('/settings')}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-inner">
            {profile.initials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{profile.name}</p>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        </button>
      </div>
    </aside>
  );
}
