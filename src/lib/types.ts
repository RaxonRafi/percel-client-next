export type Role =
  | 'ADMIN'
  | 'SENDER'
  | 'RECEIVER'
  | 'DELIVERY_PERSONNEL'
  | 'PENDING_DELIVERY';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export type ParcelStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export const PARCEL_STATUSES: ParcelStatus[] = [
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

/**
 * A courier may only move a parcel through these four. An admin may set
 * anything; anything else from a courier is a 403.
 */
export const COURIER_STATUSES: ParcelStatus[] = [
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export interface AuthProvider {
  id: string;
  provider: 'google' | 'credentials';
  providerId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  picture: string | null;
  address: string | null;
  isDeleted: boolean;
  isActive: AccountStatus;
  isVerified: boolean;
  nidNumber: string | null;
  nidImage: string[];
  auths: AuthProvider[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalParcels: number;
  blockedParcels: number;
  parcelsByStatus: Record<ParcelStatus, number>;
}

export interface ParcelStatusLog {
  id: string;
  status: ParcelStatus;
  note: string | null;
  /** Loaded on every authenticated parcel route; null if the author was deleted. */
  changedBy: User | null;
  createdAt: string;
}

export interface Parcel {
  id: string;
  trackingId: string;
  senderName: string;
  receiverName: string;
  senderPhone: string | null;
  receiverPhone: string | null;
  pickupAddress: string;
  deliveryAddress: string;
  description: string | null;
  status: ParcelStatus;
  isBlocked: boolean;
  sender: User;
  receiver: User;
  /** The assigned courier, or null while the parcel is unassigned. */
  deliveryPersonnel: User | null;
  statusLogs: ParcelStatusLog[];
  createdAt: string;
  updatedAt: string;
}

/**
 * What the public tracking route returns — an allow-list, not a `Parcel`.
 * No nested user records, no internal id, no phone numbers, and the courier is
 * reduced to a first name. Anything the dashboard shows beyond this needs an
 * authenticated route.
 */
export interface PublicParcel {
  trackingId: string;
  status: ParcelStatus;
  isBlocked: boolean;
  senderName: string;
  receiverName: string;
  pickupAddress: string;
  deliveryAddress: string;
  description: string | null;
  deliveryPersonnelName: string | null;
  statusLogs: PublicParcelStatusLog[];
  createdAt: string;
  updatedAt: string;
}

/** The public timeline carries no log `id` and no `changedBy`. */
export interface PublicParcelStatusLog {
  status: ParcelStatus;
  note: string | null;
  createdAt: string;
}

export interface RagSource {
  type: string;
  source: string;
  page: number | null;
}

export interface RagAnswer {
  answer: string;
  sources: RagSource[];
}

export interface MessageResponse {
  message: string;
}
