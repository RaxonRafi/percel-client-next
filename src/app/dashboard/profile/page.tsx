'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MotionConfig, motion } from 'motion/react';
import { api, ApiError, logout } from '@/lib/api';
import { clearAuth } from '@/lib/auth-storage';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/lib/toast';
import { EASE } from '@/lib/motion';
import type { User } from '@/lib/types';
import { Icon } from '@/components/icon-sprite';

const ROLE_LABELS: Record<User['role'], string> = {
  ADMIN: 'Admin',
  SENDER: 'Sender',
  RECEIVER: 'Receiver',
  DELIVERY_PERSONNEL: 'Delivery partner',
  PENDING_DELIVERY: 'Delivery partner (pending)',
};

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
});

function PasswordInput({
  id, label, value, onChange, autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <Icon name="i-lock" size={18} />
        <input
          className="input"
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
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
    </div>
  );
}

/** Keyed on the user id by the page, so the form starts from the loaded profile. */
function ProfileContent({ user }: { user: User }) {
  const router = useRouter();
  const { applyUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user.name ?? '',
    phone: user.phone ?? '',
    address: user.address ?? '',
    nidNumber: user.nidNumber ?? '',
  });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const dirty =
    profile.name !== (user.name ?? '') ||
    profile.phone !== (user.phone ?? '') ||
    profile.address !== (user.address ?? '') ||
    profile.nidNumber !== (user.nidNumber ?? '');

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await api.updateProfile({
        name: profile.name,
        phone: profile.phone || null,
        address: profile.address || null,
        nidNumber: profile.nidNumber || null,
      });
      applyUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update profile');
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      toast.error('The new passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await api.changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      toast.success('Password changed — sign in again');
      clearAuth();
      router.replace('/login');
      return;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not change password');
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    setBusy(true);
    try {
      await api.resendVerification(user.email);
      toast.success('Confirmation email sent — check your inbox');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not send the email');
    } finally {
      setBusy(false);
    }
  }

  async function signOut(everywhere = false) {
    await logout({ everywhere });
    router.replace('/login');
  }

  const active = user.isActive === 'ACTIVE';

  return (
    <MotionConfig reducedMotion="user">
      <div className="profile">
        {/* Identity */}
        <motion.section className="profile-hero on-dark" {...rise(0)}>
          <div className="hero-grid" aria-hidden="true" />
          <span className="profile-avatar">{initials(user.name)}</span>
          <div className="profile-id">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <div className="profile-chips">
              <span className="pchip"><Icon name="i-user" size={13} />{ROLE_LABELS[user.role]}</span>
              <span className={`pchip${active ? '' : ' warn'}`}>
                <Icon name={active ? 'i-check' : 'i-ban'} size={13} />
                {active ? 'Active' : user.isActive === 'BLOCKED' ? 'Blocked' : 'Inactive'}
              </span>
              <span className={`pchip${user.isVerified ? '' : ' warn'}`}>
                <Icon name={user.isVerified ? 'i-shield' : 'i-alert'} size={13} />
                {user.isVerified ? 'Email verified' : 'Email not verified'}
              </span>
            </div>
          </div>
          <dl className="profile-facts">
            <div>
              <dt>Member since</dt>
              <dd>{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{user.phone || 'Not added'}</dd>
            </div>
          </dl>
        </motion.section>

        {!user.isVerified && (
          <motion.section className="profile-verify" {...rise(0.06)}>
            <i><Icon name="i-mail" size={20} /></i>
            <div>
              <b>Confirm your email address</b>
              <p>We sent a confirmation link to <strong>{user.email}</strong>. Verify it to access every feature.</p>
            </div>
            <button className="btn dark" type="button" disabled={busy} onClick={resendVerification}>
              Resend link
            </button>
          </motion.section>
        )}

        <div className="profile-grid">
          <motion.form className="card profile-card" onSubmit={saveProfile} {...rise(0.12)}>
            <div className="card-head">
              <div><h2>Personal information</h2><p>Shown to couriers and used on your shipments</p></div>
            </div>
            <div className="profile-fields">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <div className="input-wrap">
                  <Icon name="i-user" size={18} />
                  <input className="input" id="name" autoComplete="name" required
                    value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="phone">Phone number</label>
                <div className="input-wrap">
                  <Icon name="i-phone" size={18} />
                  <input className="input" id="phone" type="tel" autoComplete="tel"
                    value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
              </div>
              <div className="field wide">
                <label htmlFor="address">Address</label>
                <div className="input-wrap">
                  <Icon name="i-pin" size={18} />
                  <input className="input" id="address" autoComplete="street-address"
                    value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="nid">NID / ID number</label>
                <div className="input-wrap">
                  <Icon name="i-shield" size={18} />
                  <input className="input" id="nid" style={{ textTransform: 'uppercase' }}
                    value={profile.nidNumber} onChange={(e) => setProfile({ ...profile, nidNumber: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="email">Email <span className="hint">(cannot be changed)</span></label>
                <div className="input-wrap">
                  <Icon name="i-mail" size={18} />
                  <input className="input" id="email" value={user.email} readOnly disabled />
                </div>
              </div>
            </div>
            <div className="profile-foot">
              <small>{dirty ? 'You have unsaved changes.' : 'Everything is saved.'}</small>
              <button className="btn dark" type="submit" disabled={busy || !dirty}>Save changes</button>
            </div>
          </motion.form>

          <div className="profile-side">
            <motion.form className="card profile-card" onSubmit={changePassword} {...rise(0.18)}>
              <div className="card-head">
                <div><h2>Password</h2><p>Changing it signs you out of every device</p></div>
              </div>
              <div className="profile-fields single">
                <PasswordInput id="current" label="Current password" autoComplete="current-password"
                  value={passwords.current} onChange={(current) => setPasswords({ ...passwords, current })} />
                <PasswordInput id="next" label="New password" autoComplete="new-password"
                  value={passwords.next} onChange={(next) => setPasswords({ ...passwords, next })} />
                <PasswordInput id="confirm" label="Confirm new password" autoComplete="new-password"
                  value={passwords.confirm} onChange={(confirm) => setPasswords({ ...passwords, confirm })} />
              </div>
              <div className="profile-foot">
                <span />
                <button className="btn line" type="submit" disabled={busy}>Update password</button>
              </div>
            </motion.form>

            <motion.section className="card profile-card" {...rise(0.24)}>
              <div className="card-head">
                <div><h2>Sessions</h2><p>Tokens stay valid for up to 15 minutes after signing out</p></div>
              </div>
              <div className="profile-sessions">
                <button className="session" type="button" onClick={() => signOut()}>
                  <i><Icon name="i-logout" size={17} /></i>
                  <div><b>Sign out of this device</b><span>Other devices stay signed in</span></div>
                  <Icon name="i-chevron" size={16} />
                </button>
                <button className="session danger" type="button" onClick={() => signOut(true)}>
                  <i><Icon name="i-ban" size={17} /></i>
                  <div><b>Sign out everywhere</b><span>Ends every session on every device</span></div>
                  <Icon name="i-chevron" size={16} />
                </button>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  return <ProfileContent user={user} key={user.id} />;
}
