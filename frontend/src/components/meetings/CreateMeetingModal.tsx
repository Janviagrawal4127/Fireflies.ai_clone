'use client';

import { useState, useCallback } from 'react';
import { X, Plus, Minus, Upload, FileText } from 'lucide-react';
import { createMeeting } from '@/lib/api';
import { parsePlainTranscript } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import type { Meeting, CreateMeetingPayload } from '@/types';

interface CreateMeetingModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (meeting: Meeting) => void;
}

export default function CreateMeetingModal({ open, onClose, onCreated }: CreateMeetingModalProps) {
  const { addToast } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const getLocalISOTime = (d: Date = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const [date, setDate] = useState(getLocalISOTime());
  const [durationMin, setDurationMin] = useState(60);
  const [participants, setParticipants] = useState(['', '']);
  const [transcriptMethod, setTranscriptMethod] = useState<'paste' | 'upload'>('paste');
  const [rawTranscript, setRawTranscript] = useState('');

  const reset = () => {
    setTitle('');
    setDate(getLocalISOTime());
    setDurationMin(60);
    setParticipants(['', '']);
    setTranscriptMethod('paste');
    setRawTranscript('');
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setRawTranscript(ev.target?.result as string ?? '');
    reader.readAsText(file);
  }, []);

  const addParticipant = () => setParticipants((p) => [...p, '']);
  const removeParticipant = (i: number) => setParticipants((p) => p.filter((_, idx) => idx !== i));
  const setParticipant = (i: number, v: string) =>
    setParticipants((p) => p.map((s, idx) => (idx === i ? v : s)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { addToast('Title is required', 'error'); return; }

    setLoading(true);
    try {
      const filteredParticipants = participants.filter((p) => p.trim());
      const transcript = rawTranscript.trim()
        ? parsePlainTranscript(rawTranscript)
        : undefined;

      const payload: CreateMeetingPayload = {
        title: title.trim(),
        date: new Date(date).toISOString(),
        duration: durationMin * 60,
        participants: filteredParticipants,
        transcript,
        raw_transcript: rawTranscript || undefined,
      };

      const meeting = await createMeeting(payload);
      addToast('Meeting created successfully');
      onCreated(meeting);
      reset();
      onClose();
    } catch {
      addToast('Failed to create meeting', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">New Meeting</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Product Strategy Meeting"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Date + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min={1}
                value={durationMin}
                onChange={(e) => setDurationMin(parseInt(e.target.value) || 60)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => setParticipant(i, e.target.value)}
                    placeholder={`Participant ${i + 1}`}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  {participants.length > 1 && (
                    <button type="button" onClick={() => removeParticipant(i)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addParticipant}
                className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add participant
              </button>
            </div>
          </div>

          {/* Transcript */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transcript (optional)</label>
            <div className="flex gap-3 mb-3">
              <button
                type="button"
                onClick={() => setTranscriptMethod('paste')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  transcriptMethod === 'paste'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => setTranscriptMethod('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  transcriptMethod === 'upload'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload File
              </button>
            </div>

            {transcriptMethod === 'paste' ? (
              <textarea
                value={rawTranscript}
                onChange={(e) => setRawTranscript(e.target.value)}
                placeholder={'Paste transcript here...\n\nFormat:\n[Speaker Name]\nText of what they said...\n\n[Another Speaker]\nMore text...'}
                rows={6}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono"
              />
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-sm text-gray-500">Upload .txt or .vtt file</span>
                <input type="file" accept=".txt,.vtt" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
            {rawTranscript && (
              <p className="text-xs text-violet-600 mt-1">{rawTranscript.split('\n').length} lines loaded</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
