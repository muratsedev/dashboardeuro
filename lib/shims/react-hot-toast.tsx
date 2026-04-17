'use client';

import { useEffect, useMemo, useState } from 'react';

type ToastType = 'blank' | 'success' | 'error' | 'loading';
type ToastPosition = 'top-center' | 'bottom-center' | 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';

interface ToastOptions {
  id?: string;
  duration?: number;
  position?: ToastPosition;
}

interface ToastRecord {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  position?: ToastPosition;
}

interface ToasterProps {
  position?: ToastPosition;
}

let store: ToastRecord[] = [];
const listeners = new Set<(items: ToastRecord[]) => void>();

const notify = () => {
  const snapshot = [...store];
  listeners.forEach((listener) => listener(snapshot));
};

const removeToast = (id?: string) => {
  store = id ? store.filter((toast) => toast.id !== id) : [];
  notify();
};

const createToast = (message: string, type: ToastType, options: ToastOptions = {}) => {
  const id = options.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const duration = options.duration ?? (type === 'loading' ? 0 : 4000);

  store = [
    ...store.filter((toast) => toast.id !== id),
    {
      id,
      message,
      type,
      duration,
      position: options.position,
    },
  ];
  notify();

  if (duration > 0) {
    window.setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

type ToastHandler = ((message: string, options?: ToastOptions) => string) & {
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  loading: (message: string, options?: ToastOptions) => string;
  dismiss: (id?: string) => void;
  remove: (id?: string) => void;
  promise: <T>(promise: Promise<T>, messages: { loading: string; success: string | ((value: T) => string); error: string | ((error: unknown) => string) }, options?: ToastOptions) => Promise<T>;
};

const toast = ((message: string, options?: ToastOptions) => createToast(message, 'blank', options)) as ToastHandler;

toast.success = (message, options) => createToast(message, 'success', options);
toast.error = (message, options) => createToast(message, 'error', options);
toast.loading = (message, options) => createToast(message, 'loading', options);
toast.dismiss = (id?: string) => removeToast(id);
toast.remove = (id?: string) => removeToast(id);
toast.promise = async (promise, messages, options) => {
  const toastId = toast.loading(messages.loading, options);

  try {
    const value = await promise;
    toast.success(typeof messages.success === 'function' ? messages.success(value) : messages.success, {
      ...options,
      id: toastId,
    });
    return value;
  } catch (error) {
    toast.error(typeof messages.error === 'function' ? messages.error(error) : messages.error, {
      ...options,
      id: toastId,
    });
    throw error;
  }
};

const positionClasses: Record<ToastPosition, string> = {
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-right': 'bottom-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-left': 'bottom-4 left-4',
};

const toneClasses: Record<ToastType, string> = {
  blank: 'bg-slate-900 text-white',
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  loading: 'bg-amber-500 text-slate-950',
};

export function Toaster({ position = 'bottom-center' }: ToasterProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>(store);

  useEffect(() => {
    const listener = (items: ToastRecord[]) => setToasts(items);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const visibleToasts = useMemo(
    () => toasts.filter((toastItem) => (toastItem.position || position) === position),
    [position, toasts]
  );

  return (
    <div className={`pointer-events-none fixed z-[100] flex max-w-sm flex-col gap-2 ${positionClasses[position]}`}>
      {visibleToasts.map((toastItem) => (
        <div
          key={toastItem.id}
          className={`pointer-events-auto rounded-lg px-4 py-3 shadow-lg ${toneClasses[toastItem.type]}`}
          role="status"
        >
          {toastItem.message}
        </div>
      ))}
    </div>
  );
}

export { toast };
export default toast;