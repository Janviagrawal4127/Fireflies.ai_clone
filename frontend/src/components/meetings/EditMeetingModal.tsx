'use client';

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { updateMeeting } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import type { Meeting, UpdateMeetingPayload } from '@/types';

interface EditMeetingModalProps {
  meeting: Meeting;
  onClose: () => void;
  onUpdated: (meeting: Meeting) => void;
}

export default function EditMeetingModal({ meeting, onClose, onUpdated }: EditMeetingModalProps) {
  const { addToast } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(meeting.title);
  const getLocalISOTime = (d: Date = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const [date, setDate] = useState(getLocalISOTime(new Date(meeting.date)));
  const [durationMin, setDurationMin] = useState(Math.round(meeting.duration / 60));
  const [participants, setParticipants] = useState<string[]>(
    meeting.participants.length ? meeting.participants : ['']
  );

  const addParticipant = () => setParticipants((p) => [...p, '']);
  const removeParticipant = (i: number) =>
    setParticipants((p) => p.filter((_, idx) => idx !== i));
  const setParticipant = (i: number, v: string) =>
    setParticipants((p) => p.map((s, idx) => (idx === i ? v : s)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { addToast('Title is required', 'error'); return; }
    setLoading(true);
    try {
      const payload: UpdateMeetingPayload = {
        title: title.trim(),
        date: new Date(date).toISOString(),
        duration: durationMin * 60,
        participants: participants.filter((p) => p.trim()),
      };
      const updated = await updateMeeting(meeting.id, payload);
      addToast('Meeting updated successfully');
      onUpdated(updated);
      onClose();
    } catch {
      addToast('Failed to update meeting', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Edit Meeting</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Date + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={1}
                value={durationMin}
                onChange={(e) => setDurationMin(parseInt(e.target.value) || 60)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParticipant(i)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addParticipant}
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add participant
              </button>
            </div>
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
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
