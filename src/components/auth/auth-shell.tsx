'use client';

import '@/styles/auth.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { animate } from 'motion';
import { EASE, createMotionScope, motionEnabled, stagger } from '@/lib/motion';
import { Icon } from '@/components/icon-sprite';

type Side = {
  title: string;
  lede: string;
  /** `tracker` shows a live parcel card, `steps` the three-step list. */
  visual: 'tracker' | 'steps';
  quote: { text: string; name: string; role: string };
};

const SIGN_IN_SIDE: Side = {
  title: 'Every parcel, accounted for.',
  lede: 'Sign in to book pickups, follow every scan live, and see proof on each delivery.',
  visual: 'tracker',
  quote: {
    text: 'Booking a pickup takes under a minute, and I can see every scan until the parcel reaches my customer.',
    name: 'Zain Malik',
    role: 'Online store owner',
  },
};

const SIGN_UP_SIDE: Side = {
  title: 'From pickup to doorstep in three steps.',
  lede: 'Create a free account and send your first parcel today, or apply to deliver with us.',
  visual: 'steps',
  quote: {
    text: 'Having all my pickups, deliveries, and proof photos in one app saves me so much time.',
    name: 'Rami Kadir',
    role: 'Courier',
  },
};

const STEPS = [
  { title: 'Create your account', text: 'It takes about a minute.' },
  { title: 'Book a pickup', text: 'Get a tracking ID right away.' },
  { title: 'Track it to the door', text: 'Every scan logged, proof on delivery.' },
];

const initials = (name: string) => name.split(' ').map((part) => part[0]).join('');

/**
 * The two-column layout shared by every account screen: a dark brand panel on
 * the left, the form on the right. Fields marked `data-in` fade up on load.
 */
export function AuthShell({
  variant = 'signin',
  switchPrompt,
  switchHref,
  switchLabel,
  legal,
  children,
}: {
  variant?: 'signin' | 'signup';
  switchPrompt: string;
  switchHref: string;
  switchLabel: string;
  legal?: React.ReactNode;
  children: React.ReactNode;
}) {
  const side = variant === 'signup' ? SIGN_UP_SIDE : SIGN_IN_SIDE;

  useEffect(() => {
    if (!motionEnabled()) return;
    const scope = createMotionScope();
    scope.animate('.auth-side', { opacity: [0, 1], scale: [0.98, 1] }, { duration: 0.9, ease: EASE });
    scope.animate('.auth-side [data-side]', { opacity: [0, 1], y: [20, 0], filter: ['blur(8px)', 'blur(0px)'] },
      { duration: 0.9, ease: EASE, delay: stagger(0.12, { startDelay: 0.25 }) });
    scope.animate('.auth-main [data-in]', { opacity: [0, 1], y: [16, 0] },
      { duration: 0.7, ease: EASE, delay: stagger(0.06, { startDelay: 0.15 }) });
    scope.animate('.auth-side .aurora', { x: [0, 70, 10, 0], y: [0, -40, 30, 0] },
      { duration: 16, ease: 'easeInOut', repeat: Infinity });
    // Brand-side tracker: the parcel travels along the bar on a loop
    if (document.querySelector('.side-fill')) {
      scope.animate('.side-fill', { width: ['8%', '66%', '66%', '100%', '100%'] },
        { duration: 7, times: [0, 0.35, 0.55, 0.9, 1], ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6 });
    }
    return () => scope.stop();
  }, []);

  return (
    // The outer class scopes styles/auth.css; the layout grid is the inner element.
    <div className="pg-auth">
      <div className="auth">
      <aside className="auth-side on-dark">
        <div className="hero-grid" aria-hidden="true" />
        <div className="aurora" aria-hidden="true" />

        <Link className="brand" href="/" data-side><Icon name="i-box" size={24} />Parcel Payout</Link>

        <div>
          <h2 data-side>{side.title}</h2>
          <p data-side>{side.lede}</p>

          {side.visual === 'tracker' ? (
            <div className="side-card" data-side style={{ marginTop: 34 }} aria-hidden="true">
              <div className="side-head">
                <div><small>Tracking ID</small><b>TRK-5789-2847</b></div>
                <span className="side-status"><span className="pulse" />Out for delivery</span>
              </div>
              <div className="side-bar"><div className="side-fill"><i><Icon name="i-truck" size={11} /></i></div></div>
              <div className="side-steps"><span>Picked up</span><span>In transit</span><span>Delivered</span></div>
            </div>
          ) : (
            <ol className="side-list" style={{ marginTop: 34 }}>
              {STEPS.map((step, i) => (
                <li data-side key={step.title}>
                  <i>{String(i + 1).padStart(2, '0')}</i>
                  <div><b>{step.title}</b><span>{step.text}</span></div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <figure className="side-quote" data-side>
          <blockquote>“{side.quote.text}”</blockquote>
          <figcaption>
            <i>{initials(side.quote.name)}</i>
            <span><b>{side.quote.name}</b> · {side.quote.role}</span>
          </figcaption>
        </figure>
      </aside>

      <main className="auth-main">
        <div className="auth-top" data-in>
          <Link className="back" href="/"><Icon name="i-back" size={16} />Back to home</Link>
          <Link className="brand auth-mobile-brand" href="/"><Icon name="i-box" size={20} />Parcel Payout</Link>
          <span className="switch">{switchPrompt} <Link href={switchHref}>{switchLabel}</Link></span>
        </div>

        <div className="auth-form">{children}</div>

        {legal && <p className="auth-legal" data-in>{legal}</p>}
      </main>
      </div>
    </div>
  );
}

/** A quick side-to-side shake, used when a submit is rejected. */
export function shake(element: Element | null) {
  if (element && motionEnabled()) animate(element, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.4 });
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete: 'current-password' | 'new-password';
  minLength?: number;
  /** Rendered under the input, e.g. a strength meter. */
  children?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field" data-in>
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <Icon name="i-lock" size={18} />
        <input
          className="input"
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <button
          className="toggle"
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          <Icon name={visible ? 'i-eye-off' : 'i-eye'} size={18} />
        </button>
      </div>
      {children}
    </div>
  );
}

export function SubmitButton({ loading, loadingLabel, children, disabled }: {
  loading: boolean;
  loadingLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button className="btn dark lg full" type="submit" disabled={loading || disabled} data-in>
      {loading ? <><span className="spinner" />{loadingLabel}</> : <>{children} <Icon name="i-arrow" size={15} /></>}
    </button>
  );
}
