'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'success' | 'destructive';
type ToastInput = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastRecord = ToastInput & { id: string };

type ToastContextValue = {
  toasts: ToastRecord[];
  toast: (toast: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = (id: string) => setToasts((current) => current.filter((toast) => toast.id !== id));

  const toast = (input: ToastInput) => {
    const id = crypto.randomUUID();
    const record: ToastRecord = { id, ...input, variant: input.variant ?? 'default' };
    setToasts((current) => [...current, record]);
    setTimeout(() => dismiss(id), 4000);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo<ToastContextValue>(() => ({ toasts, toast, dismiss }), [toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export function Toaster() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-80 flex-col gap-3">
      {ctx.toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'rounded-xl border px-4 py-3 shadow-lg',
            toast.variant === 'success' && 'border-success/50 bg-success/10 text-success',
            toast.variant === 'destructive' && 'border-destructive/50 bg-destructive/10 text-destructive',
            toast.variant === 'default' && 'border-border bg-card text-card-foreground'
          )}
        >
          {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
          {toast.description && <p className="text-xs text-muted-foreground">{toast.description}</p>}
          <button
            type="button"
            onClick={() => ctx.dismiss(toast.id)}
            className="mt-2 text-xs text-muted-foreground underline underline-offset-4"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
