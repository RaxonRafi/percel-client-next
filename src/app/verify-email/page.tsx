'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { AuthShell, SubmitButton } from '@/components/auth/auth-shell';
import { Icon } from '@/components/icon-sprite';

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
    return <p>Confirming your email address…</p>;
  }

  if (state === 'done') {
    return (
      <div className="auth-done" role="status">
        <i><Icon name="i-check" size={34} /></i>
        <h2>Email confirmed</h2>
        <p>{message}</p>
        <Link className="btn dark" href="/login">Sign in</Link>
      </div>
    );
  }

  return (
    <>
      <h1 data-in>{state === 'missing' ? 'Confirm your email' : 'Link not valid'}</h1>
      <p data-in>
        {state === 'missing'
          ? 'Open the link from your confirmation email, or request a new one below.'
          : message}
      </p>

      {resent ? (
        <div className="notice" style={{ marginTop: 30 }}>
          <Icon name="i-info" size={16} />
          <span>If that address needs confirming, a new link is on its way.</span>
        </div>
      ) : (
        <form onSubmit={resend}>
          <div className="field" data-in>
            <label htmlFor="email">Email</label>
            <div className="input-wrap">
              <Icon name="i-mail" size={18} />
              <input
                className="input"
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <SubmitButton loading={busy} loadingLabel="Sending…">Send a new link</SubmitButton>
        </form>
      )}
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell switchPrompt="Already confirmed?" switchHref="/login" switchLabel="Sign in">
      <Suspense fallback={<p>Loading…</p>}>
        <VerifyContent />
      </Suspense>
    </AuthShell>
  );
}
