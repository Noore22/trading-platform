'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
    warning: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const toastMethods = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
    warning: (msg: string) => addToast(msg, 'warning')
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl min-w-[280px] max-w-[400px] animate-in slide-in-from-right-8 fade-in duration-300 ${
              t.type === 'error' ? 'bg-danger/10 border-danger/30 text-danger' :
              t.type === 'success' ? 'bg-success/10 border-success/30 text-success' :
              t.type === 'warning' ? 'bg-warning/10 border-warning/30 text-warning' :
              'bg-primary/10 border-primary/30 text-primary'
            } bg-gray-950`}
          >
            {t.type === 'error' && <AlertCircle size={18} className="shrink-0" />}
            {t.type === 'success' && <CheckCircle size={18} className="shrink-0" />}
            {(t.type === 'info' || t.type === 'warning') && <Info size={18} className="shrink-0" />}
            
            <span className="text-xs font-semibold flex-1 tracking-wide text-white">{t.message}</span>
            
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-gray-500 hover:text-white transition">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
