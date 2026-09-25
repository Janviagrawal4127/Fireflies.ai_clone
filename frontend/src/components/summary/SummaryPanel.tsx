'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import type { ActionItem, Summary } from '@/types';
import { updateActionItem, deleteActionItem, createActionItem, updateSummary } from '@/lib/api';
import { useAppStore } from '@/store/appStore';

// ─── Action Items Tab ─────────────────────────────────────────────────────────

interface ActionItemsTabProps {
  items: ActionItem[];
  meetingId: string;
  onChange: (items: ActionItem[]) => void;
}

export function ActionItemsTab({ items, meetingId, onChange }: ActionItemsTabProps) {
  const { addToast } = useAppStore();
  const [newTask, setNewTask] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const toggle = async (item: ActionItem) => {
    try {
      const updated = await updateActionItem(item.id, { completed: !item.completed });
      onChange(items.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      addToast('Failed to update action item', 'error');
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteActionItem(id);
      onChange(items.filter((i) => i.id !== id));
      addToast('Action item deleted');
    } catch {
      addToast('Failed to delete', 'error');
    }
  };

  const addItem = async () => {
    if (!newTask.trim()) return;
    try {
      const created = await createActionItem(meetingId, {
        task: newTask.trim(),
        assignee: newAssignee.trim() || undefined,
        due_date: newDueDate || undefined,
      });
      onChange([...items, created]);
      setNewTask('');
      setNewAssignee('');
      setNewDueDate('');
      setAdding(false);
      addToast('Action item added');
    } catch {
      addToast('Failed to add action item', 'error');
    }
  };

  const saveEdit = async (item: ActionItem) => {
    if (!editText.trim()) return;
    try {
      const updated = await updateActionItem(item.id, { task: editText.trim() });
      onChange(items.map((i) => (i.id === item.id ? updated : i)));
      setEditId(null);
    } catch {
      addToast('Failed to update', 'error');
    }
  };

  const completed = items.filter((i) => i.completed);
  const pending = items.filter((i) => !i.completed);

  return (
    <div className="space-y-4">
      {/* Pending items */}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Pending ({pending.length})
          </p>
          <div className="space-y-2">
            {pending.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition group"
              >
                <button onClick={() => toggle(item)} className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-indigo-500 transition-colors">
                  <Circle className="w-4.5 h-4.5" />
                </button>
                <div className="flex-1 min-w-0">
                  {editId === item.id ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(item); if (e.key === 'Escape') setEditId(null); }}
                        className="flex-1 text-sm border border-indigo-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button onClick={() => saveEdit(item)} className="text-indigo-600 hover:text-indigo-700"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-800">{item.task}</p>
                  )}
                  <div className="flex gap-3 mt-1">
                    {item.assignee && <span className="text-xs text-gray-400">{item.assignee}</span>}
                    {item.due_date && <span className="text-xs text-gray-400">Due: {item.due_date}</span>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditId(item.id); setEditText(item.task); }} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(item.id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed items */}
      {completed.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Completed ({completed.length})
          </p>
          <div className="space-y-2">
            {completed.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
                <button onClick={() => toggle(item)} className="mt-0.5 flex-shrink-0 text-indigo-500 hover:text-gray-400 transition-colors">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </button>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 line-through">{item.task}</p>
                  {item.assignee && <span className="text-xs text-gray-400">{item.assignee}</span>}
                </div>
                <button onClick={() => remove(item.id)} className="p-1 text-gray-300 hover:text-red-400 rounded opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add item */}
      {adding ? (
        <div className="border border-indigo-200 rounded-lg p-3 bg-indigo-50 space-y-2">
          <input
            autoFocus
            type="text"
            placeholder="Task description"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Assignee (optional)"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 rounded-lg transition-colors">
              Add Task
            </button>
            <button onClick={() => setAdding(false)} className="px-4 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-lg transition-colors justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Action Item
        </button>
      )}
    </div>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────

interface SummaryTabProps {
  summary: Summary;
  meetingId: string;
  onUpdated: (s: Summary) => void;
}

export function SummaryTab({ summary, meetingId, onUpdated }: SummaryTabProps) {
  const { addToast } = useAppStore();
  const [notes, setNotes] = useState(summary.notes ?? '');
  const [saving, setSaving] = useState(false);

  const saveNotes = async () => {
    setSaving(true);
    try {
      const updated = await updateSummary(meetingId, { notes });
      onUpdated(updated);
      addToast('Notes saved');
    } catch {
      addToast('Failed to save notes', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Overview</h3>
        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">
          {summary.overview || 'No summary available.'}
        </p>
      </div>

      {/* Key Topics */}
      {summary.key_topics.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Key Topics</h3>
          <div className="flex flex-wrap gap-2">
            {summary.key_topics.map((topic, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full font-medium border border-indigo-100"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this meeting..."
          rows={5}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={saveNotes}
          disabled={saving}
          className="mt-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save Notes'}
        </button>
      </div>
    </div>
  );
}
