'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';
import { formatDate } from '@/lib/parcel-utils';
import type { PageMeta, AuditLog, AuditLogAction, AuditLogTargetType } from '@/lib/types';
import { ShieldAlert, ShieldCheck, User, Package, UserCheck, UserX, Truck, PlayCircle, Settings, Shield } from 'lucide-react';

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
      case 'USER_BLOCKED': return <UserX className="h-4 w-4 text-rose-600" />;
      case 'USER_UNBLOCKED': return <UserCheck className="h-4 w-4 text-emerald-600" />;
      case 'DELIVERY_APPROVED': return <Truck className="h-4 w-4 text-emerald-600" />;
      case 'DELIVERY_REJECTED': return <ShieldAlert className="h-4 w-4 text-rose-600" />;
      case 'PARCEL_BLOCKED': return <ShieldAlert className="h-4 w-4 text-amber-600" />;
      case 'PARCEL_UNBLOCKED': return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
      case 'PARCEL_ASSIGNED': return <User className="h-4 w-4 text-accent" />;
      case 'PARCEL_UNASSIGNED': return <UserX className="h-4 w-4 text-amber-600" />;
      case 'PARCEL_STATUS_CHANGED': return <PlayCircle className="h-4 w-4 text-accent" />;
      default: return <Settings className="h-4 w-4 text-ink-3" />;
    }
  };

  const getTargetIcon = (type: AuditLogTargetType) => {
    return type === 'USER' ? <User className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">{error}</p>}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            System Audit Logs
          </h1>
          <p className="text-ink-3 text-[13px] mt-1 tracking-wide">IMMUTABLE RECORD OF CRITICAL ACTIONS</p>
        </div>
      </div>

      <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col">
        <div className="px-5 pt-5 flex flex-wrap gap-3">
          <select
            className="h-9 rounded-full border border-surface-3 bg-white px-4 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none min-w-[160px]"
            value={filters.action}
            onChange={(e) => applyFilter({ action: e.target.value })}
          >
            <option value="">All actions</option>
            {[
              'USER_BLOCKED', 'USER_UNBLOCKED', 'DELIVERY_APPROVED', 'DELIVERY_REJECTED', 
              'PARCEL_BLOCKED', 'PARCEL_UNBLOCKED', 'PARCEL_ASSIGNED', 'PARCEL_UNASSIGNED', 'PARCEL_STATUS_CHANGED'
            ].map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
          
          <select
            className="h-9 rounded-full border border-surface-3 bg-white px-4 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none"
            value={filters.targetType}
            onChange={(e) => applyFilter({ targetType: e.target.value })}
          >
            <option value="">All types</option>
            <option value="USER">User</option>
            <option value="PARCEL">Parcel</option>
          </select>

          <input
            className="max-w-xs h-9 rounded-full border border-surface-3 bg-white px-3 text-[13px] text-ink-2 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none placeholder:text-ink-3"
            placeholder="Search by target ID"
            value={filters.targetId}
            onChange={(e) => applyFilter({ targetId: e.target.value })}
          />
        </div>

        <div className="m-5 overflow-x-auto rounded-xl border border-surface-3">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-surface text-[11px] uppercase tracking-wider text-ink-3 border-b border-surface-3">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Timestamp</th>
                <th className="px-5 py-3.5 font-semibold">Action</th>
                <th className="px-5 py-3.5 font-semibold">Actor</th>
                <th className="px-5 py-3.5 font-semibold">Target</th>
                <th className="px-5 py-3.5 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-3">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface transition-colors group">
                  <td className="px-5 py-4 whitespace-nowrap text-ink-3 text-[11px]">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-white border border-surface-3 group-hover:border-surface-3 transition-colors">
                        {getActionIcon(log.action)}
                      </div>
                      <span className="font-bold text-ink-2 text-[11px]">{log.action.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {log.actorEmail ? (
                      <span className="text-ink-2">{log.actorEmail}</span>
                    ) : (
                      <span className="text-ink-3 italic text-[11px]">SYSTEM</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-ink-3">{getTargetIcon(log.targetType)}</span>
                      <span className="text-accent">
                        {log.targetId}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-ink-2 font-sans text-sm">{log.summary ?? '-'}</span>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 text-[11px] text-ink-2 bg-white p-2 rounded-md border border-surface-2 overflow-x-auto max-w-sm custom-scrollbar">
                        <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink-3 text-sm font-sans">
                    {busy ? 'Loading telemetry...' : 'No audit logs found matching your criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 pb-5">
          <Pagination meta={meta} onPage={setPage} busy={busy} />
        </div>
      </div>
    </div>
  );
}
