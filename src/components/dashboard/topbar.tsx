import Link from 'next/link';
import { ArrowLeft, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardTopbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-surface-3 bg-white px-8">
      <div>
        <h1 className="font-display text-lg font-bold">{title}</h1>
        <p className="text-xs text-ink-3">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-[var(--radius-md)] border border-surface-3 bg-surface px-3 py-2 text-sm text-ink-3 md:flex">
          <Search className="h-4 w-4" />
          Search packages…
        </div>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-surface-3 bg-surface"
        >
          <Bell className="h-4 w-4 text-ink-2" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-white" />
        </button>
        <Button asChild variant="dark" size="sm">
          <Link href="/">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
        </Button>
      </div>
    </header>
  );
}
