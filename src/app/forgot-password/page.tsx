'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { AuthShell, SubmitButton } from '@/components/auth/auth-shell';
import { Icon } from '@/components/icon-sprite';

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
    <AuthShell switchPrompt="Remembered it?" switchHref="/login" switchLabel="Sign in">
      {sent ? (
        <div className="auth-done" role="status">
          <i><Icon name="i-mail" size={32} /></i>
          <h2>Check your inbox</h2>
          {/* The API answers identically either way, so this copy must not
              imply the address was found. */}
          <p>
            If an account exists for <strong>{email}</strong>, a reset link is on its
            way. The link works once and expires after 30 minutes.
          </p>
          <Link className="btn dark" href="/login">Back to sign in</Link>
        </div>
      ) : (
        <>
          <h1 data-in>Forgot your password?</h1>
          <p data-in>Enter your email and we will send you a link to set a new one.</p>

          <form onSubmit={handleSubmit}>
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
            {error && <p className="form-error" role="alert">{error}</p>}
            <SubmitButton loading={loading} loadingLabel="Sending…">Send reset link</SubmitButton>
          </form>
        </>
      )}
    </AuthShell>
  );
}
