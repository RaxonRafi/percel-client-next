'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';
import { formatDate } from '@/lib/parcel-utils';
import type { PageMeta, AuditLog, AuditLogAction, AuditLogTargetType } from '@/lib/types';
import { ShieldAlert, User, Package, UserCheck, UserX, Truck, PlayCircle, Settings, Shield } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ action: string; targetType: string; targetId: string }>({
    action: '',
    targetType: '',
    targetId: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      if (filters.targetId) {
        const res = await api.getAuditLogsForTarget(filters.targetId, {
          page,
          limit: 20,
          action: (filters.action || undefined) as AuditLogAction | undefined,
          targetType: (filters.targetType || undefined) as AuditLogTargetType | undefined,
        });
        setLogs(res.data);
        setMeta(res.meta);
      } else {
        const res = await api.getAuditLogs({
          page,
          limit: 20,
          action: (filters.action || undefined) as AuditLogAction | undefined,
          targetType: (filters.targetType || undefined) as AuditLogTargetType | undefined,
        });
        setLogs(res.data);
        setMeta(res.meta);
      }
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit logs');
    } finally {
      setBusy(false);
    }
  }, [page, filters.action, filters.targetType, filters.targetId]);

  useEffect(() => {
    load();
  }, [load]);

  function applyFilter(next: Partial<typeof filters>) {
    setFilters({ ...filters, ...next });
    setPage(1);
  }

  const getActionIcon = (action: AuditLogAction) => {
    switch(action) {
      case 'USER_BLOCKED': return <UserX className="h-4 w-4 text-red-400" />;
      case 'USER_UNBLOCKED': return <UserCheck className="h-4 w-4 text-green-400" />;
      case 'DELIVERY_APPROVED': return <Truck className="h-4 w-4 text-green-400" />;
      case 'DELIVERY_REJECTED': return <ShieldAlert className="h-4 w-4 text-red-400" />;
      case 'PARCEL_BLOCKED': return <ShieldAlert className="h-4 w-4 text-amber-400" />;
      case 'PARCEL_ASSIGNED': return <User className="h-4 w-4 text-blue-400" />;
      case 'PARCEL_UNASSIGNED': return <UserX className="h-4 w-4 text-amber-400" />;
      case 'PARCEL_STATUS_CHANGED': return <PlayCircle className="h-4 w-4 text-accent" />;
      default: return <Settings className="h-4 w-4 text-ink-3" />;
    }
  };

  const getTargetIcon = (type: AuditLogTargetType) => {
    return type === 'USER' ? <User className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent" />
            System Audit Logs
          </h1>
          <p className="text-ink-3 text-sm mt-1">Immutable record of critical system actions.</p>
        </div>
      </div>

      <Card className="border-surface-3 bg-surface">
        <div className="p-4 border-b border-surface-3 bg-surface-2/50 flex flex-wrap gap-3">
          <select
            className="h-10 rounded-md border border-surface-3 bg-surface px-3 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none min-w-[160px]"
            value={filters.action}
            onChange={(e) => applyFilter({ action: e.target.value })}
          >
            <option value="">All actions</option>
            {[
              'USER_BLOCKED', 'USER_UNBLOCKED', 'DELIVERY_APPROVED', 'DELIVERY_REJECTED', 
              'PARCEL_BLOCKED', 'PARCEL_ASSIGNED', 'PARCEL_UNASSIGNED', 'PARCEL_STATUS_CHANGED'
            ].map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
          
          <select
            className="h-10 rounded-md border border-surface-3 bg-surface px-3 text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none"
            value={filters.targetType}
            onChange={(e) => applyFilter({ targetType: e.target.value })}
          >
            <option value="">All target types</option>
            <option value="USER">User</option>
            <option value="PARCEL">Parcel</option>
          </select>

          <Input
            className="max-w-xs h-10 bg-surface border-surface-3 text-ink placeholder:text-ink-3"
            placeholder="Search by Target ID"
            value={filters.targetId}
            onChange={(e) => applyFilter({ targetId: e.target.value })}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-3 bg-surface-2/30 text-xs uppercase text-ink-3">
                <th className="px-6 py-4 text-left font-semibold">Timestamp</th>
                <th className="px-6 py-4 text-left font-semibold">Action</th>
                <th className="px-6 py-4 text-left font-semibold">Actor</th>
                <th className="px-6 py-4 text-left font-semibold">Target</th>
                <th className="px-6 py-4 text-left font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-3">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-2/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-ink-3">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-surface-2 group-hover:bg-surface-3 transition-colors">
                        {getActionIcon(log.action)}
                      </div>
                      <span className="font-medium text-ink">{log.action.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.actorEmail ? (
                      <span className="text-ink">{log.actorEmail}</span>
                    ) : (
                      <span className="text-ink-3 italic">System / Deleted User</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-ink-3">{getTargetIcon(log.targetType)}</span>
                      <span className="font-mono text-xs bg-surface-2 px-2 py-0.5 rounded text-ink-2">
                        {log.targetId}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-ink-2">{log.summary ?? '-'}</span>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-1.5 text-xs text-ink-2 bg-surface-2 p-2 rounded border border-surface-3 overflow-x-auto max-w-sm">
                        <pre className="font-mono">{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-ink-3">
                    {busy ? 'Loading logs...' : 'No audit logs found matching your criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-surface-3">
          <Pagination meta={meta} onPage={setPage} busy={busy} />
        </div>
      </Card>
    </div>
  );
}
