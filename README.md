# SwiftParcel Client (Next.js)

Frontend for the Percel Nest API — landing page, public tracking, auth, and a
role-aware dashboard for senders, receivers, couriers and admins.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- shadcn-style UI components (Radix + CVA)
- Lucide and Tabler icons, Motion for animation
- Socket.IO client for live notifications

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
| `NEXT_PUBLIC_SOCKET_URL` | Optional. Socket.IO origin, when it differs from the API's |

**Local development:**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

**After deployment** (change only this value):

```env
NEXT_PUBLIC_API_BASE_URL=https://parcel-nest.vercel.app/api
```

The API's own `FRONTEND_URL` must point at this client: emailed links and the
online-payment redirect land here.

## Run

1. Start the Nest API: `npm run start:dev` in `percel-nest` (after
   `npm run migration:run`)
2. Start the client on port `3001`:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Pages

| Route | Who | Description |
|-------|-----|-------------|
| `/` | Everyone | Landing page |
| `/track`, `/track/[id]` | Everyone | Public tracking: progress, estimated delivery, failed attempts |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` | Everyone | Account flows |
| `/payments/result` | Everyone | Where SSLCommerz returns the browser after a payment |
| `/dashboard` | Signed in | Overview, role-aware |
| `/dashboard/parcels` | Signed in | Shipments: sent, incoming and history, with the actions below |
| `/dashboard/parcels/new` | Sender, admin | Book one parcel, priced live |
| `/dashboard/parcels/bulk` | Sender, admin | Book up to 500 parcels from a CSV |
| `/dashboard/deliveries` | Courier | Active queue, delivery proof, failed attempts |
| `/dashboard/payments` | Sender, courier, admin | Balance and statement; admins record payouts and hand-ins |
| `/dashboard/users`, `/dashboard/couriers` | Admin | Accounts and courier approvals |
| `/dashboard/analytics`, `/dashboard/audit`, `/dashboard/knowledge` | Admin | Trends, audit trail, assistant index |
| `/dashboard/profile` | Signed in | Profile, sessions, password |

## The delivery flow, by role

**Sender**
- Books with a pickup and delivery *area* (inside Dhaka, suburbs, outside
  Dhaka), standard or express (Dhaka routes only) and an optional pickup slot.
  The fee and its breakdown update as the form changes, from the API's quote.
- Edits a booking until a courier collects it; a change that moves the price
  shows the new fee.
- Downloads the shipping label (4×6 PDF with a QR code) and the invoice.
- Pays a prepaid fee online — the browser goes to SSLCommerz and comes back to
  `/payments/result`. A cash-on-delivery fee comes out of the cash instead.
- Uploads a CSV of orders. The template is on the page; a file with a bad row
  books nothing and lists the problems by line.
- Sees on **Payments** what they are owed: cash collected for them, less fees.

**Receiver**
- Gets a six-digit delivery code by email when the parcel goes out, and can
  ask for a new one from **Shipments**.
- After a failed attempt, picks the day for the next one.

**Courier**
- Completes a delivery with photo links, the cash collected and the
  receiver's code.
- Records a failed attempt with a reason and an optional new day; then sends
  the parcel out again or, after three failures, back to the sender.
- Prints the label, and sees on **Payments** the cash they hold.

**Admin**
- Everything above, plus recording a failed attempt from **Manage**.
- On **Payments**, every merchant's and courier's balance: records a payout to
  a merchant (bKash, Nagad, bank, cash) or cash a courier handed in, and opens
  any statement.

## Design reference

Original static HTML: `design-reference/swiftparcel.html`
