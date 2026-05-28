import type { ParcelStatus } from './types';

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
