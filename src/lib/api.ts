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
  Parcel,
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
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.auth !== false) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? (options.body ? 'POST' : 'GET'),
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

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
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),

  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) =>
    request<AuthResponse>('/users/register', {
      method: 'POST',
      body: payload,
      auth: false,
    }),

  refreshToken: () =>
    request<{ accessToken: string }>('/auth/refresh-token', {
      method: 'POST',
      body: { refreshToken: getRefreshToken() },
      auth: false,
    }),

  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),

  getMe: () => request<User>('/users/me'),

  getAllUsers: () => request<User[]>('/users/all-users'),

  getUser: (id: string) => request<User>(`/users/${id}`),

  updateProfile: (payload: Partial<User>) =>
    request<User>('/users/update-profile', { method: 'PATCH', body: payload }),

  blockUser: (userId: string) =>
    request<User>(`/users/${userId}/block`, { method: 'PATCH' }),

  unblockUser: (userId: string) =>
    request<User>(`/users/${userId}/unblock`, { method: 'PATCH' }),

  getDashboard: () => request<DashboardStats>('/dashboard'),

  getParcel: (trackingId: string) =>
    request<Parcel>(`/parcels/${trackingId}`, { auth: false }),

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

  updateParcelStatus: (
    trackingId: string,
    status: string,
    note?: string,
  ) =>
    request<Parcel>(`/parcels/${trackingId}/status`, {
      method: 'PATCH',
      body: { status, note },
    }),

  cancelParcel: (trackingId: string) =>
    request<Parcel>(`/parcels/${trackingId}/cancel`, { method: 'PATCH' }),

  confirmParcel: (trackingId: string) =>
    request<Parcel>(`/parcels/${trackingId}/confirm`, { method: 'PATCH' }),

  blockParcel: (trackingId: string) =>
    request<Parcel>(`/parcels/${trackingId}/block`, { method: 'PATCH' }),

  askRag: (question: string, filter: string = 'parcel') =>
    request<{
      answer: string;
      sources: Array<{ type: string; source: string; page: number | null }>;
    }>('/rag/ask', {
      method: 'POST',
      body: { question, filter },
      auth: false,
    }),
};

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const { accessToken } = await api.refreshToken();
    const user = getStoredUser();
    const refresh = getRefreshToken();
    if (user && refresh) setAuth(accessToken, refresh, user);
    return accessToken;
  } catch {
    clearAuth();
    return null;
  }
}
