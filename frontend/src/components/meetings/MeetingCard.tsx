'use client';

import { Calendar, Clock, Users, ChevronRight } from 'lucide-react';
import type { MeetingListItem } from '@/types';
import {
  formatDate,
  formatDuration,
  formatRelativeDate,
  getInitials,
  getSpeakerAvatarColor,
} from '@/lib/utils';

interface MeetingCardProps {
  meeting: MeetingListItem;
  onClick: () => void;
}

export default function MeetingCard({ meeting, onClick }: MeetingCardProps) {
  const visibleParticipants = meeting.participants.slice(0, 3);
  const extraCount = meeting.participants.length - 3;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow duration-200 p-4 flex flex-col gap-3 group"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 flex-1">
          {meeting.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-medium text-violet-600 bg-violet-50 rounded-full px-2 py-0.5 whitespace-nowrap">
            {formatRelativeDate(meeting.date)}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
        </div>
      </div>

      {/* ── Summary Preview ── */}
      <p className="text-sm text-gray-500 line-clamp-2 flex-1 leading-relaxed">
        {meeting.summary_preview ?? 'No summary available for this meeting.'}
      </p>

      {/* ── Participant Avatars ── */}
      {meeting.participants.length > 0 && (
        <div className="flex items-center gap-1">
          {visibleParticipants.map((participant) => (
            <div
              key={participant}
              title={participant}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${getSpeakerAvatarColor(participant)}`}
            >
              {getInitials(participant)}
            </div>
          ))}
          {extraCount > 0 && (
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0">
              +{extraCount}
            </div>
          )}
        </div>
      )}

      {/* ── Metadata Row ── */}
      <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 pt-2 mt-auto">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {formatDuration(meeting.duration)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {formatDate(meeting.date)}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {meeting.participants.length}
        </span>
      </div>
    </div>
  );
}
