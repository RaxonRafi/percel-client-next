'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
      case 'USER_BLOCKED': return <UserX className="h-4 w-4 text-rose-500" />;
      case 'USER_UNBLOCKED': return <UserCheck className="h-4 w-4 text-emerald-500" />;
      case 'DELIVERY_APPROVED': return <Truck className="h-4 w-4 text-emerald-500" />;
      case 'DELIVERY_REJECTED': return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      case 'PARCEL_BLOCKED': return <ShieldAlert className="h-4 w-4 text-amber-500" />;
      case 'PARCEL_ASSIGNED': return <User className="h-4 w-4 text-cyan-500" />;
      case 'PARCEL_UNASSIGNED': return <UserX className="h-4 w-4 text-amber-500" />;
      case 'PARCEL_STATUS_CHANGED': return <PlayCircle className="h-4 w-4 text-cyan-400" />;
      default: return <Settings className="h-4 w-4 text-slate-500" />;
    }
  };

  const getTargetIcon = (type: AuditLogTargetType) => {
    return type === 'USER' ? <User className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && <p className="text-sm text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-500" />
            System Audit Logs
          </h1>
          <p className="text-slate-500 text-[13px] mt-1 font-mono tracking-wide">IMMUTABLE RECORD OF CRITICAL ACTIONS</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/50 flex flex-wrap gap-3">
          <select
            className="h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none min-w-[160px] font-mono"
            value={filters.action}
            onChange={(e) => applyFilter({ action: e.target.value })}
          >
            <option value="">ALL ACTIONS</option>
            {[
              'USER_BLOCKED', 'USER_UNBLOCKED', 'DELIVERY_APPROVED', 'DELIVERY_REJECTED', 
              'PARCEL_BLOCKED', 'PARCEL_ASSIGNED', 'PARCEL_UNASSIGNED', 'PARCEL_STATUS_CHANGED'
            ].map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
          
          <select
            className="h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none font-mono"
            value={filters.targetType}
            onChange={(e) => applyFilter({ targetType: e.target.value })}
          >
            <option value="">ALL TYPES</option>
            <option value="USER">USER</option>
            <option value="PARCEL">PARCEL</option>
          </select>

          <input
            className="max-w-xs h-9 rounded border border-slate-800 bg-slate-950 px-3 text-[13px] text-slate-300 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none placeholder:text-slate-600 font-mono"
            placeholder="SEARCH BY TARGET ID"
            value={filters.targetId}
            onChange={(e) => applyFilter({ targetId: e.target.value })}
          />
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-slate-900/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Timestamp</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Actor</th>
                <th className="px-5 py-3 font-semibold">Target</th>
                <th className="px-5 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-5 py-3 whitespace-nowrap text-slate-500 text-[11px]">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
                        {getActionIcon(log.action)}
                      </div>
                      <span className="font-bold text-slate-300 text-[11px]">{log.action.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {log.actorEmail ? (
                      <span className="text-slate-300">{log.actorEmail}</span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">SYSTEM</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">{getTargetIcon(log.targetType)}</span>
                      <span className="text-cyan-400">
                        {log.targetId}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-slate-400 font-sans text-sm">{log.summary ?? '-'}</span>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/60 overflow-x-auto max-w-sm custom-scrollbar">
                        <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm font-sans">
                    {busy ? 'Loading telemetry...' : 'No audit logs found matching your criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-800/60">
          <Pagination meta={meta} onPage={setPage} busy={busy} />
        </div>
      </div>
    </div>
  );
}
