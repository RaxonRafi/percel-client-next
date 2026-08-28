import { COURIER_STATUSES, type Parcel, type ParcelStatus } from './types';

export function parcelStatusVariant(
  status: ParcelStatus,
): 'transit' | 'delivered' | 'pending' | 'failed' | 'default' {
  switch (status) {
    case 'DELIVERED':
      return 'delivered';
    case 'PENDING':
    case 'PICKED_UP':
      return 'pending';
    case 'CANCELLED':
      return 'failed';
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
      return 'transit';
    default:
      return 'default';
  }
}

/** Maps a status onto the `.status-pill` modifiers in swiftparcel.css. */
export function statusPillClass(status: ParcelStatus): string {
  return `status-pill s-${parcelStatusVariant(status)}`;
}

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

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * The server enforces a state machine on `PATCH /parcels/:trackingId/status`
 * and answers anything else with a 400, so only offer the legal moves.
 * `DELIVERED` and `CANCELLED` are terminal.
 */
const TRANSITIONS: Record<ParcelStatus, ParcelStatus[]> = {
  PENDING: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'CANCELLED'],
  // IN_TRANSIT -> DELIVERED covers routes with no separate final leg.
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * Legal next statuses from `current`. A courier is further restricted to the
 * four statuses couriers may set — notably not `CANCELLED`.
 */
export function allowedTransitions(
  current: ParcelStatus,
  role?: string,
): ParcelStatus[] {
  const moves = TRANSITIONS[current] ?? [];
  return role === 'DELIVERY_PERSONNEL'
    ? moves.filter((s) => COURIER_STATUSES.includes(s))
    : moves;
}

export function isTerminal(status: ParcelStatus): boolean {
  return TRANSITIONS[status].length === 0;
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
