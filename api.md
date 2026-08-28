# API Endpoints

All routes are prefixed with `/api` (set in `src/main.ts`).
Interactive docs: `/api/docs` — Swagger UI, with an Authorize button for the bearer token.

**Role column**

| Value | Meaning |
| --- | --- |
| `Public` | No token needed |
| `Any` | Any signed-in user, role irrelevant |
| `ADMIN` / `SENDER` / `RECEIVER` | Token must carry that role — anything else gets `403` |

Protected calls need `Authorization: Bearer <accessToken>`, where `accessToken`
comes from `POST /api/auth/login`.

Response shapes below were captured from live responses, not from the type
definitions — where the two disagree, this file follows what the API actually
sends.

---

## Shared shapes

Referenced throughout so the tables stay readable.

### `User`

Returned by every `/api/users` route and nested inside parcels. The password
hash is stripped **only** on `/api/users` routes — see the warning under Parcels.

```ts
type User = {
  id: string;                // uuid
  name: string;
  email: string;
  role: 'ADMIN' | 'SENDER' | 'RECEIVER' | 'DELIVERY_PERSONNEL' | 'PENDING_DELIVERY';
  phone: string | null;
  picture: string | null;
  address: string | null;
  isDeleted: boolean;
  isActive: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  isVerified: boolean;
  nidNumber: string | null;
  nidImage: string[];
  auths: { id: string; provider: 'google' | 'credentials'; providerId: string }[];
  createdAt: string;         // ISO date
  updatedAt: string;
};
```

### `Parcel`

```ts
type Parcel = {
  id: string;                // uuid
  trackingId: string;        // the public code, e.g. "TRK-20260828-A1B2C3"
  senderName: string;
  receiverName: string;
  senderPhone: string | null;
  receiverPhone: string | null;
  pickupAddress: string;
  deliveryAddress: string;
  description: string | null;
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  isBlocked: boolean;
  sender: User;
  receiver: User;
  statusLogs: {
    id: string;
    status: ParcelStatus;
    note: string | null;
    changedBy: User | null;  // absent on two routes — see note below
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
};
```

### `AuthResponse`

```ts
type AuthResponse = { user: User; accessToken: string; refreshToken: string };
```

Both tokens are JWTs carrying `{ userId, email, role }`.

---

## Auth

| Role | Method | Endpoint | Response |
| --- | --- | --- | --- |
| Public | `POST` | `/api/auth/login` | `AuthResponse` |
| Public | `POST` | `/api/auth/refresh-token` | `{ accessToken: string }` |
| Any | `POST` | `/api/auth/logout` | `{ message: "Logged out successfully" }` |
| Any | `POST` | `/api/auth/change-password` | `{ message: "Password changed successfully" }` |

`logout` is stateless — it returns a message and nothing else. Clearing the
stored token is the frontend's job; the old token stays valid until it expires.

## Users

| Role | Method | Endpoint | Response |
| --- | --- | --- | --- |
| Public | `POST` | `/api/users/register` | `AuthResponse` |
| Any | `GET` | `/api/users/me` | `User` |
| Any | `PATCH` | `/api/users/update-profile` | `User` |
| ADMIN | `GET` | `/api/users/all-users` | `User[]` — newest first |
| ADMIN | `GET` | `/api/users/:id` | `User` |
| ADMIN | `PATCH` | `/api/users/:userId/block` | `User` — `isActive: "BLOCKED"` |
| ADMIN | `PATCH` | `/api/users/:userId/unblock` | `User` — `isActive: "ACTIVE"` |

`register` is public, but asking for `role: "ADMIN"` in the body additionally
requires an existing admin's bearer token on the request. Any other role sent
without a token is ignored and the account is created as `SENDER`.

## Parcels

`:trackingId` is the public tracking code, not the uuid.

