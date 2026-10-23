'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Banknote, HandCoins, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatMoney, formatSignedMoney } from '@/lib/parcel-utils';
import { toast } from '@/lib/toast';
import type {
  LedgerAccountType,
  LedgerBalance,
  LedgerEntryType,
  LedgerStatement,
  PageMeta,
  PayoutMethod,
} from '@/lib/types';

const ENTRY_LABELS: Record<LedgerEntryType, string> = {
  DELIVERY_FEE: 'Delivery fee',
  FEE_ADJUSTMENT: 'Fee changed',
  FEE_REVERSAL: 'Fee refunded (cancelled)',
  COD_FEE_REVERSAL: 'Cash handling refunded (returned)',
  RETURN_FEE: 'Return to sender',
  COD_CREDIT: 'Cash collected for you',
  FEE_PAYMENT: 'Fee paid online',
  PAYOUT: 'Paid out to you',
  COD_COLLECTED: 'Cash collected at the door',
  COD_DEPOSIT: 'Cash handed in',
};

const field =
  'h-10 w-full rounded-lg border border-surface-3 bg-white px-3 text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none placeholder:text-ink-3';

/** One statement: balance on top, every entry that makes it up below. */
function Statement({
  statement,
  onPage,
}: {
  statement: LedgerStatement;
  onPage: (page: number) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-surface-3">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-surface-3 bg-surface text-[11px] uppercase tracking-wider text-ink-3">
          <tr>
            <th className="px-4 py-3 font-semibold">When</th>
            <th className="px-4 py-3 font-semibold">What</th>
            <th className="px-4 py-3 font-semibold">Parcel</th>
            <th className="px-4 py-3 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-3">
          {statement.entries.data.map((entry) => (
            <tr key={entry.id}>
              <td className="whitespace-nowrap px-4 py-2.5 text-ink-3">{formatDate(entry.createdAt)}</td>
              <td className="px-4 py-2.5 text-ink-2">
                {ENTRY_LABELS[entry.type] ?? entry.type}
                {(entry.note || entry.reference) && (
                  <span className="block text-[11px] text-ink-3">
                    {[entry.note, entry.reference && `Ref ${entry.reference}`].filter(Boolean).join(' · ')}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5">
                {entry.trackingId ? (
                  <Link className="text-accent hover:underline" href={`/track/${entry.trackingId}`}>
                    {entry.trackingId}
                  </Link>
                ) : (
                  <span className="text-ink-3">—</span>
                )}
              </td>
              <td
                className={`whitespace-nowrap px-4 py-2.5 text-right font-semibold ${
                  entry.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatSignedMoney(entry.amount)}
              </td>
            </tr>
          ))}
          {statement.entries.data.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-ink-3">No money has moved yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      {statement.entries.meta.totalPages > 1 && (
        <div className="px-4 pb-4">
          <Pagination meta={statement.entries.meta} onPage={onPage} />
        </div>
      )}
    </div>
  );
}

/** A sender's or courier's own balance and statement. */
function MyAccount() {
  const [statement, setStatement] = useState<LedgerStatement | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .getMyLedger({ page, limit: 20 })
      .then((s) => !cancelled && setStatement(s))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load your balance'));
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!statement) return <p className="text-sm text-ink-3">Loading…</p>;

  const courier = statement.accountType === 'COURIER';
  const balance = statement.balance;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-surface-3 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          {courier ? 'Cash in hand' : balance >= 0 ? 'Owed to you' : 'You owe'}
        </p>
        <p className={`mt-1 text-3xl font-bold ${courier || balance >= 0 ? 'text-ink' : 'text-rose-600'}`}>
          {formatMoney(Math.abs(balance))}
        </p>
        <p className="mt-2 max-w-xl text-[13px] text-ink-3">
          {courier
            ? 'Cash you collected from receivers and have not handed in yet. It drops when the office records your hand-in.'
            : 'Cash collected on your parcels, less delivery fees. Prepaid fees you have not paid online are taken from it. The office pays the balance out by bank or wallet.'}
        </p>
      </div>
      <Statement statement={statement} onPage={setPage} />
    </div>
  );
}

/** The admin's view: who is owed, who holds cash, and recording settlements. */
function Settlements() {
  const [tab, setTab] = useState<LedgerAccountType>('MERCHANT');
  const [rows, setRows] = useState<LedgerBalance[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [outstandingOnly, setOutstandingOnly] = useState(true);
  const [error, setError] = useState('');

  const [viewing, setViewing] = useState<LedgerBalance | null>(null);
  const [statement, setStatement] = useState<LedgerStatement | null>(null);
  const [statementPage, setStatementPage] = useState(1);

  const [settling, setSettling] = useState<LedgerBalance | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayoutMethod>('BKASH');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const query = { page, limit: 20, outstandingOnly: outstandingOnly || undefined };
      const list =
        tab === 'MERCHANT' ? await api.getMerchantBalances(query) : await api.getCourierBalances(query);
      setRows(list.data);
      setMeta(list.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load balances');
    }
  }, [tab, page, outstandingOnly]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!viewing) return;
    let cancelled = false;
    const fetch =
      tab === 'MERCHANT'
        ? api.getMerchantStatement(viewing.userId, { page: statementPage, limit: 10 })
        : api.getCourierStatement(viewing.userId, { page: statementPage, limit: 10 });
    fetch.then((s) => !cancelled && setStatement(s)).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [viewing, statementPage, tab]);

  async function settle(e: React.FormEvent) {
    e.preventDefault();
    if (!settling) return;
    setBusy(true);
    try {
      const value = Number(amount);
      if (tab === 'MERCHANT') {
        await api.recordMerchantPayout(settling.userId, {
          amount: value,
          method,
          reference: reference.trim() || undefined,
        });
        toast.success(`Recorded ${formatMoney(value)} paid to ${settling.name}`);
      } else {
        await api.recordCourierDeposit(settling.userId, {
          amount: value,
          reference: reference.trim() || undefined,
        });
        toast.success(`Recorded ${formatMoney(value)} handed in by ${settling.name}`);
      }
      setSettling(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not record it');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md border border-surface-3 bg-white p-1">
          {(['MERCHANT', 'COURIER'] as LedgerAccountType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                tab === t
                  ? 'border border-accent/20 bg-accent-bg text-accent'
                  : 'border border-transparent text-ink-3 hover:bg-surface-2 hover:text-ink-2'
              }`}
            >
              {t === 'MERCHANT' ? 'Merchants — owed' : 'Couriers — cash held'}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-accent"
            checked={outstandingOnly}
            onChange={(e) => {
              setOutstandingOnly(e.target.checked);
              setPage(1);
            }}
          />
          Only non-zero balances
        </label>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-surface-3 bg-white shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-surface-3 bg-surface text-[11px] uppercase tracking-wider text-ink-3">
            <tr>
              <th className="px-5 py-3 font-semibold">{tab === 'MERCHANT' ? 'Merchant' : 'Courier'}</th>
              <th className="px-5 py-3 text-right font-semibold">
                {tab === 'MERCHANT' ? 'Balance (+ owed to them)' : 'Cash held'}
              </th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-3">
            {rows.map((row) => (
              <tr key={row.userId}>
                <td className="px-5 py-3">
                  <b className="text-ink">{row.name}</b>
                  <span className="block text-[11px] text-ink-3">{row.email} · {row.entries} entries</span>
                </td>
                <td
                  className={`px-5 py-3 text-right font-semibold ${
                    row.balance < 0 ? 'text-rose-600' : 'text-ink'
                  }`}
                >
                  {formatSignedMoney(row.balance)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setStatement(null);
                        setStatementPage(1);
                        setViewing(row);
                      }}
                    >
                      Statement
                    </Button>
                    {row.balance > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSettling(row);
                          setAmount(String(row.balance));
                          setReference('');
                        }}
                      >
                        {tab === 'MERCHANT' ? (
                          <><Banknote className="h-3.5 w-3.5" /> Record payout</>
                        ) : (
                          <><HandCoins className="h-3.5 w-3.5" /> Record hand-in</>
                        )}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-ink-3">Nothing outstanding.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-5 pb-5">
          <Pagination meta={meta} onPage={setPage} />
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        {viewing && (
          <DialogContent
            title={viewing.name}
            description={statement ? `Balance ${formatSignedMoney(statement.balance)}` : 'Loading…'}
            className="max-w-3xl"
          >
            {statement ? <Statement statement={statement} onPage={setStatementPage} /> : <p className="text-sm text-ink-3">Loading…</p>}
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!settling} onOpenChange={(open) => !open && setSettling(null)}>
        {settling && (
          <DialogContent
            title={tab === 'MERCHANT' ? `Pay ${settling.name}` : `Cash from ${settling.name}`}
            description={
              tab === 'MERCHANT'
                ? `Record money you have already sent. They are owed ${formatMoney(settling.balance)}.`
                : `Record cash handed in at the hub. They hold ${formatMoney(settling.balance)}.`
            }
          >
            <form onSubmit={settle} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-2" htmlFor="amount">Amount (৳)</label>
                <input
                  id="amount"
                  type="number"
                  min="0.01"
                  max={settling.balance}
                  step="0.01"
                  className={field}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              {tab === 'MERCHANT' && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-ink-2" htmlFor="method">Paid by</label>
                  <select id="method" className={field} value={method} onChange={(e) => setMethod(e.target.value as PayoutMethod)}>
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="BANK">Bank transfer</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-2" htmlFor="reference">Reference</label>
                <input
                  id="reference"
                  className={field}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={tab === 'MERCHANT' ? 'Transaction id' : 'Receipt number'}
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-surface-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setSettling(null)}>Cancel</Button>
                <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Record'}</Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [adminView, setAdminView] = useState<'settlements' | 'mine'>('settlements');

  if (user && !['ADMIN', 'SENDER', 'DELIVERY_PERSONNEL'].includes(user.role)) {
    return (
      <div className="rounded-xl border border-surface-3 bg-white p-6 text-sm text-ink-2 shadow-sm">
        Balances are kept for senders and couriers.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-ink">
            <Wallet className="h-5 w-5 text-accent" />
            {isAdmin ? 'Settlements' : user?.role === 'DELIVERY_PERSONNEL' ? 'Cash collected' : 'Balance and payouts'}
          </h1>
          <p className="mt-1 text-[13px] text-ink-3">
            Every taka that moves — fees, cash collected at the door, hand-ins and payouts.
          </p>
        </div>
        {isAdmin && (
          <div className="flex rounded-md border border-surface-3 bg-white p-1">
            {(['settlements', 'mine'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAdminView(v)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                  adminView === v ? 'border border-accent/20 bg-accent-bg text-accent' : 'border border-transparent text-ink-3'
                }`}
              >
                {v === 'settlements' ? 'Everyone' : 'My bookings'}
              </button>
            ))}
          </div>
        )}
      </div>

      {isAdmin && adminView === 'settlements' ? <Settlements /> : <MyAccount />}
    </div>
  );
}
