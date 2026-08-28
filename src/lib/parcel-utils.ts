import type { Parcel, ParcelStatus } from './types';

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

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
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
