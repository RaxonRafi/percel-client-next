'use client';

import { useEffect, useState } from 'react';
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

/** Top navigation for the public pages. Sits on a dark header. */
export function SiteNav({ current }: { current: 'home' | 'track' }) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    // Read after mount: localStorage does not exist during the server render.
    const sync = () => setSignedIn(Boolean(getAccessToken()));
    sync();
    return onAuthChange(sync);
  }, []);

  return (
    <nav className="nav wrap" data-in aria-label="Primary">
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
