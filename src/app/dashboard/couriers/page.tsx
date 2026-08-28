'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, ApiError } from '@/lib/api';
import { formatDate } from '@/lib/parcel-utils';
import { useAuth } from '@/lib/use-auth';
import type { User } from '@/lib/types';

export default function CouriersPage() {
  const { user } = useAuth();
  const [pending, setPending] = useState<User[]>([]);
  const [approved, setApproved] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [applicants, couriers] = await Promise.all([
        api.getPendingCouriers(),
        api.getCouriers(),
      ]);
      setPending(applicants);
      setApproved(couriers);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load delivery partners');
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [load, user]);

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

  if (user && user.role !== 'ADMIN') {
    return <p className="text-ink-3">Only admins can review delivery partners.</p>;
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-green">{msg}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Pending applications</CardTitle>
          <Badge variant={pending.length > 0 ? 'pending' : 'default'}>
            {pending.length} waiting
          </Badge>
        </CardHeader>
        <p className="mb-4 text-sm text-ink-3">
          Applicants sit at <code>PENDING_DELIVERY</code> and cannot use any role-guarded
          route until approved. Rejecting drops them to a normal sender account, so they
          keep access and can apply again.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-2 text-xs uppercase text-ink-3">
                <th className="pb-3 text-left">Name</th>
                <th className="pb-3 text-left">Email</th>
                <th className="pb-3 text-left">Phone</th>
                <th className="pb-3 text-left">Applied</th>
                <th className="pb-3 text-left">Decision</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.id} className="border-b border-surface-2">
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{u.phone ?? '—'}</td>
                  <td className="py-3 text-ink-3">{formatDate(u.createdAt)}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => run(() => api.approveCourier(u.id), `${u.name} approved`)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => run(() => api.rejectCourier(u.id), `${u.name} rejected`)}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-ink-3">
                    No applications waiting.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved couriers</CardTitle>
          <Badge variant="delivered">{approved.length} active</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-2 text-xs uppercase text-ink-3">
                <th className="pb-3 text-left">Name</th>
                <th className="pb-3 text-left">Email</th>
                <th className="pb-3 text-left">Phone</th>
                <th className="pb-3 text-left">Account</th>
                <th className="pb-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approved.map((u) => (
                <tr key={u.id} className="border-b border-surface-2">
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{u.phone ?? '—'}</td>
                  <td className="py-3">
                    <Badge variant={u.isActive === 'ACTIVE' ? 'delivered' : 'failed'}>
                      {u.isActive}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {/* Only an ACTIVE courier can take an assignment. */}
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
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() =>
                          run(() => api.rejectCourier(u.id), `${u.name} moved back to sender`)
                        }
                      >
                        Revoke
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {approved.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-ink-3">
                    No approved couriers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
