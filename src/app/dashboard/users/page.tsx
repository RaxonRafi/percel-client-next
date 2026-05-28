'use client';

import { useEffect, useState } from 'react';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      setUsers(await api.getAllUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <DashboardTopbar title="Customers" />
      <div className="p-8">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <Card>
          <CardHeader>
            <CardTitle>All users</CardTitle>
          </CardHeader>
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
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{u.role}</td>
                  <td className="py-3">{u.isActive}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {u.isActive === 'BLOCKED' ? (
                        <Button
                          size="sm"
                          onClick={() => api.unblockUser(u.id).then(load)}
                        >
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => api.blockUser(u.id).then(load)}
                        >
                          Block
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
