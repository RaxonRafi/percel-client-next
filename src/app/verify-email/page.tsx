'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

type State = 'verifying' | 'done' | 'failed' | 'missing';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<State>(token ? 'verifying' : 'missing');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);
  const attempted = useRef(false);

  const verify = useCallback(async (value: string) => {
    setState('verifying');
    try {
      const res = await api.verifyEmail(value);
      setMessage(res.message ?? 'Your email address is confirmed.');
      setState('done');
    } catch (err) {
      setMessage(
        err instanceof ApiError ? err.message : 'That link is no longer valid.',
      );
      setState('failed');
    }
  }, []);

  useEffect(() => {
    // The token is single-use, so never spend it twice on a remount.
    if (!token || attempted.current) return;
    attempted.current = true;
    verify(token);
  }, [token, verify]);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.resendVerification(email);
      setResent(true);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Could not send the email');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'verifying') {
    return <p className="text-sm text-ink-3">Confirming your email address…</p>;
  }

  if (state === 'done') {
    return (
      <>
        <h1 className="font-display mb-2 text-2xl font-bold">Email confirmed</h1>
        <p className="mb-6 text-sm text-ink-2">{message}</p>
        <Button asChild className="w-full">
          <Link href="/login">Sign in</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display mb-2 text-2xl font-bold">
        {state === 'missing' ? 'Confirm your email' : 'Link not valid'}
      </h1>
      <p className="mb-6 text-sm text-ink-2">
        {state === 'missing'
          ? 'Open the link from your confirmation email, or request a new one below.'
          : message}
      </p>

      {resent ? (
        <p className="text-sm text-green">
          If that address needs confirming, a new link is on its way.
        </p>
      ) : (
        <form onSubmit={resend} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Sending…' : 'Send a new link'}
          </Button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-ink-3">
        <Link href="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-md">
        <Link href="/" className="font-display mb-6 block text-xl font-extrabold">
          Parcel <span className="text-accent">Payout</span>
        </Link>
        <Suspense fallback={<p className="text-sm text-ink-3">Loading…</p>}>
          <VerifyContent />
        </Suspense>
      </Card>
    </div>
  );
}
