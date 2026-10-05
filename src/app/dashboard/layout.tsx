'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconPackage, IconLayoutDashboard, IconPackages,
  IconUsers, IconChartBar, IconUser, IconRobot,
  IconTruckDelivery, IconLogout, IconSearch, IconBell, IconArrowLeft,
  IconShield,
} from '@tabler/icons-react';
import { logout } from '@/lib/api';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import type { Role } from '@/lib/types';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  /** omit = visible to every signed-in role */
  roles?: Role[];
};

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { label: 'Overview', href: '/dashboard', icon: IconLayoutDashboard },
      {
        label: 'Shipments',
        href: '/dashboard/parcels',
        icon: IconPackages,
        // PENDING_DELIVERY is barred from every role-guarded route until an
        // admin approves the application.
        roles: ['ADMIN', 'SENDER', 'RECEIVER'],
      },
      {
        label: 'My deliveries',
        href: '/dashboard/deliveries',
        icon: IconTruckDelivery,
        roles: ['DELIVERY_PERSONNEL'],
      },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Customers', href: '/dashboard/users', icon: IconUsers, roles: ['ADMIN'] },
      { label: 'Couriers', href: '/dashboard/couriers', icon: IconTruckDelivery, roles: ['ADMIN'] },
      { label: 'Analytics', href: '/dashboard/analytics', icon: IconChartBar, roles: ['ADMIN'] },
      { label: 'Audit Logs', href: '/dashboard/audit', icon: IconShield, roles: ['ADMIN'] },
      { label: 'AI knowledge', href: '/dashboard/knowledge', icon: IconRobot, roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Account',
    items: [{ label: 'Profile', href: '/dashboard/profile', icon: IconUser }],
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
  '/dashboard/audit': 'System Audit Logs',
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
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  // This gate now covers only the cached-session read, so it clears in the
  // first tick after hydration — the pages below start fetching immediately
  // while `/users/me` verifies alongside them.
  if (status === 'initializing') {
    return (
      <div className="grid min-h-screen place-items-center bg-surface text-sm text-ink-3">
        Loading your dashboard…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface text-sm text-ink-3">
        Redirecting to sign in…
      </div>
    );
  }

  const visible = (item: NavItem) => !item.roles || item.roles.includes(user.role);

  return (
    <div id="app" className="flex min-h-screen bg-surface font-sans text-sm text-ink-2 selection:bg-accent/20 selection:text-ink">
      <aside className="sticky top-0 z-50 flex h-screen w-60 flex-shrink-0 flex-col border-r border-surface-3 bg-white">
        <Link href="/dashboard" className="flex h-16 items-center gap-3 border-b border-surface-3 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
            <IconPackage size={20} />
          </div>
          <div className="font-display text-lg font-bold text-ink">
            Parcel <span className="text-accent">Payout</span>
          </div>
        </Link>

        <nav className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {SECTIONS.map((section) => {
            const items = section.items.filter(visible);
            if (items.length === 0) return null;
            return (
              <React.Fragment key={section.label}>
                <div className="mb-1 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-3 first:mt-0">
                  {section.label}
                </div>
                {items.map((item) => {
                  // Nested routes (e.g. /parcels/new) keep their section highlighted.
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-accent-bg font-semibold text-accent'
                          : 'font-medium text-ink-2 hover:bg-surface-2 hover:text-ink'
                      }`}
                    >
                      <item.icon size={18} className={isActive ? 'text-accent' : 'text-ink-3'} />
                      {item.label}
                    </Link>
                  );
                })}
              </React.Fragment>
            );
          })}
        </nav>

        <div className="border-t border-surface-3 p-3">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white">
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">{user.name}</div>
              <div className="truncate text-xs text-ink-3">
                {user.role.charAt(0) + user.role.slice(1).toLowerCase().replace('_', ' ')}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="rounded-md p-1.5 text-ink-3 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <IconLogout size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-surface-3 bg-white/90 px-6 backdrop-blur-md">
          <div>
            <div className="font-display text-base font-semibold text-ink">{TITLES[pathname] ?? 'Dashboard'}</div>
            <div className="text-xs text-ink-3">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="group relative hidden md:block">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 transition-colors group-focus-within:text-accent" />
              <input
                type="text"
                placeholder="Search resources..."
                className="h-9 w-64 rounded-lg border border-surface-3 bg-surface pl-9 pr-3 text-sm text-ink transition-colors placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
              <IconBell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-white" />
            </button>

            <Link href="/" className="flex h-9 items-center gap-2 rounded-lg border border-surface-3 bg-white px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
              <IconArrowLeft size={16} /> Site
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
