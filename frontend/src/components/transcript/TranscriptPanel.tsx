'use client';

import { useRef, useEffect, memo } from 'react';
import { useAppStore } from '@/store/appStore';
import { formatTime, getSpeakerColor, getSpeakerAvatarColor, getInitials, highlightText } from '@/lib/utils';
import type { TranscriptLine } from '@/types';

interface TranscriptLineItemProps {
  line: TranscriptLine;
  isActive: boolean;
  searchQuery: string;
  onClick: (startTime: number) => void;
}

const TranscriptLineItem = memo(function TranscriptLineItem({
  line,
  isActive,
  searchQuery,
  onClick,
}: TranscriptLineItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Auto-scroll active line into view
  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  const highlighted = highlightText(line.text, searchQuery);
  const speakerColor = getSpeakerColor(line.speaker);
  const avatarBg = getSpeakerAvatarColor(line.speaker);

  return (
    <div
      ref={ref}
      onClick={() => onClick(line.start_time)}
      className={`group flex gap-3 px-4 py-3 cursor-pointer rounded-lg mx-1 transition-all ${
        isActive
          ? 'bg-violet-50 border-l-2 border-violet-500'
          : 'hover:bg-gray-50 border-l-2 border-transparent'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5`}
      >
        {getInitials(line.speaker)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${speakerColor}`}>
            {line.speaker}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onClick(line.start_time); }}
            className="text-xs text-gray-400 hover:text-violet-600 font-mono transition-colors"
          >
            {formatTime(line.start_time)}
          </button>
        </div>
        <p
          className={`text-sm leading-relaxed ${isActive ? 'text-gray-900' : 'text-gray-700'}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
});

interface TranscriptPanelProps {
  lines: TranscriptLine[];
  onSeek: (time: number) => void;
}

export default function TranscriptPanel({ lines, onSeek }: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeLineIndex, transcriptQuery, setTranscriptQuery } = useAppStore();

  // Count matches
  const matchCount = transcriptQuery
    ? lines.filter((l) => l.text.toLowerCase().includes(transcriptQuery.toLowerCase())).length
    : 0;

  const handleLineClick = (startTime: number) => {
    onSeek(startTime);
    // Also update the global audio seek
    const seekFn = (window as unknown as Record<string, (t: number) => void>).__seekAudio;
    if (seekFn) seekFn(startTime);
  };

  if (!lines.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400">
        <p className="text-sm">No transcript available for this meeting.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search transcript..."
            value={transcriptQuery}
            onChange={(e) => setTranscriptQuery(e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          {transcriptQuery && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-xs text-violet-600 font-medium">{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
              <button
                onClick={() => setTranscriptQuery('')}
                className="text-gray-400 hover:text-gray-600 text-xs ml-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lines */}
      <div ref={containerRef} className="flex-1 overflow-y-auto py-2">
        {lines.map((line, index) => {
          // Filter out non-matching lines when searching
          if (
            transcriptQuery &&
            !line.text.toLowerCase().includes(transcriptQuery.toLowerCase()) &&
            !line.speaker.toLowerCase().includes(transcriptQuery.toLowerCase())
          ) {
            return null;
          }
          return (
            <TranscriptLineItem
              key={line.id}
              line={line}
              isActive={index === activeLineIndex}
              searchQuery={transcriptQuery}
              onClick={handleLineClick}
            />
          );
        })}
      </div>
    </div>
  );
}
