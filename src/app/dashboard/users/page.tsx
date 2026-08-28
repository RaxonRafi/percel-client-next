'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiError } from '@/lib/api';
import { formatDate } from '@/lib/parcel-utils';
import type { Role, User } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Staff accounts go through the same register route, but the request must
  // carry the current admin's token for a role other than SENDER to stick.
  const [adminForm, setAdminForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: Role;
  }>({ name: '', email: '', password: '', role: 'ADMIN' });

  const load = useCallback(async () => {
    try {
      setUsers(await api.getAllUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setError('');
    setMsg('');
    setBusy(true);
    try {
      await action();
      setMsg(success);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  /** Full record via `GET /users/:id` — the list omits nothing today, but the
   *  detail route is the documented way to read one user. */
  async function openUser(id: string) {
    setError('');
    try {
      setSelected(await api.getUser(id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load user');
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-green">{msg}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>
        <form
          className="grid gap-4 md:grid-cols-5"
          onSubmit={async (e) => {
            e.preventDefault();
            await run(() => api.register(adminForm), `${adminForm.role} account created`);
            setAdminForm({ name: '', email: '', password: '', role: 'ADMIN' });
          }}
        >
          <div>
            <Label>Name</Label>
            <Input
              value={adminForm.name}
              onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Temporary password</Label>
            <Input
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Role</Label>
            <select
              className="flex h-11 w-full rounded-md border border-surface-3 bg-white px-3 text-sm"
              value={adminForm.role}
              onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as Role })}
            >
              <option value="ADMIN">Admin</option>
              <option value="SENDER">Sender</option>
              <option value="RECEIVER">Receiver</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={busy}>Create account</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-2 text-xs uppercase text-ink-3">
                <th className="pb-3 text-left">Name</th>
                <th className="pb-3 text-left">Email</th>
                <th className="pb-3 text-left">Role</th>
                <th className="pb-3 text-left">Status</th>
                <th className="pb-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-surface-2">
                  <td className="py-3 font-medium">
                    <button
                      type="button"
                      className="hover:text-accent"
                      onClick={() => openUser(u.id)}
                    >
                      {u.name}
                    </button>
                  </td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{u.role}</td>
                  <td className="py-3">{u.isActive}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {u.isActive === 'BLOCKED' ? (
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() => run(() => api.unblockUser(u.id), `${u.name} unblocked`)}
                        >
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          onClick={() => run(() => api.blockUser(u.id), `${u.name} blocked`)}
                        >
                          Block
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-ink-3">No users yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>{selected.name}</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
          </CardHeader>
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            {[
              ['Email', selected.email],
              ['Role', selected.role],
              ['Account status', selected.isActive],
              ['Verified', selected.isVerified ? 'Yes' : 'No'],
              ['Phone', selected.phone ?? '—'],
              ['Address', selected.address ?? '—'],
              ['NID number', selected.nidNumber ?? '—'],
              ['Sign-in providers', selected.auths?.map((a) => a.provider).join(', ') || '—'],
              ['Joined', formatDate(selected.createdAt)],
              ['Last updated', formatDate(selected.updatedAt)],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="text-xs uppercase text-ink-3">{label}</dt>
                <dd>{value as string}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </div>
  );
}
