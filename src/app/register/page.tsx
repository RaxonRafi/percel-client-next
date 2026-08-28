'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { setAuth } from '@/lib/auth-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/types';

/**
 * Only these two are meaningful on a public registration: any other role sent
 * without an admin token is ignored and the account is created as SENDER.
 * DELIVERY_PERSONNEL lands at PENDING_DELIVERY until an admin approves it.
 */
const INTENTS: { role: Role; title: string; blurb: string }[] = [
  { role: 'SENDER', title: 'Send parcels', blurb: 'Book shipments and track them.' },
  {
    role: 'DELIVERY_PERSONNEL',
    title: 'Deliver parcels',
    blurb: 'Apply as a delivery partner — an admin reviews your application.',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'SENDER' as Role,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role: form.role,
      });
      setAuth(res.accessToken, res.refreshToken, res.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <Card className="w-full max-w-md">
        <Link href="/" className="font-display mb-6 block text-xl font-extrabold">
          Parcel <span className="text-accent">Payout</span>
        </Link>
        <h1 className="font-display mb-2 text-2xl font-bold">Create account</h1>
        <p className="mb-6 text-sm text-ink-3">Tell us how you plan to use Parcel Payout</p>

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {INTENTS.map((intent) => (
            <button
              key={intent.role}
              type="button"
              onClick={() => setForm({ ...form, role: intent.role })}
              className={cn(
                'rounded-[var(--radius-md)] border p-3 text-left transition-colors',
                form.role === intent.role
                  ? 'border-accent bg-accent-bg'
                  : 'border-surface-3 hover:border-ink-3',
              )}
            >
              <span className="block text-sm font-medium">{intent.title}</span>
              <span className="mt-1 block text-xs text-ink-3">{intent.blurb}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">
              Phone {form.role === 'DELIVERY_PERSONNEL' ? '' : '(optional)'}
            </Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required={form.role === 'DELIVERY_PERSONNEL'}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {form.role === 'DELIVERY_PERSONNEL' && (
            <p className="text-xs text-ink-3">
              You can sign in right away, but deliveries stay locked until an admin
              approves your application.
            </p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Register'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-3">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
