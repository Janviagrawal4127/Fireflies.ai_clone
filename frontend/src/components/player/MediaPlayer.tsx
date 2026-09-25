'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatTime } from '@/lib/utils';

interface MediaPlayerProps {
  audioUrl?: string | null;
  totalDuration?: number; // fallback duration in seconds
  onSeek?: (time: number) => void;
}

export default function MediaPlayer({ audioUrl, totalDuration = 3600, onSeek }: MediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const [audioError, setAudioError] = useState(false);

  const { currentTime, duration, isPlaying, setCurrentTime, setDuration, setIsPlaying } = useAppStore();

  const effectiveAudioUrl = !audioError ? (audioUrl || '/sample.wav') : null;
  const isSimulated = !effectiveAudioUrl;

  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simTimeRef = useRef<number>(0);

  // Expose seekTo via window for transcript clicks
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__seekAudio = (t: number) => {
      if (audioRef.current && !isSimulated) {
        audioRef.current.currentTime = t;
      } else {
        setCurrentTime(t);
        simTimeRef.current = t;
      }
    };
  }, [setCurrentTime, isSimulated]);

  // Audio element event handlers
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current || isSimulated) return;
    setCurrentTime(audioRef.current.currentTime);
  }, [setCurrentTime, isSimulated]);

  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current || isSimulated) return;
    setDuration(audioRef.current.duration);
  }, [setDuration, isSimulated]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  const handleError = useCallback(() => {
    setAudioError(true);
    setIsPlaying(false);
  }, [setIsPlaying]);

  // Simulated playback when no real audio
  const startSim = useCallback(() => {
    if (simRef.current) clearInterval(simRef.current);
    simRef.current = setInterval(() => {
      simTimeRef.current = simTimeRef.current + 0.5;
      const dur = totalDuration;
      if (simTimeRef.current >= dur) {
        clearInterval(simRef.current!);
        setIsPlaying(false);
        simTimeRef.current = dur;
      }
      setCurrentTime(simTimeRef.current);
    }, 500);
  }, [totalDuration, setCurrentTime, setIsPlaying]);

  const stopSim = useCallback(() => {
    if (simRef.current) clearInterval(simRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (simRef.current) clearInterval(simRef.current);
    };
  }, []);

  useEffect(() => {
    if (isSimulated) {
      setDuration(totalDuration);
    }
  }, [isSimulated, totalDuration, setDuration]);

  // Pause simulation if we switch to real audio and vice versa
  useEffect(() => {
    if (isPlaying) {
      if (!isSimulated && audioRef.current) {
        audioRef.current.play().catch(handleError);
        stopSim();
      } else if (isSimulated) {
        startSim();
      }
    } else {
      if (!isSimulated && audioRef.current) {
        audioRef.current.pause();
      }
      stopSim();
    }
  }, [isPlaying, isSimulated, startSim, stopSim, handleError]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    simTimeRef.current = t;
    if (audioRef.current && !isSimulated) {
      audioRef.current.currentTime = t;
    } else {
      setCurrentTime(t);
    }
    onSeek?.(t);
  };

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    if (audioRef.current && !isSimulated) {
      audioRef.current.currentTime = newTime;
    } else {
      setCurrentTime(newTime);
      simTimeRef.current = newTime;
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      {/* Waveform placeholder */}
      <div className="bg-gray-50 rounded-lg h-14 mb-3 flex items-center justify-center overflow-hidden relative">
        <div className="flex items-end gap-0.5 h-10 px-2 w-full">
          {Array.from({ length: 80 }, (_, i) => {
            const height = 20 + Math.sin(i * 0.4) * 12 + Math.sin(i * 1.1) * 8 + Math.random() * 6;
            const isPast = (i / 80) * 100 <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-colors ${isPast ? 'bg-violet-500' : 'bg-gray-200'}`}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <input
          ref={progressRef}
          type="range"
          min={0}
          max={duration}
          step={0.5}
          value={currentTime}
          onChange={handleProgressChange}
          className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-violet-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => skip(-10)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back 10s"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          onClick={() => skip(10)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Forward 10s"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 ml-2 text-gray-400">
          <Volume2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Hidden audio element */}
      {effectiveAudioUrl && (
        <audio
          ref={audioRef}
          src={effectiveAudioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={handleError}
          className="hidden"
        />
      )}
    </div>
  );
}
