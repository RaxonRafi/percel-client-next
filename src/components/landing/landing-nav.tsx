import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-[68px] items-center justify-between border-b border-surface-3 bg-surface/90 px-6 backdrop-blur-xl md:px-12">
      <Link href="/" className="font-display flex items-center gap-2 text-[22px] font-extrabold text-ink">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
        Swift<span className="text-accent">Parcel</span>
      </Link>
      <div className="hidden items-center gap-8 md:flex">
        <Link href="#features" className="text-sm text-ink-2 hover:text-accent">
          Solutions
        </Link>
        <Link href="/track" className="text-sm text-ink-2 hover:text-accent">
          Tracking
        </Link>
        <Link href="/login" className="text-sm text-ink-2 hover:text-accent">
          Login
        </Link>
        <Button asChild variant="dark" size="sm">
          <Link href="/dashboard">Open Dashboard →</Link>
        </Button>
      </div>
    </nav>
  );
}
