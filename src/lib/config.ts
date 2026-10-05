export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

/**
 * Socket.IO lives at the API's origin, outside the `/api` prefix. Override when
 * the sockets are served from a different host than the REST API.
 */
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? new URL(API_BASE_URL).origin;
