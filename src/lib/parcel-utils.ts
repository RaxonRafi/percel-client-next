import {
  COURIER_STATUSES,
  DELIVERY_ZONES,
  FAILURE_REASONS,
  type DeliveryFailureReason,
  type DeliveryZone,
  type Parcel,
  type ParcelStatus,
  type PaymentStatus,
  type RouteType,
} from './types';

export function formatStatus(status: ParcelStatus): string {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Fees and COD are plain numbers in the local currency (BDT). */
export function formatMoney(amount: number): string {
  return `৳ ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

/** A signed amount for a statement line: "+ ৳ 2,000" / "− ৳ 105". */
export function formatSignedMoney(amount: number): string {
  const sign = amount > 0 ? '+ ' : amount < 0 ? '− ' : '';
  return `${sign}${formatMoney(Math.abs(amount))}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "Tue, Oct 21" — for delivery estimates, where the hour is not a promise. */
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function zoneLabel(zone: DeliveryZone): string {
  return DELIVERY_ZONES.find((z) => z.value === zone)?.label ?? zone;
}

export function failureLabel(reason: DeliveryFailureReason): string {
  return FAILURE_REASONS.find((r) => r.value === reason)?.label ?? reason;
}

export const ROUTE_LABELS: Record<RouteType, string> = {
  CITY: 'Inside Dhaka',
  SUBURB: 'Dhaka suburbs',
  NATIONAL: 'Nationwide',
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  NOT_REQUIRED: 'Cash on delivery',
  UNPAID: 'Prepaid — unpaid',
  PAID: 'Prepaid — paid',
};

/** The route a pair of zones makes — mirrors the server's pricing rule. */
export function routeFor(pickup: DeliveryZone, delivery: DeliveryZone): RouteType {
  if (pickup === 'OUTSIDE_DHAKA' || delivery === 'OUTSIDE_DHAKA') return 'NATIONAL';
  if (pickup === 'DHAKA_CITY' && delivery === 'DHAKA_CITY') return 'CITY';
  return 'SUBURB';
}

/**
 * The server enforces a state machine on `PATCH /parcels/:trackingId/status`
 * and answers anything else with a 400, so only offer the legal moves.
 * `DELIVERED`, `CANCELLED` and `RETURNED_TO_SENDER` are terminal.
 */
const TRANSITIONS: Record<ParcelStatus, ParcelStatus[]> = {
  PENDING: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'CANCELLED'],
  // IN_TRANSIT -> DELIVERED covers routes with no separate final leg.
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNING', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED_ATTEMPT', 'CANCELLED'],
  // Back out for another try (refused once attempts run out), or home.
  FAILED_ATTEMPT: ['OUT_FOR_DELIVERY', 'RETURNING', 'CANCELLED'],
  RETURNING: ['RETURNED_TO_SENDER'],
  DELIVERED: [],
  CANCELLED: [],
  RETURNED_TO_SENDER: [],
};

/**
 * Legal next statuses from `current` through the status route. A courier is
 * further restricted to the statuses couriers may set — notably not
 * `CANCELLED`. `FAILED_ATTEMPT` never appears: it has its own route.
 */
export function allowedTransitions(
  current: ParcelStatus,
  role?: string,
): ParcelStatus[] {
  const moves = (TRANSITIONS[current] ?? []).filter((s) => s !== 'FAILED_ATTEMPT');
  return role === 'DELIVERY_PERSONNEL'
    ? moves.filter((s) => COURIER_STATUSES.includes(s))
    : moves;
}

/** Whether a failed attempt can be recorded right now. */
export function canRecordFailure(status: ParcelStatus): boolean {
  return TRANSITIONS[status]?.includes('FAILED_ATTEMPT') ?? false;
}

/**
 * A cash-on-delivery parcel can only be closed through delivery proof, which
 * records the cash. The status route and receiver confirmation answer 400
 * until then.
 */
export function needsProof(parcel: Pick<Parcel, 'codAmount' | 'isCodCollected'>): boolean {
  return parcel.codAmount > 0 && !parcel.isCodCollected;
}

export function isTerminal(status: ParcelStatus): boolean {
  return (TRANSITIONS[status] ?? []).length === 0;
}

/** Badge classes for a status pill, shared by every parcel list. */
export function statusTone(status: ParcelStatus): string {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'PENDING':
      return 'bg-surface-2 text-ink-2 border-surface-3';
    case 'CANCELLED':
    case 'RETURNED_TO_SENDER':
      return 'bg-rose-50 text-rose-600 border-rose-200';
    case 'FAILED_ATTEMPT':
    case 'RETURNING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-accent-bg text-accent border-accent/20';
  }
}

/**
 * `incoming-parcels` and `delivery-history` overlap for a receiver, so merging
 * them straight into one list can repeat a parcel (and duplicate React keys).
 */
export function mergeParcels(...lists: Parcel[][]): Parcel[] {
  const byId = new Map<string, Parcel>();
  for (const list of lists) {
    for (const parcel of list) byId.set(parcel.id, parcel);
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** `datetime-local` value ("2026-10-24T14:00") for a Date, in local time. */
export function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** A `datetime-local` value as an ISO instant, or undefined when empty. */
export function fromLocalInput(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}
