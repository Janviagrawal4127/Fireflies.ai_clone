'use client';

import { Search, X, Calendar, ChevronDown } from 'lucide-react';
import type { MeetingFilters } from '@/types';

interface MeetingFiltersProps {
  filters: MeetingFilters;
  onChange: (filters: Partial<MeetingFilters>) => void;
}

const INPUT_CLASS =
  'bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition';

export default function MeetingFiltersBar({ filters, onChange }: MeetingFiltersProps) {
  const isAnyActive =
    filters.search.trim() !== '' ||
    filters.date_from !== '' ||
    filters.date_to !== '' ||
    filters.sort !== 'recent';

  function clearFilters() {
    onChange({ search: '', date_from: '', date_to: '', sort: 'recent', participant: '' });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* ── Search ── */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search meetings..."
          className={`${INPUT_CLASS} pl-9 w-full`}
        />
      </div>

      {/* ── Date From ── */}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => onChange({ date_from: e.target.value })}
          className={`${INPUT_CLASS} pl-9`}
          title="From date"
        />
      </div>

      {/* ── Date To ── */}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => onChange({ date_to: e.target.value })}
          className={`${INPUT_CLASS} pl-9`}
          title="To date"
        />
      </div>

      {/* ── Participant ── */}
      <div className="relative">
        <input
          type="text"
          placeholder="Participant..."
          value={filters.participant}
          onChange={(e) => onChange({ participant: e.target.value })}
          className={`${INPUT_CLASS} w-32`}
          title="Filter by participant"
        />
      </div>

      {/* ── Sort ── */}
      <div className="relative">
        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as MeetingFilters['sort'] })}
          className={`${INPUT_CLASS} pr-8 appearance-none cursor-pointer`}
        >
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* ── Clear Filters ── */}
      {isAnyActive && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          title="Clear all filters"
        >
          <X className="w-4 h-4" />
          Clear
        </button>
      )}
    </div>
  );
}
