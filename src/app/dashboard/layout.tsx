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
    <div id="app" className="min-h-screen bg-slate-950 text-slate-300 font-sans text-sm selection:bg-cyan-500/30 selection:text-cyan-100 flex">
      {/* Fixed Narrow Sidebar */}
      <aside className="w-60 bg-slate-950 border-r border-slate-800/60 flex flex-col flex-shrink-0 h-screen sticky top-0 z-50">
        <Link href="/dashboard" className="px-5 py-4 border-b border-slate-800/60 flex items-center gap-3 hover:bg-slate-900/50 transition-colors">
          <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700/50 flex items-center justify-center text-cyan-400">
            <IconPackage size={18} />
          </div>
          <div className="font-display font-bold text-slate-200 tracking-wide text-base">
            Parcel<span className="text-cyan-500">Payout</span>
          </div>
        </Link>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 custom-scrollbar">
          {SECTIONS.map((section) => {
            const items = section.items.filter(visible);
            if (items.length === 0) return null;
            return (
              <React.Fragment key={section.label}>
                <div className="text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase mt-4 mb-2 px-2">
                  {section.label}
                </div>
                {items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] font-medium border border-transparent ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                          : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                      }`}
                    >
                      <item.icon size={18} className={isActive ? 'text-cyan-400' : 'text-slate-500'} /> 
                      {item.label}
                    </Link>
                  );
                })}
              </React.Fragment>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/60 bg-slate-950">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-900/80 transition-colors cursor-pointer border border-transparent hover:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {initials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-200 truncate">{user.name}</div>
              <div className="text-[11px] text-slate-500 truncate">
                {user.role.charAt(0) + user.role.slice(1).toLowerCase().replace('_', ' ')}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
            >
              <IconLogout size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-40 flex items-center justify-between px-6">
          <div>
            <div className="text-sm font-bold text-slate-200">{TITLES[pathname] ?? 'Dashboard'}</div>
            <div className="text-[11px] text-slate-500 font-mono tracking-wider">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
              }).toUpperCase()}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-64 h-8 bg-slate-900 border border-slate-800 rounded-md pl-9 pr-3 text-[13px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
              />
            </div>
            
            <div className="h-4 w-px bg-slate-800" />
            
            <button className="relative text-slate-500 hover:text-slate-300 transition-colors">
              <IconBell size={18} />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-cyan-500 border border-slate-950" />
            </button>
            
            <Link href="/" className="h-8 px-3 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-[12px] font-medium text-slate-300 transition-colors">
              <IconArrowLeft size={14} /> Site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
