'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import type { Role } from '@/lib/types';

const field =
  'w-full h-10 rounded-lg border border-surface-3 bg-white px-3 text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none placeholder:text-ink-3';
const label = 'block text-xs font-semibold text-ink-2 mb-1.5';

export default function NewUserPage() {
  const router = useRouter();
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: Role;
  }>({ name: '', email: '', password: '', role: 'ADMIN' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.register(form);
      router.push('/dashboard/users');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Request failed');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
        </Link>
        <h1 className="mt-3 flex items-center gap-2 text-xl font-bold text-ink">
          <UserIcon className="h-5 w-5 text-accent" />
          New account
        </h1>
        <p className="mt-1 text-[13px] text-ink-3">
          Provision an account with a temporary password the user can change after signing in.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <form onSubmit={createAccount} className="rounded-xl border border-surface-3 bg-white shadow-sm">
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="name">Name</label>
            <input
              id="name"
              className={field}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={field}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={label} htmlFor="password">Temporary password</label>
            <input
              id="password"
              type="password"
              className={field}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={label} htmlFor="role">Role</label>
            <select
              id="role"
              className={field}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            >
              <option value="ADMIN">Admin</option>
              <option value="SENDER">Sender</option>
              <option value="RECEIVER">Receiver</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-surface-3 px-6 py-4">
          <Button asChild variant="secondary">
            <Link href="/dashboard/users">Cancel</Link>
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </Button>
        </div>
      </form>
    </div>
  );
}
