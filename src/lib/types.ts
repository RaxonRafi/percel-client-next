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
  /**
   * Populated on my-parcels, GET /parcels and the single-parcel routes, but
   * omitted on incoming-parcels and delivery-history — always guard before use.
   */
  changedBy?: User | null;
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
  statusLogs: ParcelStatusLog[];
  createdAt: string;
  updatedAt: string;
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
