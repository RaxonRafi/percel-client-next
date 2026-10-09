'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { setAuth } from '@/lib/auth-storage';
import { AuthShell, PasswordField, SubmitButton, shake } from '@/components/auth/auth-shell';
import { Icon } from '@/components/icon-sprite';

export default function LoginPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      // Unticked: the session is kept for this tab only.
      setAuth(res.accessToken, res.refreshToken, res.user, { persist: remember });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
      shake(formRef.current);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      switchPrompt="New here?"
      switchHref="/register"
      switchLabel="Create account"
      legal="Untick “Keep me signed in” on a shared device and you are signed out when the tab closes."
    >
      <h1 data-in>Welcome back</h1>
      <p data-in>Sign in to your Parcel Payout account.</p>

      <form onSubmit={handleSubmit} ref={formRef}>
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

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <div className="row-between" data-in>
          <label className="check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <i><Icon name="i-check" size={12} /></i>
            Keep me signed in
          </label>
          <Link className="link" href="/forgot-password">Forgot password?</Link>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <SubmitButton loading={loading} loadingLabel="Signing in…">Sign in</SubmitButton>
      </form>

      <div className="divider" data-in style={{ marginTop: 24 }}>or</div>
      <Link className="btn line lg full" href="/track" data-in style={{ marginTop: 20 }}>
        <Icon name="i-box" size={17} />Track a parcel without an account
      </Link>
    </AuthShell>
  );
}
