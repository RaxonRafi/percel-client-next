import Link from 'next/link';
import { LayoutDashboard, MapPin, Check, Truck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden px-6 pb-20 pt-[120px] md:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_700px_500px_at_80%_50%,rgba(232,76,30,0.08),transparent_70%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(#0d0d0d 1px, transparent 1px), linear-gradient(90deg, #0d0d0d 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-surface-3 bg-white px-4 py-1.5 text-sm text-ink-2">
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-accent-bg text-accent">
              🚀
            </span>
            99.4% on-time delivery rate this quarter
          </div>
          <h1 className="font-display mb-6 text-[clamp(42px,5vw,72px)] font-extrabold leading-[1.05] tracking-tight">
            Deliver <span className="text-accent">faster,</span>
            <br />
            track smarter
          </h1>
          <p className="mb-11 max-w-md text-[17px] leading-relaxed text-ink-2">
            SwiftParcel gives logistics teams real-time visibility, intelligent
            routing, and seamless customer communication — all in one platform.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" /> View Dashboard
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/track">
                <MapPin className="h-4 w-4" /> Track a Package
              </Link>
            </Button>
          </div>
          <div className="mt-14 flex gap-10 border-t border-surface-3 pt-10">
            {[
              ['4.2M+', 'Packages delivered'],
              ['180+', 'Cities covered'],
              ['99.4%', 'On-time rate'],
            ].map(([val, lbl]) => (
              <div key={lbl}>
                <div className="font-display text-[28px] font-bold">{val}</div>
                <div className="text-sm text-ink-3">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden flex-col gap-4 lg:flex">
          <div className="rounded-[var(--radius-lg)] border border-surface-3 bg-white p-6 shadow-md">
            <div className="mb-5 flex justify-between">
              <div>
                <p className="text-sm text-ink-3">Tracking number</p>
                <p className="text-base font-semibold">#SWP-2024-98741</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-green-bg px-3 py-1 text-xs font-medium text-green">
                <span className="h-1.5 w-1.5 rounded-full bg-green" /> In Transit
              </span>
            </div>
            {[
              ['Picked up from sender', 'May 21 · 09:14 AM', true],
              ['Arrived at sorting hub', 'May 21 · 2:30 PM', true],
              ['Out for delivery', 'Today · 10:02 AM', 'active'],
              ['Delivered to recipient', 'Expected today by 3:00 PM', false],
            ].map(([title, time, state], i) => (
              <div key={i} className="flex gap-3 pb-5">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    state === true
                      ? 'bg-accent text-white'
                      : state === 'active'
                        ? 'border-2 border-accent bg-white text-accent'
                        : 'bg-surface-2 text-ink-3'
                  }`}
                >
                  {state === true ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : state === 'active' ? (
                    <Truck className="h-3.5 w-3.5" />
                  ) : (
                    <Home className="h-3.5 w-3.5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{title as string}</p>
                  <p className="text-xs text-ink-3">{time as string}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['124', 'Active deliveries', 'accent'],
              ['98.2%', 'Success rate', 'green'],
              ['42 min', 'Avg delivery', 'blue'],
              ['18', 'Active routes', 'amber'],
            ].map(([val, lbl, color]) => (
              <div
                key={lbl}
                className="rounded-[var(--radius-md)] border border-surface-3 bg-white p-4 shadow-sm"
              >
                <div
                  className={`mb-2 flex h-9 w-9 items-center justify-center rounded-[10px] bg-${color}-bg text-${color}`}
                />
                <div className="font-display text-[22px] font-bold">{val}</div>
                <div className="text-xs text-ink-3">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
