import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  // Media player state
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  activeLineIndex: number;

  // Transcript search
  transcriptQuery: string;

  // Toasts
  toasts: Toast[];

  // Actions
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setActiveLineIndex: (i: number) => void;
  setTranscriptQuery: (q: string) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  activeLineIndex: -1,
  transcriptQuery: '',
  toasts: [],

  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setActiveLineIndex: (i) => set({ activeLineIndex: i }),
  setTranscriptQuery: (q) => set({ transcriptQuery: q }),

  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    // Auto-remove after 4 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
