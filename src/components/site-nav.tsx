'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { getAccessToken, onAuthChange } from '@/lib/auth-storage';
import { Icon } from '@/components/icon-sprite';

const LINKS = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/#features', label: 'Features' },
  { href: '/#how', label: 'How it works' },
  { href: '/track', label: 'Track', key: 'track' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
];

/** Past this many pixels the nav switches to its solid "scrolled" look. */
const SCROLL_THRESHOLD = 24;

function subscribeToScroll(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
}

/** Top navigation for the public pages. Stays fixed to the top while scrolling. */
export function SiteNav({ current }: { current: 'home' | 'track' }) {
  const [signedIn, setSignedIn] = useState(false);
  // Only re-renders when the page crosses the threshold, not on every scroll event.
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > SCROLL_THRESHOLD,
    () => false,
  );

  useEffect(() => {
    // Read after mount: localStorage does not exist during the server render.
    const sync = () => setSignedIn(Boolean(getAccessToken()));
    sync();
    return onAuthChange(sync);
  }, []);

  return (
    <nav className={`nav wrap${scrolled ? ' scrolled' : ''}`} data-in aria-label="Primary">
      <Link className="brand" href="/">
        <Icon name="i-box" size={24} />
        Parcel Payout
      </Link>
      <div className="nav-links">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} aria-current={link.key === current ? 'page' : undefined}>
            {link.label}
          </Link>
        ))}
      </div>
      <div className="nav-actions">
        {signedIn ? (
          <Link className="btn" href="/dashboard">Dashboard</Link>
        ) : (
          <>
            <Link className="login" href="/login">Log in</Link>
            <Link className="btn" href="/register">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
