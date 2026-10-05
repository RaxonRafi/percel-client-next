import Link from 'next/link';
import Image from 'next/image';
import {
  IconArrowUpRight, IconBolt, IconCamera, IconClock, IconMapPin,
  IconMapPinFilled, IconSend, IconShieldCheck, IconSparkles, IconTruckDelivery,
} from '@tabler/icons-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '#why-us', label: 'Why us' },
  { href: '#services', label: 'Services' },
  { href: '/track', label: 'Track' },
  { href: '#contact', label: 'Contact' },
];

const reasons = [
  {
    icon: IconClock,
    title: 'Live tracking, door to door',
    text: 'Every scan is logged, so you always know where your parcel is.',
  },
  {
    icon: IconCamera,
    title: 'Proof on every delivery',
    text: 'Couriers confirm each drop-off before a parcel is marked delivered.',
  },
  {
    icon: IconShieldCheck,
    title: 'Claims without the back-and-forth',
    text: 'If something goes wrong, raise a claim and follow it from your dashboard.',
  },
];

const services = [
  {
    src: '/card_fast.jpg',
    title: 'Express Delivery',
    text: 'Same-day delivery across major cities',
  },
  {
    src: '/card_secure.jpg',
    title: 'Secure Lockers',
    text: '24/7 access to your high-value parcels',
  },
];

const container = 'mx-auto max-w-6xl px-6';
const eyebrow = 'mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent';
const sectionTitle = 'font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl';
const cardShadow = 'shadow-[0_18px_50px_-18px_rgba(13,13,13,0.18)]';

const Header = (
  <header className={`${container} flex items-center justify-between py-6`}>
    <Link href="/" className="font-display text-2xl font-bold tracking-tight">
      Parcel <span className="text-accent">Payout</span>
    </Link>

    <nav className="hidden items-center gap-8 text-sm font-medium text-ink-2 md:flex">
      {navLinks.map((link) => (
        <Link key={link.label} href={link.href} className="transition hover:text-accent">
          {link.label}
        </Link>
      ))}
    </nav>

    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="rounded-lg bg-surface-2 px-5 py-3 text-sm font-semibold transition hover:bg-surface-3"
      >
        Log In
      </Link>
      <Link
        href="/register"
        className={`hidden rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-2 sm:block ${cardShadow}`}
      >
        Get Started
      </Link>
    </div>
  </header>
);

const Hero = (
  <section className={`${container} grid items-center gap-16 pt-10 lg:grid-cols-2 lg:gap-12 lg:pt-16`}>
    <div className="relative">
      <IconSparkles
        className="absolute -top-10 right-10 hidden text-surface-3 lg:block"
        size={36}
        stroke={1}
        aria-hidden
      />
      <p className={eyebrow}>Super fast delivery</p>
      <h1 className="font-display text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
        We have faster delivery in your town
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-ink-2">
        Fast, reliable and fully tracked parcel delivery — from pickup to doorstep.
      </p>

      <form
        action="/track"
        className={`mt-8 flex max-w-md items-center rounded-xl bg-white p-1.5 transition focus-within:ring-2 focus-within:ring-accent/30 ${cardShadow}`}
      >
        <IconMapPinFilled className="ml-3 shrink-0 text-accent" size={18} aria-hidden />
        <input
          name="id"
          required
          aria-label="Tracking ID"
          placeholder="Type your tracking ID"
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-ink-3"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-8 py-3 text-sm font-semibold text-white transition hover:bg-accent-2"
        >
          Track
        </button>
      </form>

      {/* Dashed arrow pointing from the search bar to the hero image */}
      <svg
        className="absolute -bottom-14 right-0 hidden text-accent lg:block"
        width="130"
        height="50"
        viewBox="0 0 130 50"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 4c8 34 38 44 62 30s34-14 58-8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
        <path d="m114 20 9 6-9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>

    <div className="relative mx-auto w-full max-w-md lg:mr-0">
      <div className="absolute -bottom-4 -left-4 h-4/5 w-full rounded-[32px] bg-accent-bg" aria-hidden />
      <div className="relative aspect-square overflow-hidden rounded-[32px]">
        <Image
          src="/hero_parcel.jpg"
          alt="Courier handing a parcel to a customer"
          fill
          priority
          sizes="448px"
          className="object-cover"
        />
      </div>

      <div className={`absolute -right-3 top-10 w-44 rounded-xl bg-white p-3 motion-safe:animate-float xl:-right-10 ${cardShadow}`}>
        <div className="font-display flex items-center gap-2 text-sm font-medium">
          <IconBolt className="text-accent" size={18} aria-hidden /> Fast delivery
        </div>
        <p className="mt-1 text-xs leading-snug text-ink-3">We&apos;ll get it to you as quickly as lightning.</p>
      </div>

      <div className={`absolute -left-3 bottom-10 w-44 rounded-xl bg-white p-3 motion-safe:animate-float-delayed sm:-left-10 ${cardShadow}`}>
        <div className="font-display flex items-center gap-2 text-sm font-medium">
          <IconMapPin className="text-accent" size={18} aria-hidden /> Live locations
        </div>
        <p className="mt-1 text-xs leading-snug text-ink-3">See where your parcel is at every step.</p>
      </div>

      <div className="absolute -left-5 top-14 hidden h-10 w-10 -rotate-12 items-center justify-center rounded-lg bg-accent text-white sm:flex" aria-hidden>
        <IconTruckDelivery size={20} />
      </div>
      <div className="absolute -left-5 top-1/2 hidden h-10 w-10 rotate-12 items-center justify-center rounded-lg bg-blue text-white sm:flex" aria-hidden>
        <IconClock size={20} />
      </div>
      <div className="absolute -right-5 bottom-1/3 hidden h-10 w-10 rotate-12 items-center justify-center rounded-lg bg-amber text-white xl:flex" aria-hidden>
        <IconSend size={20} />
      </div>
    </div>
  </section>
);

