'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

function Toast({ id, message, type }: { id: string; message: string; type: 'success' | 'error' | 'info' }) {
  const { removeToast } = useAppStore();

  const styles = {
    success: { bg: 'bg-emerald-600', icon: <CheckCircle2 className="w-4 h-4" /> },
    error: { bg: 'bg-red-600', icon: <XCircle className="w-4 h-4" /> },
    info: { bg: 'bg-blue-600', icon: <Info className="w-4 h-4" /> },
  };
  const { bg, icon } = styles[type];

  return (
    <div className={`flex items-center gap-3 ${bg} text-white px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      {icon}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={() => removeToast(id)} className="text-white/70 hover:text-white">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useAppStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  );
}
