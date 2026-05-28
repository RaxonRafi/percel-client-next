import Link from 'next/link';
import { LandingNav } from '@/components/landing/landing-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <>
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-10 rounded-[var(--radius-lg)] bg-ink p-12 text-white md:flex-row">
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Ready to modernize your{' '}
              <span className="text-accent-2">delivery ops?</span>
            </h2>
            <p className="mt-3 max-w-md text-white/55">
              Join logistics companies already running on SwiftParcel. Start free,
              scale as you grow.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
            <Button asChild variant="secondary" className="border-white/20 text-white/80">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
      <footer className="flex flex-col items-center justify-between gap-4 border-t border-surface-3 px-6 py-12 text-sm text-ink-3 md:flex-row md:px-12">
        <div>© {new Date().getFullYear()} SwiftParcel Technologies Ltd.</div>
        <div className="flex gap-6">
          <Link href="/track">Track</Link>
          <Link href="/login">Login</Link>
        </div>
      </footer>
    </>
  );
}
