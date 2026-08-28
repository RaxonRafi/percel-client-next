'use client';

import { Button } from './button';
import type { PageMeta } from '@/lib/types';

/**
 * Renders nothing for a single page of results, so callers can drop it under
 * any list without checking first.
 */
export function Pagination({
  meta,
  onPage,
  busy,
}: {
  meta: PageMeta | null;
  onPage: (page: number) => void;
  busy?: boolean;
}) {
  if (!meta || meta.totalPages <= 1) return null;

  const first = (meta.page - 1) * meta.limit + 1;
  const last = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-surface-2 pt-4">
      <p className="text-xs text-ink-3">
        {first}–{last} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={busy || !meta.hasPrev}
          onClick={() => onPage(meta.page - 1)}
        >
          Previous
        </Button>
        <span className="text-xs text-ink-3">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy || !meta.hasNext}
          onClick={() => onPage(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
