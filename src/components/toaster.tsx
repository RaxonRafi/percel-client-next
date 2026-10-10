'use client';

import { useSyncExternalStore } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { dismissToast, toastStore } from '@/lib/toast';

/** Renders the action toasts raised through `toast` in `@/lib/toast`. */
export function Toaster() {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot,
  );

  return (
    // Bottom centre: the realtime notifications own the top right and the chat
    // launcher the bottom right. Above the dialog layer (z-60) so a toast
    // raised from inside a modal is not hidden behind its overlay.
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      {toasts.map((item) => {
        const isError = item.kind === 'error';
        const Icon = isError ? AlertCircle : CheckCircle2;
        return (
          <div
            key={item.id}
            role={isError ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-surface-3 bg-white p-3 shadow-lg animate-fade-in"
          >
            <Icon
              className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isError ? 'text-rose-600' : 'text-emerald-600'}`}
            />
            <p className="min-w-0 flex-1 break-words text-sm text-ink">{item.message}</p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismissToast(item.id)}
              className="h-6 flex-shrink-0 rounded-md p-1 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
