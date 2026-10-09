'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { AuthShell, PasswordField, SubmitButton } from '@/components/auth/auth-shell';
import { Icon } from '@/components/icon-sprite';

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
      <div className="auth-done" role="status">
        <i><Icon name="i-check" size={34} /></i>
        <h2>Password updated</h2>
        <p>Every session has been signed out. Taking you to the sign-in page…</p>
        <Link className="btn dark" href="/login">Sign in</Link>
      </div>
    );
  }

  return (
    <>
      <h1 data-in>Set a new password</h1>
      <p data-in>This link can be used once and expires 30 minutes after it was sent.</p>

      <form onSubmit={handleSubmit}>
        {!fromLink && (
          <div className="field" data-in>
            <label htmlFor="token">Reset token</label>
            <input
              className="input"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste the token from your email"
              required
            />
          </div>
        )}
        <PasswordField
          id="next"
          label="New password"
          value={passwords.next}
          onChange={(next) => setPasswords({ ...passwords, next })}
          placeholder="Create a new password"
          autoComplete="new-password"
        />
        <PasswordField
          id="confirm"
          label="Confirm new password"
          value={passwords.confirm}
          onChange={(confirm) => setPasswords({ ...passwords, confirm })}
          placeholder="Type it again"
          autoComplete="new-password"
        />
        {error && <p className="form-error" role="alert">{error}</p>}
        <SubmitButton loading={loading} loadingLabel="Updating…" disabled={!token.trim()}>
          Update password
        </SubmitButton>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell switchPrompt="Link expired?" switchHref="/forgot-password" switchLabel="Request a new one">
      <Suspense fallback={<p>Loading…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
