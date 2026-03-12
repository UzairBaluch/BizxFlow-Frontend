import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type Toast = { id: number; message: string; type: 'success' | 'error' };

const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error') => void;
} | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 md:left-auto md:right-4 md:max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`rounded-lg border px-4 py-3 shadow-lg ${
              t.type === 'error'
                ? 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)]'
                : 'border-[var(--app-border)] bg-[var(--app-text)] text-[var(--app-bg)]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span>{t.message}</span>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="opacity-80 hover:opacity-100"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
