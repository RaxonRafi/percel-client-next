'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { clearAuth } from '@/lib/auth-storage';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const mainNav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/parcels', label: 'Shipments', icon: Package },
];

const adminNav = [
  { href: '/dashboard/users', label: 'Customers', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
];

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user.role === 'ADMIN';

  async function logout() {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    clearAuth();
    router.push('/login');
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-50 flex w-60 flex-col bg-ink text-white">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-6 font-display text-xl font-extrabold">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <Package className="h-4 w-4" />
        </div>
        Swift<span className="text-accent-2">Parcel</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Main
        </p>
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'mb-0.5 flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition',
              pathname === item.href
                ? 'bg-accent text-white'
                : 'text-white/55 hover:bg-white/10 hover:text-white',
            )}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        ))}
        {isAdmin && (
          <>
            <p className="mt-4 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
              Management
            </p>
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'mb-0.5 flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition',
                  pathname === item.href
                    ? 'bg-accent text-white'
                    : 'text-white/55 hover:bg-white/10 hover:text-white',
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            ))}
          </>
        )}
        <p className="mt-4 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Settings
        </p>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-white/55 hover:bg-white/10"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] p-2">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-accent text-xs font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-[11px] text-white/40">
              {user.role} · {user.email}
            </p>
          </div>
          <Settings className="h-4 w-4 text-white/30" />
        </div>
      </div>
    </aside>
  );
}
