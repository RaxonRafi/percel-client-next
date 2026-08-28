'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatStatus, formatMoney } from '@/lib/parcel-utils';
import { PARCEL_STATUSES, type DashboardStats, type DashboardTrends } from '@/lib/types';
import { Activity, TrendingUp, DollarSign, Package, Truck, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  if (error) return <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">{error}</div>;

  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Analytics Overview</h1>
          <p className="text-ink-3 text-sm mt-1">Track your platform's performance and revenue.</p>
        </div>
        
        <div className="flex bg-surface-2 p-1 rounded-lg border border-surface-3">
          {[7, 30, 90, 365].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                days === d 
                  ? "bg-accent text-white shadow-sm" 
                  : "text-ink-3 hover:text-white hover:bg-surface-3"
              )}
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
            <KpiCard title="Total Revenue" value={formatMoney(trends.revenue.deliveryFeesDelivered)} icon={DollarSign} trend="+12.5%" />
            <KpiCard title="Active Parcels" value={stats.totalParcels - (stats.parcelsByStatus.DELIVERED ?? 0) - (stats.parcelsByStatus.CANCELLED ?? 0)} icon={Package} />
            <KpiCard title="Avg Delivery Time" value={trends.averageFulfilmentHours ? `${Math.round(trends.averageFulfilmentHours)}h` : 'N/A'} icon={Clock} />
            <KpiCard title="Active Couriers" value={trends.courierThroughput.filter(c => c.active > 0).length} icon={Truck} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Chart Area */}
            <Card className="lg:col-span-2 overflow-hidden border-surface-3 bg-surface/50 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Volume Over Time
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                <div className="h-64 flex items-end gap-2">
                  {trends.daily.length > 0 ? trends.daily.map((day, i) => {
                    const max = Math.max(...trends.daily.map(d => Math.max(d.created, d.delivered, 1)));
                    const hCreated = `${(day.created / max) * 100}%`;
                    const hDelivered = `${(day.delivered / max) * 100}%`;
                    
                    return (
                      <div key={day.date} className="flex-1 flex flex-col justify-end group relative h-full">
                        {/* Tooltip */}
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-ink px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl border border-white/10">
                          <div className="font-bold mb-1 border-b border-white/10 pb-1">{day.date}</div>
                          <div className="text-amber-400">Created: {day.created}</div>
                          <div className="text-green-400">Delivered: {day.delivered}</div>
                        </div>
                        
                        <div className="w-full flex gap-0.5 items-end justify-center h-full">
                          <div className="w-1/2 bg-amber-500/50 hover:bg-amber-400 rounded-t-sm transition-all min-h-[4px]" style={{ height: hCreated }} />
                          <div className="w-1/2 bg-green-500/50 hover:bg-green-400 rounded-t-sm transition-all min-h-[4px]" style={{ height: hDelivered }} />
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-3 text-sm">No data for this period</div>
                  )}
                </div>
                <div className="flex justify-center gap-6 mt-6 text-xs text-ink-3">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500/50" /> Parcels Created</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500/50" /> Parcels Delivered</div>
                </div>
              </div>
            </Card>

            {/* Revenue breakdown */}
            <Card className="border-surface-3 bg-surface/50 backdrop-blur-xl flex flex-col">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-lg">Financials</CardTitle>
              </CardHeader>
              <div className="p-6 flex-1 flex flex-col gap-6">
                <FinancialRow label="Booked Fees" value={trends.revenue.deliveryFeesBooked} />
                <FinancialRow label="Realized Revenue" value={trends.revenue.deliveryFeesDelivered} color="text-green-400" />
                <div className="h-px bg-surface-3 w-full" />
                <FinancialRow label="COD Collected" value={trends.revenue.codCollected} />
                <FinancialRow label="COD Outstanding" value={trends.revenue.codOutstanding} color="text-amber-400" />
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Courier Performance */}
            <Card className="border-surface-3 bg-surface/50 backdrop-blur-xl flex flex-col max-h-96">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-lg">Courier Performance</CardTitle>
              </CardHeader>
              <div className="p-0 overflow-y-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-ink-3 uppercase bg-white/[0.02] sticky top-0 backdrop-blur-xl z-10 border-b border-surface-3">
                    <tr>
                      <th className="px-6 py-4 font-medium">Courier</th>
                      <th className="px-6 py-4 font-medium text-right">Active</th>
                      <th className="px-6 py-4 font-medium text-right">Delivered</th>
                      <th className="px-6 py-4 font-medium text-right">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-3">
                    {trends.courierThroughput.map(c => (
                      <tr key={c.courierId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{c.courierName}</td>
                        <td className="px-6 py-4 text-right text-amber-400">{c.active}</td>
                        <td className="px-6 py-4 text-right text-green-400">{c.delivered}</td>
                        <td className="px-6 py-4 text-right text-ink-3">
                          {c.averageDeliveryHours ? `${Math.round(c.averageDeliveryHours)}h` : '-'}
                        </td>
                      </tr>
                    ))}
                    {trends.courierThroughput.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-ink-3">No courier data in this period</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Dwell Times */}
            <Card className="border-surface-3 bg-surface/50 backdrop-blur-xl flex flex-col max-h-96">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-lg flex justify-between items-center">
                  Status Dwell Times
                  <span className="text-xs font-normal text-ink-3">Completed stages</span>
                </CardTitle>
              </CardHeader>
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {trends.statusTimings.map(s => {
                  const maxHours = Math.max(...trends.statusTimings.map(t => t.averageHours ?? 0), 10);
                  const w = s.averageHours ? `${Math.min((s.averageHours / maxHours) * 100, 100)}%` : '0%';
                  return (
                    <div key={s.status} className="flex items-center gap-4">
                      <div className="w-32 text-xs font-medium text-ink-2 truncate">{formatStatus(s.status)}</div>
                      <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent transition-all duration-1000 ease-out" 
                          style={{ width: w }} 
                        />
                      </div>
                      <div className="w-16 text-right text-xs font-bold text-white">
                        {s.averageHours ? `${s.averageHours.toFixed(1)}h` : '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend }: { title: string, value: string | number, icon: React.ElementType, trend?: string }) {
  return (
    <Card className="border-surface-3 bg-gradient-to-br from-surface to-surface-2 overflow-hidden relative group">
      <div className="absolute -right-6 -top-6 text-white/[0.03] group-hover:text-white/[0.05] transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-12">
        <Icon size={120} />
      </div>
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-accent/10 text-accent rounded-lg">
            <Icon size={20} />
          </div>
          {trend && <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full flex items-center gap-1"><TrendingUp size={12}/> {trend}</span>}
        </div>
        <div className="text-3xl font-display font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-ink-3 uppercase tracking-wider font-semibold">{title}</div>
      </div>
    </Card>
  );
}

function FinancialRow({ label, value, color = "text-white" }: { label: string, value: number, color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-ink-2 font-medium">{label}</div>
      <div className={cn("text-xl font-display font-bold", color)}>{formatMoney(value)}</div>
    </div>
  );
}
