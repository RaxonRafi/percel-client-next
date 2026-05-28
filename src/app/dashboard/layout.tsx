'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth-storage';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { DashboardSidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace('/login');
      return;
    }
    api
      .getMe()
      .then(setUser)
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-ink-3">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <DashboardSidebar user={user} />
      <div className="ml-60 min-h-screen">{children}</div>
    </div>
  );
}
