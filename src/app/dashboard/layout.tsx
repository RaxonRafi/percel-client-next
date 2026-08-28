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
  '/dashboard/deliveries': 'My deliveries',
  '/dashboard/users': 'Customers',
  '/dashboard/couriers': 'Delivery partners',
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
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--ink3)' }}>
        Loading your dashboard…
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--ink3)' }}>
        Redirecting to sign in…
      </div>
    );
  }

  const visible = (item: NavItem) => !item.roles || item.roles.includes(user.role);

  return (
    <div id="app" style={{ display: 'block' }}>
      <div className="app-layout">

        {/* Sidebar */}
        <aside className="sidebar">
          <Link href="/dashboard" className="sidebar-brand">
            <div className="sidebar-brand-icon"><IconPackage size={18} color="var(--white)" /></div>
            Parcel<span>Payout</span>
          </Link>
          <nav className="sidebar-nav">
            {SECTIONS.map((section) => {
              const items = section.items.filter(visible);
              if (items.length === 0) return null;
              return (
                <React.Fragment key={section.label}>
                  <div className="nav-section-label">{section.label}</div>
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                    >
                      <item.icon size={20} /> {item.label}
                    </Link>
                  ))}
                </React.Fragment>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="user-avatar">{initials(user.name)}</div>
              <div>
                <div className="user-name">{user.name}</div>
                <div className="user-role">
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase().replace('_', ' ')}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex',
                }}
              >
                <IconLogout size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="main-content">
          <div className="topbar">
            <div>
              <div className="topbar-title">{TITLES[pathname] ?? 'Dashboard'}</div>
              <div style={{ fontSize: '12px', color: 'var(--ink3)', marginTop: '1px' }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </div>
            </div>
            <div className="topbar-right">
              <div className="search-box">
                <IconSearch size={18} /> Search packages, drivers...
              </div>
              <div className="topbar-icon-btn notif-dot">
                <IconBell size={18} />
              </div>
              <Link href="/" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                <IconArrowLeft size={16} /> Back to site
              </Link>
            </div>
          </div>

          <div className="dash-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
