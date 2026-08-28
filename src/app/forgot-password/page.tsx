'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the reset link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-md">
        <Link href="/" className="font-display mb-6 block text-xl font-extrabold">
          Parcel <span className="text-accent">Payout</span>
        </Link>

        {sent ? (
          <>
            <h1 className="font-display mb-2 text-2xl font-bold">Check your inbox</h1>
            {/* The API answers identically either way, so this copy must not
                imply the address was found. */}
            <p className="mb-6 text-sm text-ink-2">
              If an account exists for <strong>{email}</strong>, a reset link is on its
              way. The link works once and expires after 30 minutes.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="font-display mb-2 text-2xl font-bold">Forgot your password?</h1>
            <p className="mb-6 text-sm text-ink-3">
              Enter your email and we will send you a link to set a new one.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-ink-3">
              Remembered it?{' '}
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
