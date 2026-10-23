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
  /** The courier reached the door and could not hand it over. */
  | 'FAILED_ATTEMPT'
  /** On its way back to the sender. */
  | 'RETURNING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED_TO_SENDER';

export const PARCEL_STATUSES: ParcelStatus[] = [
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'FAILED_ATTEMPT',
  'RETURNING',
  'DELIVERED',
  'CANCELLED',
  'RETURNED_TO_SENDER',
];

/**
 * Statuses a courier may set through the status route. An admin may set
 * anything; anything else from a courier is a 403. `FAILED_ATTEMPT` is a
 * courier's to record too, but through its own route — it needs a reason.
 */
export const COURIER_STATUSES: ParcelStatus[] = [
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RETURNING',
  'RETURNED_TO_SENDER',
];

/** Coarse areas the fee is priced by. The sender picks one per address. */
export type DeliveryZone = 'DHAKA_CITY' | 'DHAKA_SUBURB' | 'OUTSIDE_DHAKA';

export const DELIVERY_ZONES: { value: DeliveryZone; label: string }[] = [
  { value: 'DHAKA_CITY', label: 'Inside Dhaka city' },
  { value: 'DHAKA_SUBURB', label: 'Dhaka suburbs' },
  { value: 'OUTSIDE_DHAKA', label: 'Outside Dhaka' },
];

/** From the two zones: both in the city, any suburb, or anywhere else. */
export type RouteType = 'CITY' | 'SUBURB' | 'NATIONAL';

/** EXPRESS is refused (400) on a NATIONAL route. */
export type ServiceTier = 'STANDARD' | 'EXPRESS';

/**
 * How the fee is settled. `NOT_REQUIRED` is cash on delivery — the fee comes
 * out of the cash. A prepaid parcel is `UNPAID` until paid online.
 */
export type PaymentStatus = 'NOT_REQUIRED' | 'UNPAID' | 'PAID';

export type DeliveryFailureReason =
  | 'RECEIVER_UNAVAILABLE'
  | 'RECEIVER_UNREACHABLE'
  | 'WRONG_ADDRESS'
  | 'REFUSED'
  | 'RESCHEDULE_REQUESTED'
  | 'OTHER';

export const FAILURE_REASONS: { value: DeliveryFailureReason; label: string }[] = [
  { value: 'RECEIVER_UNAVAILABLE', label: 'Receiver not available' },
  { value: 'RECEIVER_UNREACHABLE', label: 'Receiver not answering the phone' },
  { value: 'WRONG_ADDRESS', label: 'Address could not be found' },
  { value: 'REFUSED', label: 'Receiver refused the parcel' },
  { value: 'RESCHEDULE_REQUESTED', label: 'Receiver asked for another day' },
  { value: 'OTHER', label: 'Other' },
];

/** Every list route returns this envelope now, never a bare array. */
export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** `limit` is capped at 100 server-side; unknown query params are a 400. */
export interface ListQuery {
  page?: number;
  limit?: number;
}

export interface ParcelQuery extends ListQuery {
  status?: ParcelStatus;
  /** Partial, case-insensitive: tracking id, sender name or receiver name. */
  search?: string;
  from?: string;
  to?: string;
  /** Admin-only filters. */
  isBlocked?: boolean;
  unassigned?: boolean;
}

