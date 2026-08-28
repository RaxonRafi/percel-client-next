import { API_BASE_URL } from './config';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearAuth,
} from './auth-storage';
import type {
  AuthResponse,
  DashboardStats,
  ListQuery,
  MessageResponse,
  Paginated,
  Parcel,
  ParcelQuery,
  ParcelStatus,
  PublicParcel,
  RagAnswer,
  Role,
  User,
  UserQuery,
} from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type QueryValue = string | number | boolean | undefined;

type RequestOptions = {
  method?: string;
  body?: unknown;
  /** Appended as a query string; undefined entries are dropped. */
  query?: Record<string, QueryValue>;
  /** false = never attach the bearer token (public routes) */
  auth?: boolean;
  /** internal: stops the 401 -> refresh -> retry loop from recursing */
  skipRefresh?: boolean;
  /** the response is plain text, not JSON */
  text?: boolean;
};

/**
 * Unknown query params are rejected with a 400, exactly like unknown body
 * fields, so anything undefined has to be left off rather than sent empty.
 */
function toQueryString(query?: Record<string, QueryValue>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const send = (token: string | null) => {
    const headers: Record<string, string> = {};
    if (!isFormData && options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetch(`${API_BASE_URL}${path}${toQueryString(options.query)}`, {
      method: options.method ?? (options.body !== undefined ? 'POST' : 'GET'),
      headers,
      body: isFormData
        ? (options.body as FormData)
        : options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });
  };

  const useAuth = options.auth !== false;
  let res = await send(useAuth ? getAccessToken() : null);

  // An expired access token is recoverable: swap it for a fresh one and retry
  // once. Without this, any tab left open past the token TTL dies on a 401.
  if (res.status === 401 && useAuth && !options.skipRefresh && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) res = await send(refreshed);
  }

  if (options.text) {
    const body = await res.text();
    if (!res.ok) throw new ApiError(body || res.statusText, res.status);
    return body as unknown as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Validation failures arrive as an array of rules, one per broken field.
    const message =
      typeof data === 'object' && data && 'message' in data
        ? Array.isArray((data as { message: string[] }).message)
          ? (data as { message: string[] }).message.join(', ')
          : String((data as { message: string }).message)
        : res.statusText;
    const fallback =
      res.status === 429
        ? 'Too many requests — wait a moment and try again.'
        : 'Request failed';
    throw new ApiError(message || fallback, res.status);
  }

  return data as T;
}

