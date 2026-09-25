'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const MAIN_NAV_ITEMS = [
  { href: '/', label: 'Meetings', icon: LayoutDashboard },
];

const SECONDARY_NAV_ITEMS = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

const PLACEHOLDER_ITEMS = [
  { label: 'Notebook', icon: Book },
  { label: 'Integrations', icon: Grid },
  { label: 'Analytics', icon: BarChart2 },
];

interface SidebarProps {
  onNewMeeting?: () => void;
}

export default function Sidebar({ onNewMeeting }: SidebarProps) {
  const pathname = usePathname();
  const { addToast } = useAppStore();

  const handlePlaceholderClick = (label: string) => {
    addToast(`${label} is coming soon!`, 'info');
  };

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
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-2 space-y-0.5 overflow-y-auto">
        {MAIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </Link>
          );
        })}

        {PLACEHOLDER_ITEMS.map(({ label, icon: Icon }) => (
           <button
            key={label}
            onClick={() => handlePlaceholderClick(label)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </button>
        ))}

        {SECONDARY_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-2 ${
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </Link>
          );
        })}

        {/* Section */}
        <div className="pt-6 pb-2">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Library</p>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Star className="w-[18px] h-[18px]" />
          Starred
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Users className="w-[18px] h-[18px]" />
          Shared with me
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Clock className="w-[18px] h-[18px]" />
          Recent
        </button>
      </nav>

      {/* User profile at bottom */}
      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-inner">
            JD
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">Janvi Dev</p>
            <p className="text-xs text-slate-500 truncate">janvi@example.com</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </aside>
  );
}