export interface UserQuery extends ListQuery {
  role?: Role;
  isActive?: AccountStatus;
  /** Matches name or email. */
  search?: string;
}

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
  /** Parcel update emails. Account and security mail is sent regardless. */
  emailNotifications: boolean;
  auths: AuthProvider[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/** One signed-in device, from `GET /auth/sessions`. */
export interface Session {
  id: string;
  userAgent: string | null;
  ip: string | null;
  /** When this device signed in or last refreshed its token. */
  createdAt: string;
  expiresAt: string;
  /** Only known when the server sees the refresh cookie, which this client does not send. */
  current: boolean;
}

/** `GET /health` — answers 503 with `status: 'degraded'` when the database is down. */
export interface Health {
  status: 'ok' | 'degraded';
  uptime: number;
  database: 'up' | 'down';
  assistant: boolean;
  mail: boolean;
  /** False on a serverless API host: do not open a socket, poll instead. */
  realtime: boolean;
}

/**
 * How a delivery fee is made up. `total` is what the sender pays. `route`,
 * `serviceTier` and `expressFee` are missing on parcels booked before zones.
 */
export interface FeeBreakdown {
  route?: RouteType;
  serviceTier?: ServiceTier;
  baseFee: number;
  weightFee: number;
  codFee: number;
  expressFee?: number;
  total: number;
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
  weightKg: number;
  /** Computed server-side from weight and COD — the client never sends a price. */
  deliveryFee: number;
  /** Frozen at booking; null on parcels booked before it was recorded. */
  feeBreakdown: FeeBreakdown | null;
  /** Cash to collect on delivery; 0 means prepaid. */
  codAmount: number;
  isCodCollected: boolean;
  deliveryProofImages: string[];
  deliveryProofNote: string | null;
  /** Who actually took the parcel, when that differs from the receiver. */
  receivedBy: string | null;
  deliveredAt: string | null;
  paymentStatus: PaymentStatus;
  /** Charged once the parcel is RETURNED_TO_SENDER. */
  returnFee: number | null;
  pickupZone: DeliveryZone;
  deliveryZone: DeliveryZone;
  serviceTier: ServiceTier;
  pickupWindowStart: string | null;
  pickupWindowEnd: string | null;
  /** Null on parcels booked before estimates existed. */
  estimatedDeliveryAt: string | null;
  /** Failed attempts so far; the server allows 3 by default. */
  deliveryAttempts: number;
  lastFailureReason: DeliveryFailureReason | null;
  rescheduledFor: string | null;
  sender: User;
  receiver: User;
  /** The assigned courier, or null while the parcel is unassigned. */
  deliveryPersonnel: User | null;
  /**
   * The timeline. Lists leave it out; it comes with a single parcel — from
   * `GET /parcels/:trackingId/details` or the response to a mutation.
   */
  statusLogs?: ParcelStatusLog[];
  createdAt: string;
  updatedAt: string;
}

/**
 * What the public tracking route returns — an allow-list, not a `Parcel`.
 * No nested user records, no internal id, no phone numbers. It is masked too:
 * names are a first name and an initial ("Jane D."), the two addresses are the
 * area only ("Gulshan, Dhaka"), and the courier is a first name. The full
 * record is on the authenticated `details` route, for the parcel's parties.
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
  serviceTier: ServiceTier;
  estimatedDeliveryAt: string | null;
  deliveryAttempts: number;
  rescheduledFor: string | null;
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

export interface DashboardTrends {
  rangeDays: number;
  daily: { date: string; created: number; delivered: number }[];
  statusTimings: { status: ParcelStatus; averageHours: number | null; sampleSize: number }[];
  courierThroughput: {
    courierId: string;
    courierName: string;
    active: number;
    delivered: number;
    averageDeliveryHours: number | null;
  }[];
  revenue: {
    deliveryFeesBooked: number;
    deliveryFeesDelivered: number;
    codOutstanding: number;
    codCollected: number;
  };
  averageFulfilmentHours: number | null;
}

export const AUDIT_LOG_ACTIONS = [
  'USER_BLOCKED',
  'USER_UNBLOCKED',
  'USER_UPDATED',
  'USER_DELETED',
  'DELIVERY_APPROVED',
  'DELIVERY_REJECTED',
  'PARCEL_CREATED',
  'PARCEL_CANCELLED',
  'PARCEL_DELIVERY_CONFIRMED',
  'PARCEL_PROOF_SUBMITTED',
  'PARCEL_STATUS_CHANGED',
  'PARCEL_BLOCKED',
  'PARCEL_UNBLOCKED',
  'PARCEL_ASSIGNED',
  'PARCEL_UNASSIGNED',
  'PARCEL_UPDATED',
  'PARCEL_DELIVERY_FAILED',
  'PARCEL_RESCHEDULED',
  'PARCEL_BULK_BOOKED',
  'DELIVERY_CODE_REISSUED',
  'PAYMENT_RECEIVED',
  'COD_DEPOSIT_RECORDED',
  'PAYOUT_RECORDED',
] as const;

export type AuditLogAction = (typeof AUDIT_LOG_ACTIONS)[number];

export type AuditLogTargetType = 'USER' | 'PARCEL';

export interface AuditLog {
  id: string;
  actorEmail: string | null;
  action: AuditLogAction;
  targetType: AuditLogTargetType;
  targetId: string;
  summary: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogQuery extends ListQuery {
  action?: AuditLogAction;
  targetType?: AuditLogTargetType;
  targetId?: string;
}

/** A row of the user's inbox, from `GET /notifications`. */
export interface StoredNotification {
  id: string;
  type: RealtimeNotification['type'];
  title: string;
  message: string;
  trackingId: string | null;
  status: ParcelStatus | null;
  readAt: string | null;
  createdAt: string;
}

/** A message from the public contact form, as an admin reads it. */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  trackingId: string | null;
  message: string;
  createdAt: string;
}