const WhyUs = (
  <section id="why-us" className={`${container} grid scroll-mt-24 items-center gap-16 lg:grid-cols-2 lg:gap-12`}>
    <div className="relative mx-auto w-full max-w-md pl-4 lg:ml-0">
      <div className="absolute -bottom-4 left-0 h-4/5 w-[calc(100%-1rem)] rounded-[32px] bg-accent" aria-hidden />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[32px]">
        <Image
          src="/card_fast.jpg"
          alt="Delivery van driving through the city at dusk"
          fill
          sizes="448px"
          className="object-cover"
        />
      </div>

      {/* Rotating text badge */}
      <div className={`absolute -right-3 top-10 h-28 w-28 rounded-full bg-white sm:-right-10 ${cardShadow}`} aria-hidden>
        <svg viewBox="0 0 112 112" className="h-full w-full motion-safe:animate-spin-slow">
          <defs>
            <path id="badge-circle" d="M56 56m-41 0a41 41 0 1 1 82 0a41 41 0 1 1-82 0" />
          </defs>
          <text className="font-display fill-ink text-[11.5px] font-medium tracking-[0.18em]">
            <textPath href="#badge-circle">we have faster delivery for you ·</textPath>
          </text>
        </svg>
        <div className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue text-white">
          <IconArrowUpRight size={22} />
        </div>
      </div>
    </div>

    <div className="mx-auto w-full max-w-md lg:mr-0">
      <p className={eyebrow}>Why choose us</p>
      <h2 className={sectionTitle}>What made you decide to use our service?</h2>
      <p className="mt-4 text-base leading-relaxed text-ink-2">
        Send your parcel at any time and we will deliver it directly to the door. Here is what
        keeps people coming back.
      </p>

      <ul className="mt-8 space-y-4">
        {reasons.map(({ icon: Icon, title, text }) => (
          <li key={title} className={`flex items-start gap-4 rounded-2xl bg-white p-4 ${cardShadow}`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-bg text-accent">
              <Icon size={20} aria-hidden />
            </span>
            <div>
              <h3 className="font-display text-base font-medium">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-3">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const Services = (
  <section id="services" className={`${container} scroll-mt-24`}>
    <p className={eyebrow}>Choose a service</p>
    <h2 className={`${sectionTitle} mb-10`}>A solution for your delivery</h2>

    <div className="grid gap-6 md:grid-cols-2">
      {services.map((service) => (
        <div key={service.title} className="group relative h-72 overflow-hidden rounded-[32px]">
          <Image
            src={service.src}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h3 className="font-display mb-1 text-2xl font-semibold">{service.title}</h3>
            <p className="text-sm text-white/75">{service.text}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Footer = (
  <footer id="contact" className={`${container} scroll-mt-24 pb-10`}>
    <div className="flex flex-col items-start justify-between gap-8 rounded-[32px] bg-ink p-8 text-white md:flex-row md:items-center md:p-12">
      <div>
        <h2 className={sectionTitle}>Ready to send your first parcel?</h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
          Create an account in a minute, or check on a parcel that is already on its way.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        <Link href="/register" className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold transition hover:bg-accent-2">
          Get Started
        </Link>
        <Link href="/track" className="rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/20">
          Track a parcel
        </Link>
      </div>
    </div>
    <p className="mt-10 text-center text-xs text-ink-3">
      © {new Date().getFullYear()} Parcel Payout. All rights reserved.
    </p>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-ink">
      {/* Soft accent glow behind the header, top-left */}
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        {Header}
        <main className="space-y-24 pb-24 lg:space-y-32 lg:pb-32">
          {Hero}
          {WhyUs}
          {Services}
        </main>
        {Footer}
      </div>
    </div>
  );
}
