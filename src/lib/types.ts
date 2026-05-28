export type Role =
  | 'ADMIN'
  | 'SENDER'
  | 'RECEIVER'
  | 'DELIVERY_PERSONNEL'
  | 'PENDING_DELIVERY';

export type ParcelStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  picture?: string;
  address?: string;
  isActive: string;
  isVerified: boolean;
  createdAt: string;
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
  parcelsByStatus: Record<string, number>;
  blockedParcels: number;
}

export interface Parcel {
  id: string;
  trackingId: string;
  senderName: string;
  receiverName: string;
  pickupAddress: string;
  deliveryAddress: string;
  description?: string;
  status: ParcelStatus;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: User;
  receiver?: User;
  statusLogs?: ParcelStatusLog[];
}

export interface ParcelStatusLog {
  id: string;
  status: ParcelStatus;
  note?: string;
  createdAt: string;
}
