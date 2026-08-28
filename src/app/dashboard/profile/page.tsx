'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api, ApiError, logout } from '@/lib/api';
import { formatDate } from '@/lib/parcel-utils';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const router = useRouter();
  const { user, applyUser } = useAuth();

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    address: '',
    nidNumber: '',
  });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
      nidNumber: user.nidNumber ?? '',
    });
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMsg('');
    setBusy(true);
    try {
      const updated = await api.updateProfile({
        name: profile.name,
        phone: profile.phone || null,
        address: profile.address || null,
        nidNumber: profile.nidNumber || null,
      });
      // The PATCH already returns the updated record — no need to re-fetch it.
      applyUser(updated);
      setMsg('Profile updated');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update profile');
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMsg('');
    if (passwords.next !== passwords.confirm) {
      setError('The new passwords do not match');
      return;
    }
    setBusy(true);
    try {
      const res = await api.changePassword(passwords.current, passwords.next);
      setMsg(res.message ?? 'Password changed successfully');
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change password');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await logout();
    router.replace('/login');
  }

  if (!user) return <p className="text-ink-3">Loading your profile…</p>;

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-green">{msg}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={user.isActive === 'ACTIVE' ? 'delivered' : 'failed'}>
              {user.isActive}
            </Badge>
            <Badge>{user.role}</Badge>
          </div>
        </CardHeader>
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-ink-3">Email</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-ink-3">Verified</p>
            <p>{user.isVerified ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-ink-3">Member since</p>
            <p>{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="nid">NID number</Label>
            <Input
              id="nid"
              value={profile.nidNumber}
              onChange={(e) => setProfile({ ...profile, nidNumber: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={busy}>Save changes</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <form onSubmit={changePassword} className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              required
            />
          </div>
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
          <div className="md:col-span-3">
            <Button type="submit" disabled={busy}>Update password</Button>
          </div>
        </form>
        <p className="mt-3 text-xs text-ink-3">
          Existing tokens stay valid until they expire — the API does not revoke them.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <Button variant="secondary" onClick={signOut}>Sign out</Button>
      </Card>
    </div>
  );
}
