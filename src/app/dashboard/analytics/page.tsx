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

  if (error) return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink">Analytics Overview</h1>
          <p className="text-ink-3 text-[13px] mt-1 tracking-wide">SYSTEM PERFORMANCE & REVENUE METRICS</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-md border border-surface-3">
          {[7, 30, 90, 365].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all cursor-pointer ${
                days === d 
                  ? "bg-accent-bg text-accent border border-accent/20" 
                  : "text-ink-3 hover:text-ink-2 hover:bg-surface-2 border border-transparent"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
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
            <div className="lg:col-span-2 bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-2">Volume Over Time</h2>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1 flex items-end gap-1.5 h-64 border-b border-surface-3">
                  {trends.daily.length > 0 ? trends.daily.map((day) => {
                    const max = Math.max(...trends.daily.map(d => Math.max(d.created, d.delivered, 1)));
                    const hCreated = `${(day.created / max) * 100}%`;
                    const hDelivered = `${(day.delivered / max) * 100}%`;
                    
                    return (
                      <div key={day.date} className="flex-1 flex flex-col justify-end group relative h-full">
                        {/* Tooltip */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none undefinedl border border-surface-3">
                          <div className="font-bold mb-1 border-b border-surface-3 pb-1 text-ink">{day.date}</div>
                          <div className="text-amber-600">Created: {day.created}</div>
                          <div className="text-emerald-600">Delivered: {day.delivered}</div>
                        </div>
                        
                        <div className="w-full flex gap-px items-end justify-center h-full group-hover:opacity-80 transition-opacity">
                          <div className="w-1/2 bg-amber-500 rounded-t-[1px]" style={{ height: hCreated, minHeight: '2px' }} />
                          <div className="w-1/2 bg-emerald-500 rounded-t-[1px]" style={{ height: hDelivered, minHeight: '2px' }} />
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-3 text-sm">No data for this period</div>
                  )}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-[11px] uppercase tracking-wider text-ink-3 font-bold">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-md bg-amber-500" /> Created</div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-md bg-emerald-500" /> Delivered</div>
                </div>
              </div>
            </div>

            {/* Revenue breakdown */}
            <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col">
              <div className="px-5 py-4 border-b border-surface-2">
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-2">Financials</h2>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-6">
                <FinancialRow label="Booked Fees" value={trends.revenue.deliveryFeesBooked} />
                <FinancialRow label="Realized Revenue" value={trends.revenue.deliveryFeesDelivered} color="text-emerald-600" />
                <div className="h-px bg-surface-2 w-full" />
                <FinancialRow label="COD Collected" value={trends.revenue.codCollected} />
                <FinancialRow label="COD Outstanding" value={trends.revenue.codOutstanding} color="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Courier Performance */}
            <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col max-h-[400px]">
              <div className="px-5 py-4 border-b border-surface-2">
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-2">Courier Performance</h2>
              </div>
              <div className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-[13px] text-left">
                  <thead className="text-[11px] uppercase tracking-wider text-ink-3 bg-surface sticky top-0 z-10 border-b border-surface-3">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Courier</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Active</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Delivered</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-3">
                    {trends.courierThroughput.map(c => (
                      <tr key={c.courierId} className="hover:bg-surface transition-colors">
                        <td className="px-5 py-4 font-semibold text-ink">{c.courierName}</td>
                        <td className="px-5 py-4 text-right text-amber-600">{c.active}</td>
                        <td className="px-5 py-4 text-right text-emerald-600">{c.delivered}</td>
                        <td className="px-5 py-4 text-right text-ink-2">
                          {c.averageDeliveryHours ? `${Math.round(c.averageDeliveryHours)}h` : '-'}
                        </td>
                      </tr>
                    ))}
                    {trends.courierThroughput.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-ink-3 text-sm font-sans">No courier data in this period</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dwell Times */}
            <div className="bg-white border border-surface-3 rounded-xl shadow-sm flex flex-col max-h-[400px]">
              <div className="px-5 py-4 border-b border-surface-2 flex justify-between items-center">
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-2">Status Dwell Times</h2>
                <span className="text-[10px] uppercase tracking-wider text-ink-3">Completed Stages</span>
              </div>
              <div className="p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                {trends.statusTimings.map(s => {
                  const maxHours = Math.max(...trends.statusTimings.map(t => t.averageHours ?? 0), 10);
                  const w = s.averageHours ? `${Math.min((s.averageHours / maxHours) * 100, 100)}%` : '0%';
                  return (
                    <div key={s.status} className="flex items-center gap-4 group">
                      <div className="w-32 text-[11px] font-bold tracking-wider text-ink-2 uppercase truncate">{formatStatus(s.status)}</div>
                      <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent group-hover:bg-accent-2 transition-all duration-1000 ease-out" 
                          style={{ width: w }} 
                        />
                      </div>
                      <div className="w-16 text-right text-xs font-bold text-ink">
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
    orange: 'bg-amber-50 text-amber-600 border-amber-200',
    blue: 'bg-accent-bg text-accent border-accent/20',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  return (
    <div className="bg-white border border-surface-3 rounded-xl shadow-sm p-4 flex flex-col relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 text-surface-3 group-hover:text-surface-3 transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-12">
        <Icon size={120} />
      </div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div className="text-[11px] font-bold tracking-widest text-ink-3 uppercase">{title}</div>
          <div className={`w-7 h-7 rounded-md flex items-center justify-center border ${bgColors[tone] || bgColors.blue}`}>
            <Icon size={16} />
          </div>
        </div>
        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-ink">{value}</div>
            {trend && <span className="text-[11px] font-semibold $1 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1"><TrendingUp size={12}/> {trend}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialRow({ label, value, color = "text-ink" }: { label: string, value: number, color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-[13px] text-ink-2 font-bold uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{formatMoney(value)}</div>
    </div>
  );
}
