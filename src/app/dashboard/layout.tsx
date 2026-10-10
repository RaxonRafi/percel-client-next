'use client';

import '@/styles/dashboard.css';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/api';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { NotificationsProvider } from '@/lib/notifications-context';
import { NotificationBell, NotificationToasts } from '@/components/dashboard/notification-bell';
import { Icon } from '@/components/icon-sprite';
import type { Role } from '@/lib/types';

type NavItem = {
  label: string;
  href: string;
  icon: string;
  /** omit = visible to every signed-in role */
  roles?: Role[];
};

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { label: 'Overview', href: '/dashboard', icon: 'i-grid' },
      // Every role: incoming parcels and delivery history are scoped by who a
      // parcel is addressed to, so couriers and applicants have them too.
      { label: 'Shipments', href: '/dashboard/parcels', icon: 'i-box' },
      {
        label: 'My deliveries',
        href: '/dashboard/deliveries',
        icon: 'i-truck',
        roles: ['DELIVERY_PERSONNEL'],
      },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Customers', href: '/dashboard/users', icon: 'i-users', roles: ['ADMIN'] },
      { label: 'Couriers', href: '/dashboard/couriers', icon: 'i-truck', roles: ['ADMIN'] },
      { label: 'Analytics', href: '/dashboard/analytics', icon: 'i-chart', roles: ['ADMIN'] },
      { label: 'Audit logs', href: '/dashboard/audit', icon: 'i-shield', roles: ['ADMIN'] },
      { label: 'AI knowledge', href: '/dashboard/knowledge', icon: 'i-bot', roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Account',
    items: [{ label: 'Profile', href: '/dashboard/profile', icon: 'i-user' }],
  },
];

const TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/parcels': 'Shipments',
  '/dashboard/parcels/new': 'New shipment',
  '/dashboard/deliveries': 'My deliveries',
  '/dashboard/users': 'Customers',
  '/dashboard/users/new': 'New account',
  '/dashboard/couriers': 'Delivery partners',
  '/dashboard/couriers/applications': 'Courier applications',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/audit': 'System audit logs',
  '/dashboard/knowledge': 'AI knowledge base',
  '/dashboard/profile': 'Profile',
};

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <DashboardShell>{children}</DashboardShell>
        <NotificationToasts />
      </NotificationsProvider>
    </AuthProvider>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-surface text-sm text-ink-3">
      {children}
    </div>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [trackId, setTrackId] = useState('');

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  // This gate now covers only the cached-session read, so it clears in the
  // first tick after hydration — the pages below start fetching immediately
  // while `/users/me` verifies alongside them.
  if (status === 'initializing') return <Gate>Loading your dashboard…</Gate>;
  if (!user) return <Gate>Redirecting to sign in…</Gate>;

  const visible = (item: NavItem) => !item.roles || item.roles.includes(user.role);
  const canCreate = user.role === 'SENDER' || user.role === 'ADMIN';
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="pg-dash">
      <div className="app">
        <aside className={`side on-dark${menuOpen ? ' open' : ''}`} id="side">
          <div className="hero-grid" aria-hidden="true" />
          <Link className="brand" href="/dashboard" onClick={closeMenu}>
            <Icon name="i-box" size={24} />Parcel Payout
          </Link>

          {canCreate && (
            <Link className="btn side-new" href="/dashboard/parcels/new" onClick={closeMenu}>
              <Icon name="i-plus" size={16} />New shipment
            </Link>
          )}

          <nav className="side-nav" aria-label="Dashboard">
            {SECTIONS.map((section) => {
              const items = section.items.filter(visible);
              if (items.length === 0) return null;
              return (
                <React.Fragment key={section.label}>
                  <div className="side-label">{section.label}</div>
                  {items.map((item) => {
                    // Nested routes (e.g. /parcels/new) keep their section highlighted.
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="side-link"
                        aria-current={isActive ? 'page' : undefined}
                        onClick={closeMenu}
                      >
                        <Icon name={item.icon} size={19} />
                        {item.label}
                      </Link>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </nav>

          <div className="side-user">
            <span className="avatar">{initials(user.name)}</span>
            <div style={{ minWidth: 0 }}>
              <b>{user.name}</b>
              <span>{user.role.charAt(0) + user.role.slice(1).toLowerCase().replace('_', ' ')}</span>
            </div>
            <button type="button" onClick={handleLogout} aria-label="Sign out" title="Sign out">
              <Icon name="i-logout" size={17} />
            </button>
          </div>
        </aside>

        <div className="main">
          <header className="top">
            <button
              className="icon-btn menu-btn"
              type="button"
              aria-label="Open menu"
              aria-controls="side"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Icon name="i-menu" size={19} />
            </button>
            <div>
              <h1>{TITLES[pathname] ?? 'Dashboard'}</h1>
              <div className="date">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </div>
            </div>

            <div className="top-actions">
              {/* Jumps to the public tracking page for any tracking ID */}
              <form
                className="search"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (trackId.trim()) router.push(`/track/${encodeURIComponent(trackId.trim())}`);
                }}
              >
                <Icon name="i-search" size={17} />
                <input
                  type="search"
                  placeholder="Track by ID (TRK-...)"
                  aria-label="Track a parcel by ID"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                />
              </form>

              <NotificationBell />

              <Link className="site-link" href="/">
                <Icon name="i-back" size={16} /><span>Site</span>
              </Link>
            </div>
          </header>

          <main className="content">{children}</main>
        </div>
      </div>

      {menuOpen && <div className="scrim" onClick={closeMenu} />}
    </div>
  );
}
