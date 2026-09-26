'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ToastContainer from '@/components/ui/ToastContainer';
import CreateMeetingModal from '@/components/meetings/CreateMeetingModal';
import { useAppStore } from '@/store/appStore';
import {
  Plus, Search, Pin, Trash2, Edit2, X, Check,
  BookOpen, FileText, Calendar, ChevronRight,
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  meetingRef?: string;
}

const STORAGE_KEY = 'ff_notes';

function loadNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotebookPage() {
  const router = useRouter();
  const { addToast } = useAppStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMeetingRef, setNewMeetingRef] = useState('');

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const persist = useCallback((updated: Note[]) => {
    setNotes(updated);
    saveNotes(updated);
  }, []);

  const createNote = () => {
    if (!newTitle.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      meetingRef: newMeetingRef.trim() || undefined,
    };
    persist([note, ...notes]);
    setNewTitle('');
    setNewContent('');
    setNewMeetingRef('');
    setCreateOpen(false);
    addToast('Note created');
  };

  const deleteNote = (id: string) => {
    persist(notes.filter((n) => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
    addToast('Note deleted');
  };

  const togglePin = (id: string) => {
    persist(notes.map((n) => n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n));
  };

  const startEdit = (note: Note) => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditMode(true);
  };

  const saveEdit = () => {
    if (!selectedNote) return;
    const updated = notes.map((n) =>
      n.id === selectedNote.id
        ? { ...n, title: editTitle, content: editContent, updatedAt: new Date().toISOString() }
        : n
    );
    persist(updated);
    setSelectedNote({ ...selectedNote, title: editTitle, content: editContent });
    setEditMode(false);
    addToast('Note saved');
  };

  const filtered = notes
    .filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const pinned = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <Sidebar onNewMeeting={() => setMeetingModalOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left panel: note list */}
          <div className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col bg-white h-1/3 min-h-[250px] md:h-full md:min-h-0">
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-lg font-bold text-gray-900">Notebook</h1>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> New Note
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {search ? 'No notes match your search.' : 'No notes yet. Create your first note!'}
                  </p>
                </div>
              )}

              {pinned.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pinned</p>
                  {pinned.map((note) => (
                    <NoteListItem
                      key={note.id}
                      note={note}
                      isSelected={selectedNote?.id === note.id}
                      onSelect={() => { setSelectedNote(note); setEditMode(false); }}
                      onPin={() => togglePin(note.id)}
                      onDelete={() => deleteNote(note.id)}
                    />
                  ))}
                </div>
              )}

              {unpinned.length > 0 && (
                <div>
                  {pinned.length > 0 && <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Notes</p>}
                  {unpinned.map((note) => (
                    <NoteListItem
                      key={note.id}
                      note={note}
                      isSelected={selectedNote?.id === note.id}
                      onSelect={() => { setSelectedNote(note); setEditMode(false); }}
                      onPin={() => togglePin(note.id)}
                      onDelete={() => deleteNote(note.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: note detail */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedNote ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                  {editMode ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-xl font-bold text-gray-900 flex-1 border-b-2 border-indigo-500 outline-none pb-1 mr-4"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-gray-900 flex-1 truncate">{selectedNote.title}</h2>
                  )}
                  <div className="flex items-center gap-2">
                    {editMode ? (
                      <>
                        <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button onClick={() => setEditMode(false)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(selectedNote)} className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => togglePin(selectedNote.id)} className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${selectedNote.pinned ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`} title="Pin">
                          <Pin className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteNote(selectedNote.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="px-6 py-2 border-b border-gray-50 bg-white flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Created {formatDate(selectedNote.createdAt)}</span>
                  <span>Updated {formatDate(selectedNote.updatedAt)}</span>
                  {selectedNote.meetingRef && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {selectedNote.meetingRef}</span>}
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  {editMode ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={20}
                      className="w-full text-sm text-gray-800 leading-relaxed resize-none border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedNote.content || <span className="text-gray-400 italic">No content. Click Edit to add notes.</span>}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Select a note</h3>
                <p className="text-sm text-gray-400 max-w-xs">Choose a note from the list to view and edit it here.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Note Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">New Note</h2>
              <button onClick={() => setCreateOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
                <input
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Note title..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={5}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Meeting reference (optional)</label>
                <input
                  type="text"
                  value={newMeetingRef}
                  onChange={(e) => setNewMeetingRef(e.target.value)}
                  placeholder="e.g. Q3 Product Review"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={createNote}
                disabled={!newTitle.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Create Note
              </button>
              <button onClick={() => setCreateOpen(false)} className="px-5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateMeetingModal open={meetingModalOpen} onClose={() => setMeetingModalOpen(false)} onCreated={(m) => router.push(`/meetings/${m.id}`)} />
      <ToastContainer />
    </div>
  );
}

interface NoteListItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onPin: () => void;
  onDelete: () => void;
}

function NoteListItem({ note, isSelected, onSelect, onPin, onDelete }: NoteListItemProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative px-4 py-3 cursor-pointer border-l-2 transition-colors ${
        isSelected ? 'bg-indigo-50 border-indigo-500' : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>{note.title}</p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onPin(); }} className={`p-1 rounded ${note.pinned ? 'text-indigo-500' : 'text-gray-300 hover:text-indigo-500'}`}><Pin className="w-3 h-3" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded text-gray-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
      <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{note.content || 'No content'}</p>
      <p className="text-[10px] text-gray-300 mt-1">{formatDate(note.updatedAt)}</p>
    </div>
  );
}