export const api = {
  /* ---------------------------------------------------------------- Auth */

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),

  /**
   * Revokes one session when given its refresh token, or every session for the
   * user when the body is omitted entirely.
   */
  logout: (refreshToken?: string) =>
    request<MessageResponse>('/auth/logout', {
      method: 'POST',
      body: refreshToken ? { refreshToken } : undefined,
    }),

  /** Rotates: the token sent is revoked and a fresh pair comes back. */
  refreshToken: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>('/auth/refresh-token', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
      skipRefresh: true,
    }),

  /** Ends every session for the user, this one included. */
  changePassword: (currentPassword: string, newPassword: string) =>
    request<MessageResponse>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),

  /** Always reports success, so it cannot reveal who has an account. */
  forgotPassword: (email: string) =>
    request<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  /** The emailed token is single-use and expires after 30 minutes. */
  resetPassword: (token: string, newPassword: string) =>
    request<MessageResponse>('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
      auth: false,
    }),

  /** Flips `isVerified` using the token from the confirmation email. */
  verifyEmail: (token: string) =>
    request<MessageResponse>('/auth/verify-email', {
      method: 'POST',
      body: { token },
      auth: false,
    }),

  resendVerification: (email: string) =>
    request<MessageResponse>('/auth/resend-verification', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  /* --------------------------------------------------------------- Users */

  register: (payload: {
    name: string;
    email: string;
    password: string;
    /** `ADMIN` additionally requires an admin bearer token on the request. */
    role?: Role;
    phone?: string;
    address?: string;
  }) =>
    // Public route, but the bearer token rides along when one is stored: an
    // admin creating an ADMIN account is only authorised with it attached.
    request<AuthResponse>('/users/register', { method: 'POST', body: payload }),

  getMe: () => request<User>('/users/me'),

  updateProfile: (
    payload: Partial<
      Pick<User, 'name' | 'phone' | 'address' | 'picture' | 'nidNumber'>
    >,
  ) => request<User>('/users/update-profile', { method: 'PATCH', body: payload }),

  getAllUsers: (query: UserQuery = {}) =>
    request<Paginated<User>>('/users/all-users', { query: { ...query } }),

  getUser: (id: string) => request<User>(`/users/${id}`),

  blockUser: (userId: string) =>
    request<User>(`/users/${userId}/block`, { method: 'PATCH' }),

  unblockUser: (userId: string) =>
    request<User>(`/users/${userId}/unblock`, { method: 'PATCH' }),

  /* ---------------------------------------------------- Courier approvals */

  /** Applicants sitting at `PENDING_DELIVERY`, waiting on an admin. */
  getPendingCouriers: (query: ListQuery = {}) =>
    request<Paginated<User>>('/users/delivery/pending', { query: { ...query } }),

  getCouriers: (query: ListQuery = {}) =>
    request<Paginated<User>>('/users/delivery', { query: { ...query } }),

  approveCourier: (userId: string) =>
    request<User>(`/users/${userId}/delivery/approve`, { method: 'PATCH' }),

  /** Rejection drops the applicant to SENDER so they can apply again. */
  rejectCourier: (userId: string) =>
    request<User>(`/users/${userId}/delivery/reject`, { method: 'PATCH' }),

  /* ------------------------------------------------------------- Parcels */

  /**
   * Public tracking route — takes the tracking code, not the uuid, and returns
   * the trimmed `PublicParcel`, never a full `Parcel`.
   */
  getParcel: (trackingId: string) =>
    request<PublicParcel>(`/parcels/${encodeURIComponent(trackingId)}`, {
      auth: false,
    }),

  getAllParcels: (query: ParcelQuery = {}) =>
    request<Paginated<Parcel>>('/parcels', { query: { ...query } }),

  getMyParcels: (query: ParcelQuery = {}) =>
    request<Paginated<Parcel>>('/parcels/my-parcels', { query: { ...query } }),

  getIncomingParcels: (query: ParcelQuery = {}) =>
    request<Paginated<Parcel>>('/parcels/incoming-parcels', { query: { ...query } }),

  getDeliveryHistory: (query: ParcelQuery = {}) =>
    request<Paginated<Parcel>>('/parcels/delivery-history', { query: { ...query } }),

  createParcel: (payload: {
    receiverId: string;
    receiverName: string;
    receiverPhone?: string;
    pickupAddress: string;
    deliveryAddress: string;
    description?: string;
    /** Drives the fee. The client never sends a price. */
    weightKg: number;
    /** Cash to collect on delivery; omit or 0 for prepaid. */
    codAmount?: number;
  }) => request<Parcel>('/parcels', { method: 'POST', body: payload }),

  updateParcelStatus: (trackingId: string, status: ParcelStatus, note?: string) =>
    request<Parcel>(`/parcels/${encodeURIComponent(trackingId)}/status`, {
      method: 'PATCH',
      body: note ? { status, note } : { status },
    }),

  cancelParcel: (trackingId: string) =>
    request<Parcel>(`/parcels/${encodeURIComponent(trackingId)}/cancel`, {
      method: 'PATCH',
    }),

  confirmParcel: (trackingId: string) =>
    request<Parcel>(`/parcels/${encodeURIComponent(trackingId)}/confirm`, {
      method: 'PATCH',
    }),

  blockParcel: (trackingId: string) =>
    request<Parcel>(`/parcels/${encodeURIComponent(trackingId)}/block`, {
      method: 'PATCH',
    }),

  /* ------------------------------------------------------------ Couriers */

  /** Needs an approved, active courier; refused on blocked/delivered/cancelled. */
  assignParcel: (trackingId: string, deliveryPersonnelId: string) =>
    request<Parcel>(`/parcels/${encodeURIComponent(trackingId)}/assign`, {
      method: 'PATCH',
      body: { deliveryPersonnelId },
    }),

  unassignParcel: (trackingId: string) =>
    request<Parcel>(`/parcels/${encodeURIComponent(trackingId)}/unassign`, {
      method: 'PATCH',
    }),

  /** The signed-in courier's active queue. */
  getAssignedParcels: (query: ParcelQuery = {}) =>
    request<Paginated<Parcel>>('/parcels/assigned-parcels', { query: { ...query } }),

  getCompletedDeliveries: (query: ParcelQuery = {}) =>
    request<Paginated<Parcel>>('/parcels/completed-deliveries', { query: { ...query } }),

  /**
   * Completes a delivery: moves the parcel to DELIVERED and stamps
   * `deliveredAt`. A parcel with `codAmount > 0` is refused unless
   * `codCollected` is true. Couriers may only submit for their own parcels.
   */
  submitDeliveryProof: (
    trackingId: string,
    payload: {
      /** 1–5 image URLs. */
      images: string[];
      receivedBy?: string;
      note?: string;
      codCollected: boolean;
    },
  ) =>
    request<Parcel>(`/parcels/${encodeURIComponent(trackingId)}/delivery-proof`, {
      method: 'PATCH',
      body: payload,
    }),

  /* ----------------------------------------------------------- Dashboard */

  getDashboard: () => request<DashboardStats>('/dashboard'),

  /* ----------------------------------------------------------------- RAG */

  /** Needs any signed-in user — each call bills an embedding and a completion. */
  askRag: (question: string, filter = 'parcel') =>
    request<RagAnswer>('/rag/ask', {
      method: 'POST',
      body: { question, filter },
    }),

  // Everything below mutates the vector store and is admin-only.

  uploadRagPdf: (file: File, category?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (category) form.append('category', category);
    return request<{ message: string; filename: string; chunksIndexed: number }>(
      '/rag/pdf/upload',
      { method: 'POST', body: form },
    );
  },

  deleteRagPdf: (source: string) =>
    request<MessageResponse>(`/rag/pdf/${encodeURIComponent(source)}`, {
      method: 'DELETE',
    }),

  indexParcel: (parcelId: string) =>
    request<MessageResponse>('/rag/index/parcel', {
      method: 'POST',
      body: { parcelId },
    }),

  indexAllParcels: () =>
    request<MessageResponse>('/rag/index/bulk', { method: 'POST', body: {} }),

  removeIndexedParcel: (id: string) =>
    request<MessageResponse>(`/rag/index/parcel/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  /* -------------------------------------------------------------- System */

  /** `GET /api` — plain-text health probe. */
  health: () => request<string>('', { auth: false, text: true }),
};

/**
 * Refresh is single-flight. Rotation revokes the token as it is spent, so two
 * concurrent 401s must not each try to redeem it — the loser would send an
 * already-revoked token and sign the user out.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const stored = getRefreshToken();
  if (!stored) return null;
  try {
    const rotated = await api.refreshToken(stored);
    if (!rotated?.accessToken) return null;
    // Persist both halves: the old refresh token is dead from here on.
    setTokens(rotated.accessToken, rotated.refreshToken ?? stored);
    return rotated.accessToken;
  } catch {
    clearAuth();
    return null;
  }
}

/** Swaps the stored refresh token for a freshly rotated pair. */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/**
 * Ends this session server-side and locally. Pass `everywhere` to revoke every
 * session for the user instead of just this one.
 */
export async function logout({ everywhere = false } = {}): Promise<void> {
  const refresh = getRefreshToken();
  try {
    await api.logout(everywhere ? undefined : (refresh ?? undefined));
  } catch {
    // Local credentials are discarded either way.
  } finally {
    clearAuth();
  }
}