| Role | Method | Endpoint | Response |
| --- | --- | --- | --- |
| Public | `GET` | `/api/parcels/:trackingId` | `Parcel` |
| SENDER, ADMIN | `POST` | `/api/parcels` | `Parcel` |
| SENDER | `GET` | `/api/parcels/my-parcels` | `Parcel[]` — newest first |
| SENDER | `PATCH` | `/api/parcels/:trackingId/cancel` | `Parcel` |
| RECEIVER | `GET` | `/api/parcels/incoming-parcels` | `Parcel[]` — newest first |
| RECEIVER | `GET` | `/api/parcels/delivery-history` | `Parcel[]` — by `updatedAt` desc |
| RECEIVER | `PATCH` | `/api/parcels/:trackingId/confirm` | `Parcel` |
| ADMIN | `GET` | `/api/parcels` | `Parcel[]` — newest first |
| ADMIN | `PATCH` | `/api/parcels/:trackingId/status` | `Parcel` |
| ADMIN | `PATCH` | `/api/parcels/:trackingId/block` | `Parcel` |

> **⚠ These responses currently include password hashes.** `sender` and
> `receiver` are loaded as full database rows and never passed through the
> sanitizer, so `sender.password` and `receiver.password` arrive as bcrypt
> hashes on every parcel response — including the **public**
> `GET /api/parcels/:trackingId`. Do not render or store those fields, and treat
> this as a bug to fix server-side rather than something to work around in the
> client.

> `statusLogs[].changedBy` is populated on `my-parcels`, `GET /api/parcels`, and
> the single-parcel routes, but **not** on `incoming-parcels` or
> `delivery-history` — those two omit the relation, so the field is `undefined`.
> Guard for it before reading `changedBy.name`.

## Dashboard

| Role | Method | Endpoint | Response |
| --- | --- | --- | --- |
| ADMIN | `GET` | `/api/dashboard` | see below |

```ts
{
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalParcels: number;
  blockedParcels: number;
  parcelsByStatus: Record<ParcelStatus, number>;  // every status key present, zero-filled
}
```

## RAG

| Role | Method | Endpoint | Response |
| --- | --- | --- | --- |
| Public | `POST` | `/api/rag/ask` | `{ answer: string; sources: { type, source, page }[] }` |
| Public | `POST` | `/api/rag/pdf/upload` | `{ message, filename, chunksIndexed }` |
| Public | `DELETE` | `/api/rag/pdf/:source` | `{ message: string }` |
| Public | `POST` | `/api/rag/index/parcel` | `{ message: string }` |
| Public | `POST` | `/api/rag/index/bulk` | `{ message: string }` |
| Public | `DELETE` | `/api/rag/index/parcel/:id` | `{ message: string }` |

`pdf/upload` is `multipart/form-data` with a `file` field (PDF only, 10 MB max)
and an optional `category`. `sources[].page` is `null` for non-PDF sources.

> These carry no guards at all today — including the two `DELETE` routes that
> drop documents from the vector store. Worth locking down before the frontend
> ships.

## System

| Role | Method | Endpoint | Response |
| --- | --- | --- | --- |
| Public | `GET` | `/api` | `"Hello World!"` (plain text) |
| Cron | `GET` | `/api/keep-alive` | `{ ok: true, at: string }` |

`keep-alive` is for the Vercel cron and expects
`Authorization: Bearer <CRON_SECRET>` — not a user JWT. Not for frontend use.

---

## Errors

Standard Nest error envelope on every failure:

```ts
{ statusCode: number; message: string | string[]; error?: string }
```

| Code | When |
| --- | --- |
| `400` | Bad input, illegal parcel status transition, blocked/inactive account at login |
| `401` | Missing, malformed, or expired token; wrong password |
| `403` | Valid token, but the role is not allowed on that route |
| `404` | No such user or tracking id |
| `409` | Email already registered |

There is no request validation layer yet, so malformed bodies generally surface
as `500`s from the database rather than a clean `400`.
