export type ToastKind = 'success' | 'error';

export type ToastItem = { id: number; kind: ToastKind; message: string };

/** Errors stay up longer: they are usually the longer read. */
const DURATION_MS: Record<ToastKind, number> = { success: 4000, error: 7000 };
const MAX_VISIBLE = 4;

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit(next: ToastItem[]) {
  items = next;
  listeners.forEach((listener) => listener());
}

function push(kind: ToastKind, message: string) {
  const id = nextId++;
  emit([...items, { id, kind, message }].slice(-MAX_VISIBLE));
  setTimeout(() => dismissToast(id), DURATION_MS[kind]);
}

export function dismissToast(id: number) {
  if (items.some((t) => t.id === id)) emit(items.filter((t) => t.id !== id));
}

/**
 * Feedback for something the user just did — a create, update or delete.
 * A module-level store rather than context, so a toast raised right before a
 * redirect is still on screen when the next page renders.
 */
export const toast = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message),
};

const EMPTY: ToastItem[] = [];

export const toastStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => items,
  getServerSnapshot: () => EMPTY,
};
