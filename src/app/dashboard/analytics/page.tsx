'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatStatus, formatMoney } from '@/lib/parcel-utils';
import { type DashboardStats, type DashboardTrends } from '@/lib/types';
import { Activity, TrendingUp, DollarSign, Package, Truck, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [days, setDays] = useState(30);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([
      api.getDashboard(),
      api.getDashboardTrends(days)
    ]).then(([s, t]) => {
      if (!active) return;
      setStats(s);
      setTrends(t);
      setIsLoading(false);
    }).catch(e => {
      if (!active) return;
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
      setIsLoading(false);
    });
    
    return () => { active = false; };
  }, [days]);

  if (error) return <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg text-sm">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-200">Analytics Overview</h1>
          <p className="text-slate-500 text-[13px] mt-1 font-mono tracking-wide">SYSTEM PERFORMANCE & REVENUE METRICS</p>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-md border border-slate-800">
          {[7, 30, 90, 365].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded transition-all cursor-pointer ${
                days === d 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      ) : stats && trends ? (
        <>
          {/* Top KPI Cards */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <KpiCard title="Total Revenue" value={formatMoney(trends.revenue.deliveryFeesDelivered)} icon={DollarSign} trend="+12.5%" tone="green" />
            <KpiCard title="Active Parcels" value={stats.totalParcels - (stats.parcelsByStatus.DELIVERED ?? 0) - (stats.parcelsByStatus.CANCELLED ?? 0)} icon={Package} tone="orange" />
            <KpiCard title="Avg Delivery Time" value={trends.averageFulfilmentHours ? `${Math.round(trends.averageFulfilmentHours)}h` : 'N/A'} icon={Clock} tone="blue" />
            <KpiCard title="Active Couriers" value={trends.courierThroughput.filter(c => c.active > 0).length} icon={Truck} tone="amber" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Chart Area */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800/60 flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-500" />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-300">Volume Over Time</h2>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1 flex items-end gap-1.5 h-64 border-b border-slate-800">
                  {trends.daily.length > 0 ? trends.daily.map((day) => {
                    const max = Math.max(...trends.daily.map(d => Math.max(d.created, d.delivered, 1)));
                    const hCreated = `${(day.created / max) * 100}%`;
                    const hDelivered = `${(day.delivered / max) * 100}%`;
                    
                    return (
                      <div key={day.date} className="flex-1 flex flex-col justify-end group relative h-full">
                        {/* Tooltip */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-950 px-3 py-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl border border-slate-700 font-mono">
                          <div className="font-bold mb-1 border-b border-slate-800 pb-1 text-slate-200">{day.date}</div>
                          <div className="text-amber-500">Created: {day.created}</div>
                          <div className="text-emerald-500">Delivered: {day.delivered}</div>
                        </div>
                        
                        <div className="w-full flex gap-px items-end justify-center h-full group-hover:opacity-80 transition-opacity">
                          <div className="w-1/2 bg-amber-500/80 rounded-t-[1px]" style={{ height: hCreated, minHeight: '2px' }} />
                          <div className="w-1/2 bg-emerald-500/80 rounded-t-[1px]" style={{ height: hDelivered, minHeight: '2px' }} />
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm font-mono">No data for this period</div>
                  )}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-amber-500/80" /> Created</div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500/80" /> Delivered</div>
                </div>
              </div>
            </div>

            {/* Revenue breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
              <div className="px-5 py-4 border-b border-slate-800/60">
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-300">Financials</h2>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-6">
                <FinancialRow label="Booked Fees" value={trends.revenue.deliveryFeesBooked} />
                <FinancialRow label="Realized Revenue" value={trends.revenue.deliveryFeesDelivered} color="text-emerald-400" />
                <div className="h-px bg-slate-800/60 w-full" />
                <FinancialRow label="COD Collected" value={trends.revenue.codCollected} />
                <FinancialRow label="COD Outstanding" value={trends.revenue.codOutstanding} color="text-amber-400" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Courier Performance */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col max-h-[400px]">
              <div className="px-5 py-4 border-b border-slate-800/60">
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-300">Courier Performance</h2>
              </div>
              <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-[13px] text-left">
                  <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-900/50 sticky top-0 z-10 border-b border-slate-800/60">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Courier</th>
                      <th className="px-5 py-3 font-semibold text-right">Active</th>
                      <th className="px-5 py-3 font-semibold text-right">Delivered</th>
                      <th className="px-5 py-3 font-semibold text-right">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {trends.courierThroughput.map(c => (
                      <tr key={c.courierId} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-5 py-3 text-cyan-400 font-medium font-sans">{c.courierName}</td>
                        <td className="px-5 py-3 text-right text-amber-500">{c.active}</td>
                        <td className="px-5 py-3 text-right text-emerald-500">{c.delivered}</td>
                        <td className="px-5 py-3 text-right text-slate-400">
                          {c.averageDeliveryHours ? `${Math.round(c.averageDeliveryHours)}h` : '-'}
                        </td>
                      </tr>
                    ))}
                    {trends.courierThroughput.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-500 text-sm font-sans">No courier data in this period</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dwell Times */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col max-h-[400px]">
              <div className="px-5 py-4 border-b border-slate-800/60 flex justify-between items-center">
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate-300">Status Dwell Times</h2>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Completed Stages</span>
              </div>
              <div className="p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                {trends.statusTimings.map(s => {
                  const maxHours = Math.max(...trends.statusTimings.map(t => t.averageHours ?? 0), 10);
                  const w = s.averageHours ? `${Math.min((s.averageHours / maxHours) * 100, 100)}%` : '0%';
                  return (
                    <div key={s.status} className="flex items-center gap-4 group">
                      <div className="w-32 text-[11px] font-bold tracking-wider text-slate-400 uppercase truncate">{formatStatus(s.status)}</div>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 group-hover:bg-cyan-400 transition-all duration-1000 ease-out" 
                          style={{ width: w }} 
                        />
                      </div>
                      <div className="w-16 text-right text-xs font-mono font-bold text-slate-200">
                        {s.averageHours ? `${s.averageHours.toFixed(1)}h` : '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, tone }: { title: string, value: string | number, icon: React.ElementType, trend?: string, tone: string }) {
  const bgColors: Record<string, string> = {
    orange: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    blue: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    red: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 text-slate-800/30 group-hover:text-slate-800/50 transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-12">
        <Icon size={120} />
      </div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">{title}</div>
          <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${bgColors[tone] || bgColors.blue}`}>
            <Icon size={16} />
          </div>
        </div>
        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold font-mono text-slate-200">{value}</div>
            {trend && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1"><TrendingUp size={12}/> {trend}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialRow({ label, value, color = "text-slate-200" }: { label: string, value: number, color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-[13px] text-slate-400 font-bold uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-mono font-bold ${color}`}>{formatMoney(value)}</div>
    </div>
  );
}
