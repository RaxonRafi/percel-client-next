'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageMeta } from '@/lib/types';

/** Page numbers to show, with `null` standing in for a collapsed run. */
function pageList(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | null)[] = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  if (from > 2) pages.push(null);
  for (let p = from; p <= to; p++) pages.push(p);
  if (to < total - 1) pages.push(null);
  pages.push(total);
  return pages;
}

const PAGE_SIZES = [10, 20, 50];

const pageButton =
  'flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40';

/**
 * Renders nothing for an empty list, so callers can drop it under any table
 * without checking first. Pass `onLimit` to offer a rows-per-page choice.
 */
export function Pagination({
  meta,
  onPage,
  onLimit,
  busy,
}: {
  meta: PageMeta | null;
  onPage: (page: number) => void;
  onLimit?: (limit: number) => void;
  busy?: boolean;
}) {
  if (!meta || meta.total === 0) return null;

  const first = (meta.page - 1) * meta.limit + 1;
  const last = Math.min(meta.page * meta.limit, meta.total);
  const idle = 'border-surface-3 bg-white text-ink-2 hover:bg-surface-2 hover:text-ink';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-4 text-xs text-ink-3">
        {onLimit && (
          <label className="flex items-center gap-2">
            Rows per page
            <select
              className="h-8 rounded-md border border-surface-3 bg-white px-2 text-xs font-semibold text-ink outline-none focus:border-accent"
              value={meta.limit}
              disabled={busy}
              onChange={(e) => onLimit(Number(e.target.value))}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        )}
        <p>
        Showing{' '}
        <span className="font-semibold text-ink">
          {first}–{last}
        </span>{' '}
        of <span className="font-semibold text-ink">{meta.total}</span>
        </p>
      </div>
      <nav className="flex items-center gap-1.5" aria-label="Pagination">
        <button
          type="button"
          aria-label="Previous page"
          className={cn(pageButton, idle)}
          disabled={busy || !meta.hasPrev}
          onClick={() => onPage(meta.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageList(meta.page, Math.max(meta.totalPages, 1)).map((p, i) =>
          p === null ? (
            // A gap sits between two distinct neighbours, so its index is stable.
            <span key={`gap-${i}`} className="px-1 text-xs text-ink-3">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === meta.page ? 'page' : undefined}
              className={cn(
                pageButton,
                p === meta.page ? 'border-accent bg-accent text-white' : idle,
              )}
              disabled={busy}
              onClick={() => onPage(p)}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          className={cn(pageButton, idle)}
          disabled={busy || !meta.hasNext}
          onClick={() => onPage(meta.page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
