import { API_BASE_URL } from './config';
import {
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setAuth,
  clearAuth,
} from './auth-storage';
import type {
  AuthResponse,
  DashboardStats,
  MessageResponse,
  Parcel,
  ParcelStatus,
  PublicParcel,
  RagAnswer,
  Role,
  User,
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

type RequestOptions = {
  method?: string;
  body?: unknown;
  /** false = never attach the bearer token (public routes) */
  auth?: boolean;
  /** internal: stops the 401 -> refresh -> retry loop from recursing */
  skipRefresh?: boolean;
  /** the response is plain text, not JSON */
  text?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const send = (token: string | null) => {
    const headers: Record<string, string> = {};
    if (!isFormData && options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetch(`${API_BASE_URL}${path}`, {
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
    const message =
      typeof data === 'object' && data && 'message' in data
        ? Array.isArray((data as { message: string[] }).message)
          ? (data as { message: string[] }).message.join(', ')
          : String((data as { message: string }).message)
        : res.statusText;
    throw new ApiError(message || 'Request failed', res.status);
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

  /** Stateless server-side — clearing the stored token is the client's job. */
  logout: () => request<MessageResponse>('/auth/logout', { method: 'POST' }),

  refreshToken: () =>
    request<{ accessToken: string }>('/auth/refresh-token', {
      method: 'POST',
      body: { refreshToken: getRefreshToken() },
      auth: false,
      skipRefresh: true,
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<MessageResponse>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
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

  getAllUsers: () => request<User[]>('/users/all-users'),

  getUser: (id: string) => request<User>(`/users/${id}`),

  blockUser: (userId: string) =>
    request<User>(`/users/${userId}/block`, { method: 'PATCH' }),

  unblockUser: (userId: string) =>
    request<User>(`/users/${userId}/unblock`, { method: 'PATCH' }),

  /* ---------------------------------------------------- Courier approvals */

  /** Applicants sitting at `PENDING_DELIVERY`, waiting on an admin. */
  getPendingCouriers: () => request<User[]>('/users/delivery/pending'),

  getCouriers: () => request<User[]>('/users/delivery'),

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

  getAllParcels: () => request<Parcel[]>('/parcels'),

  getMyParcels: () => request<Parcel[]>('/parcels/my-parcels'),

  getIncomingParcels: () => request<Parcel[]>('/parcels/incoming-parcels'),

  getDeliveryHistory: () => request<Parcel[]>('/parcels/delivery-history'),

  createParcel: (payload: {
    receiverId: string;
    receiverName: string;
    receiverPhone?: string;
    pickupAddress: string;
    deliveryAddress: string;
    description?: string;
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
  getAssignedParcels: () => request<Parcel[]>('/parcels/assigned-parcels'),

  getCompletedDeliveries: () => request<Parcel[]>('/parcels/completed-deliveries'),

  /* ----------------------------------------------------------- Dashboard */

  getDashboard: () => request<DashboardStats>('/dashboard'),

  /* ----------------------------------------------------------------- RAG */

  askRag: (question: string, filter = 'parcel') =>
    request<RagAnswer>('/rag/ask', {
      method: 'POST',
      body: { question, filter },
      auth: false,
    }),

  uploadRagPdf: (file: File, category?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (category) form.append('category', category);
    return request<{ message: string; filename: string; chunksIndexed: number }>(
      '/rag/pdf/upload',
      { method: 'POST', body: form, auth: false },
    );
  },

  deleteRagPdf: (source: string) =>
    request<MessageResponse>(`/rag/pdf/${encodeURIComponent(source)}`, {
      method: 'DELETE',
      auth: false,
    }),

  indexParcel: (parcelId: string) =>
    request<MessageResponse>('/rag/index/parcel', {
      method: 'POST',
      body: { parcelId },
      auth: false,
    }),

  indexAllParcels: () =>
    request<MessageResponse>('/rag/index/bulk', {
      method: 'POST',
      body: {},
      auth: false,
    }),

  removeIndexedParcel: (id: string) =>
    request<MessageResponse>(`/rag/index/parcel/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: false,
    }),

  /* -------------------------------------------------------------- System */

  /** `GET /api` — plain-text health probe. */
  health: () => request<string>('', { auth: false, text: true }),
};

/** Swaps the stored refresh token for a fresh access token. */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const { accessToken } = await api.refreshToken();
    if (!accessToken) return null;
    const user = getStoredUser();
    const refresh = getRefreshToken();
    if (user && refresh) setAuth(accessToken, refresh, user);
    return accessToken;
  } catch {
    clearAuth();
    return null;
  }
}

/** Clears local credentials even if the (stateless) server call fails. */
export async function logout(): Promise<void> {
  try {
    await api.logout();
  } catch {
    // The token is discarded locally either way.
  } finally {
    clearAuth();
  }
}
