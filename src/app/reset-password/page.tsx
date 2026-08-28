'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The emailed link carries the token; allow pasting it if the link was mangled.
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [passwords, setPasswords] = useState({ next: '', confirm: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const fromLink = Boolean(searchParams.get('token'));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (passwords.next !== passwords.confirm) {
      setError('The two passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token.trim(), passwords.next);
      setDone(true);
      // Resetting ends every session, so there is nothing to keep — go sign in.
      setTimeout(() => router.replace('/login'), 1500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not reset the password — the link may have expired',
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <>
        <h1 className="font-display mb-2 text-2xl font-bold">Password updated</h1>
        <p className="mb-6 text-sm text-ink-2">
          Every session has been signed out. Taking you to the sign-in page…
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Sign in</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display mb-2 text-2xl font-bold">Set a new password</h1>
      <p className="mb-6 text-sm text-ink-3">
        This link can be used once and expires 30 minutes after it was sent.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!fromLink && (
          <div>
            <Label htmlFor="token">Reset token</Label>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste the token from your email"
              required
            />
          </div>
        )}
        <div>
          <Label htmlFor="next">New password</Label>
          <Input
            id="next"
            type="password"
            value={passwords.next}
            onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || !token.trim()}>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-ink-3">
        Link expired?{' '}
        <Link href="/forgot-password" className="text-accent hover:underline">
          Request a new one
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-md">
        <Link href="/" className="font-display mb-6 block text-xl font-extrabold">
          Parcel <span className="text-accent">Payout</span>
        </Link>
        <Suspense fallback={<p className="text-sm text-ink-3">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </Card>
    </div>
  );
}