/** One earlier turn of a conversation with the assistant. */
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Pushed over Socket.IO by the API's realtime gateway. The `id` is the id of
 * the same notification in the user's inbox.
 */
export interface RealtimeNotification {
  id: string;
  type:
    | 'parcel.created'
    | 'parcel.status'
    | 'parcel.assigned'
    | 'parcel.unassigned'
    | 'parcel.blocked'
    | 'parcel.unblocked'
    | 'parcel.updated'
    | 'parcel.rescheduled';
  title: string;
  message: string;
  trackingId: string;
  status: ParcelStatus;
  createdAt: string;
}

/* ------------------------------------------------------------ Bulk booking */

export interface BulkBookingResult {
  created: number;
  failed: number;
  /** One per row, by CSV line (the header is line 1). */
  results: { line: number; trackingId?: string; error?: string }[];
}

/** The 400 body when rows fail validation: nothing was booked. */
export interface BulkBookingRowError {
  line: number;
  errors: string[];
}

/* ------------------------------------------------------------------ Ledger */

/**
 * MERCHANT: a sender. Positive balance = owed to them, negative = they owe.
 * COURIER: positive balance = cash they collected and have not handed in.
 */
export type LedgerAccountType = 'MERCHANT' | 'COURIER';

export type LedgerEntryType =
  | 'DELIVERY_FEE'
  | 'FEE_ADJUSTMENT'
  | 'FEE_REVERSAL'
  | 'COD_FEE_REVERSAL'
  | 'RETURN_FEE'
  | 'COD_CREDIT'
  | 'FEE_PAYMENT'
  | 'PAYOUT'
  | 'COD_COLLECTED'
  | 'COD_DEPOSIT';

export type PayoutMethod = 'BANK' | 'BKASH' | 'NAGAD' | 'CASH';

export interface LedgerEntry {
  id: string;
  type: LedgerEntryType;
  /** Signed BDT: positive adds to the balance. */
  amount: number;
  trackingId: string | null;
  note: string | null;
  reference: string | null;
  createdAt: string;
}

export interface LedgerStatement {
  accountType: LedgerAccountType;
  userId: string;
  name: string;
  balance: number;
  entries: Paginated<LedgerEntry>;
}

export interface LedgerBalance {
  userId: string;
  name: string;
  email: string;
  balance: number;
  entries: number;
}

/* ---------------------------------------------------------------- Payments */

export type PaymentState = 'INITIATED' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REVIEW';

export interface CheckoutSession {
  paymentId: string;
  tranId: string;
  amount: number;
  currency: string;
  /** Send the browser here; the gateway returns it to /payments/result. */
  gatewayUrl: string;
}

export interface Payment {
  id: string;
  provider: 'SSLCOMMERZ';
  tranId: string;
  amount: number;
  currency: string;
  status: PaymentState;
  cardType: string | null;
  bankTranId: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
}
