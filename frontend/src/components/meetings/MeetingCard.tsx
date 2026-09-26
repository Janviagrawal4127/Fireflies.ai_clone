'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import {
  isMeetingStarred,
  toggleStarredMeeting,
} from '@/lib/library';
import { addRecentItem } from '@/lib/library';
import type { MeetingListItem } from '@/types';
import { Calendar, Clock, Users } from 'lucide-react';
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
  const [starred, setStarred] = useState(false);
  const visibleParticipants = meeting.participants.slice(0, 3);
  const extraCount = meeting.participants.length - 3;

  // Hydrate star state from localStorage
  useEffect(() => {
    setStarred(isMeetingStarred(meeting.id));
    const onChanged = () => setStarred(isMeetingStarred(meeting.id));
    window.addEventListener('ff_starred_changed', onChanged);
    return () => window.removeEventListener('ff_starred_changed', onChanged);
  }, [meeting.id]);

  function handleStarClick(e: React.MouseEvent) {
    e.stopPropagation();
    const nowStarred = toggleStarredMeeting(meeting.id);
    setStarred(nowStarred);
  }

  function handleCardClick() {
    addRecentItem({ id: meeting.id, type: 'meeting', title: meeting.title });
    onClick();
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all duration-200 p-5 flex flex-col gap-4 group relative"
    >
      {/* Star button */}
      <button
        onClick={handleStarClick}
        title={starred ? 'Unstar' : 'Star'}
        className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-100 transition-colors z-10"
      >
        <Star
          className={`w-4 h-4 transition-colors ${
            starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-400'
          }`}
        />
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-8 pr-6">
        <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2 flex-1 group-hover:text-indigo-700 transition-colors">
          {meeting.title}
        </h3>
        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-0.5 whitespace-nowrap flex-shrink-0">
          {formatRelativeDate(meeting.date)}
        </span>
      </div>

      {/* Summary Preview */}
      <p className="text-[13px] text-gray-500 line-clamp-2 flex-1 leading-relaxed">
        {meeting.summary_preview ?? 'No summary available for this meeting. Check back later.'}
      </p>

      {/* Footer Meta & Participants */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-[12px] font-medium text-gray-500">
          <span className="flex items-center gap-1.5" title="Duration">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {formatDuration(meeting.duration)}
          </span>
          <span className="flex items-center gap-1.5" title="Date">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {formatDate(meeting.date)}
          </span>
        </div>

        {/* Participant Avatars */}
        {meeting.participants.length > 0 && (
          <div className="flex items-center -space-x-1.5">
            {visibleParticipants.map((participant) => (
              <div
                key={participant}
                title={participant}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ring-2 ring-white shadow-sm ${getSpeakerAvatarColor(participant)}`}
              >
                {getInitials(participant)}
              </div>
            ))}
            {extraCount > 0 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0 ring-2 ring-white shadow-sm">
                +{extraCount}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
