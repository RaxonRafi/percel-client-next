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
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 pt-4">
      <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
        {first}–{last} <span className="text-slate-600">of</span> <span className="text-slate-300 font-bold">{meta.total}</span>
      </p>
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={busy || !meta.hasPrev}
          onClick={() => onPage(meta.page - 1)}
        >
          Previous
        </Button>
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
          Page <span className="text-slate-300 font-bold">{meta.page}</span> <span className="text-slate-600">of</span> {meta.totalPages}
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
