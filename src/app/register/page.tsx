'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { setAuth } from '@/lib/auth-storage';
import type { Role } from '@/lib/types';
import { AuthShell, PasswordField, SubmitButton, shake } from '@/components/auth/auth-shell';
import { Icon } from '@/components/icon-sprite';

/**
 * The roles a public registration may ask for; only ADMIN needs an admin's
 * token. DELIVERY_PERSONNEL lands at PENDING_DELIVERY until an admin approves it.
 */
const INTENTS: { role: Role; title: string; blurb: string; icon: string }[] = [
  { role: 'SENDER', title: 'Send parcels', blurb: 'Book shipments and track them.', icon: 'i-box' },
  { role: 'RECEIVER', title: 'Receive parcels', blurb: 'Follow deliveries sent to you.', icon: 'i-home' },
  { role: 'DELIVERY_PERSONNEL', title: 'Deliver parcels', blurb: 'Apply as a delivery partner.', icon: 'i-truck' },
];

const STRENGTH = [
  { label: 'Use 8 or more characters', color: '#c0392b', width: 0 },
  { label: 'Weak', color: '#c0392b', width: 25 },
  { label: 'Fair', color: '#d68910', width: 50 },
  { label: 'Good', color: '#7a9b1f', width: 75 },
  { label: 'Strong', color: '#2f5a2a', width: 100 },
];

/** A rough guide for the meter only — the API enforces the real password rules. */
function passwordStrength(value: string) {
  if (!value) return STRENGTH[0];
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return STRENGTH[Math.max(score, 1)];
}

export default function RegisterPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'SENDER' as Role,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isCourier = form.role === 'DELIVERY_PERSONNEL';
  const strength = passwordStrength(form.password);

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
      shake(formRef.current);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      variant="signup"
      switchPrompt="Have an account?"
      switchHref="/login"
      switchLabel="Sign in"
      legal="By creating an account you agree to use Parcel Payout responsibly."
    >
      <h1 data-in>Create your account</h1>
      <p data-in>Tell us how you plan to use Parcel Payout.</p>

      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="roles" role="radiogroup" aria-label="How will you use Parcel Payout?" data-in>
          {INTENTS.map((intent) => (
            <label className="role" key={intent.role}>
              <input
                type="radio"
                name="role"
                value={intent.role}
                checked={form.role === intent.role}
                onChange={() => setForm({ ...form, role: intent.role })}
              />
              <span className="role-card">
                <i><Icon name={intent.icon} size={20} /></i>
                <span><b>{intent.title}</b><span>{intent.blurb}</span></span>
                <span className="tick"><Icon name="i-check" size={12} /></span>
              </span>
            </label>
          ))}
        </div>

        {isCourier && (
          <div className="notice">
            <Icon name="i-info" size={16} />
            <span>You can sign in right away, but deliveries stay locked until an admin approves your application.</span>
          </div>
        )}

        <div className="field" data-in>
          <label htmlFor="name">Full name</label>
          <div className="input-wrap">
            <Icon name="i-user" size={18} />
            <input
              className="input"
              id="name"
              autoComplete="name"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="field-row" data-in>
          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="input-wrap">
              <Icon name="i-mail" size={18} />
              <input
                className="input"
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="phone">Phone {!isCourier && <span className="hint">(optional)</span>}</label>
            <div className="input-wrap">
              <Icon name="i-phone" size={18} />
              <input
                className="input"
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required={isCourier}
              />
            </div>
          </div>
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
          placeholder="Create a password"
          autoComplete="new-password"
        >
          <div className="strength" aria-live="polite">
            <div className="strength-bar">
              <i style={{ width: `${strength.width}%`, background: strength.color }} />
            </div>
            <span>{strength.label}</span>
          </div>
        </PasswordField>

        {error && <p className="form-error" role="alert">{error}</p>}

        <SubmitButton loading={loading} loadingLabel="Creating account…">Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}
