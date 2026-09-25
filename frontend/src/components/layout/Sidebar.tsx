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
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Meetings', icon: LayoutDashboard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  onNewMeeting?: () => void;
}

export default function Sidebar({ onNewMeeting }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
          <Mic2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 text-lg tracking-tight">Fireflies</span>
      </div>

      {/* New Meeting Button */}
      <div className="px-4 pt-4">
        <button
          onClick={onNewMeeting}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-violet-50 text-violet-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}

        {/* Section */}
        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Library</p>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <Star className="w-4 h-4" />
          Starred
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <Users className="w-4 h-4" />
          Shared with me
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <Clock className="w-4 h-4" />
          Recent
        </button>
      </nav>

      {/* User profile at bottom */}
      <div className="px-4 py-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            JD
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Janvi Dev</p>
            <p className="text-xs text-gray-500 truncate">janvi@example.com</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </aside>
  );
}
