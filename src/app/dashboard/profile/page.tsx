'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { api, ApiError, logout } from '@/lib/api';
import { clearAuth } from '@/lib/auth-storage';
import { formatDate } from '@/lib/parcel-utils';
import { useAuth } from '@/lib/auth-context';
import { UserCircle, Shield, Key, LogOut, CheckCircle, AlertTriangle, Mail } from 'lucide-react';

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
      applyUser(updated);
      setMsg('Profile updated successfully');
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
      await api.changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setMsg('Password changed. Signing you back in…');
      clearAuth();
      router.replace('/login');
      return;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change password');
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    if (!user) return;
    setError('');
    setMsg('');
    setBusy(true);
    try {
      await api.resendVerification(user.email);
      setMsg('Confirmation email sent — check your inbox.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the email');
    } finally {
      setBusy(false);
    }
  }

  async function signOut(everywhere = false) {
    await logout({ everywhere });
    router.replace('/login');
  }

  if (!user) return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in relative">
      {(error || msg) && (
        <div className={`p-3 rounded-xl border text-sm ${error ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
          {error || msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-accent" />
            User Settings
          </h1>
          <p className="text-ink-3 text-[13px] mt-1 tracking-wide">ACCOUNT CONFIGURATION & SECURITY</p>
        </div>
      </div>

      {!user.isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-amber-600 font-bold mb-1">Email Verification Required</h3>
              <p className="text-ink-2 text-sm mb-4">
                We sent a confirmation link to <strong className="text-ink-2">{user.email}</strong>. 
                Please verify your email address to access all features.
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={busy} 
                onClick={resendVerification}
                className="bg-amber-100 text-amber-600 hover:bg-amber-100 hover:text-amber-600 border-amber-200"
              >
                <Mail className="h-4 w-4 mr-2" />
                Resend Verification Link
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-surface-3 rounded-xl shadow-sm p-5">
            <div className="flex flex-col items-center text-center pb-5 border-b border-surface-2 mb-5">
              <div className="h-20 w-20 bg-surface-2 rounded-full flex items-center justify-center border-2 border-surface-3 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <UserCircle className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-lg font-bold text-ink">{user.name}</h2>
              <p className="text-sm text-ink-3">{user.email}</p>
              
              <div className="flex gap-2 mt-4">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  user.isActive === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                }`}>
                  {user.isActive}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-accent-bg text-accent border-accent/20">
                  {user.role}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-ink-3 uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-center gap-2 text-sm">
                  {user.isVerified ? (
                    <><CheckCircle className="h-4 w-4 text-emerald-600" /> <span className="text-ink-2">Verified User</span></>
                  ) : (
                    <><AlertTriangle className="h-4 w-4 text-amber-600" /> <span className="text-ink-2">Unverified</span></>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-ink-3 uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-sm text-ink-2">{formatDate(user.createdAt).split(',')[0]}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-surface-3 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-ink-2 flex items-center gap-2 mb-4">
              <LogOut className="h-4 w-4 text-ink-3" />
              Session Control
            </h3>
            <div className="space-y-3">
              <Button 
                variant="secondary" 
                className="w-full justify-start text-sm" 
                onClick={() => signOut()}
              >
                Sign out of this device
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm text-rose-600 hover:text-rose-600 hover:bg-rose-50" 
                onClick={() => signOut(true)}
              >
                Sign out everywhere
              </Button>
              <p className="text-[10px] text-ink-3 mt-2 leading-relaxed">
                Tokens stay valid for up to 15 minutes after signing out.
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-surface-3 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-surface-2 bg-surface">
              <h3 className="text-[13px] font-bold text-ink-2 uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                Personal Information
              </h3>
            </div>
            
            <form onSubmit={saveProfile} className="p-5">
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-md border border-surface-3 bg-white text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-surface-3 bg-white text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="address" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Address</label>
                  <input
                    id="address"
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-surface-3 bg-white text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="nid" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">NID / ID Number</label>
                  <input
                    id="nid"
                    type="text"
                    value={profile.nidNumber}
                    onChange={(e) => setProfile({ ...profile, nidNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-surface-3 bg-white text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all uppercase"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-surface-2">
                <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-surface-3 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-surface-2 bg-surface">
              <h3 className="text-[13px] font-bold text-ink-2 uppercase tracking-wider flex items-center gap-2">
                <Key className="h-4 w-4 text-accent" />
                Security Settings
              </h3>
            </div>
            
            <form onSubmit={changePassword} className="p-5">
              <div className="grid gap-5 mb-6">
                <div className="space-y-1.5 max-w-sm">
                  <label htmlFor="current" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Current Password</label>
                  <input
                    id="current"
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-md border border-surface-3 bg-white text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="next" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">New Password</label>
                    <input
                      id="next"
                      type="password"
                      value={passwords.next}
                      onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                      required
                      className="w-full h-10 px-3 rounded-md border border-surface-3 bg-white text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="confirm" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Confirm New Password</label>
                    <input
                      id="confirm"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      required
                      className="w-full h-10 px-3 rounded-md border border-surface-3 bg-white text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-surface-2">
                <p className="text-[11px] text-ink-3 max-w-sm leading-relaxed">
                  Changing your password signs you out of every device. You will need to sign back in.
                </p>
                <Button type="submit" variant="secondary" disabled={busy} className="w-full sm:w-auto shrink-0">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
