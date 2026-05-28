# SwiftParcel Client (Next.js)

Frontend for the Percel Nest API — landing page, dashboard, auth, and parcel management.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS v4
- shadcn-style UI components (Radix + CVA)
- Lucide icons

## Setup

```bash
cd percel-client
npm install
cp .env.example .env.local
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL **including** `/api` prefix |

**Local development:**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

**After deployment** (change only this value):

```env
NEXT_PUBLIC_API_BASE_URL=https://parcel-nest.vercel.app/api
```

## Run

1. Start the Nest API on port `3000`: `npm run start:dev` (from repo root)
2. Start the client on port `3001`:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page (from `design-reference/swiftparcel.html`) |
| `/login` | Sign in |
| `/register` | Register sender |
| `/track` | Public parcel tracking |
| `/dashboard` | Overview (role-aware) |
| `/dashboard/parcels` | Shipments CRUD |
| `/dashboard/users` | Admin user management |
| `/dashboard/analytics` | Admin stats |

## Design reference

Original static HTML: `design-reference/swiftparcel.html`
