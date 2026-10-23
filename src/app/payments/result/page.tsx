'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { Icon } from '@/components/icon-sprite';

/**
 * Where SSLCommerz sends the payer's browser back to. The API has already
 * checked the payment with the gateway before redirecting here, so `status`
 * reports what the server decided — this page only says so.
 */
const OUTCOMES: Record<string, { icon: string; title: string; text: string }> = {
  paid: {
    icon: 'i-check',
    title: 'Payment received',
    text: 'The delivery fee is paid. The parcel will be collected as booked.',
  },
  review: {
    icon: 'i-info',
    title: 'Payment under review',
    text: 'The payment went through but the gateway flagged it for a check. The parcel stays unpaid until that is cleared — no need to pay again.',
  },
  cancelled: {
    icon: 'i-info',
    title: 'Payment cancelled',
    text: 'Nothing was charged. You can pay from your shipments whenever you are ready.',
  },
  failed: {
    icon: 'i-alert',
    title: 'Payment did not go through',
    text: 'Nothing was charged, or the payment could not be confirmed. Try again from your shipments.',
  },
};

function ResultContent() {
  const params = useSearchParams();
  const outcome = OUTCOMES[params.get('status') ?? ''] ?? OUTCOMES.failed;
  const trackingId = params.get('trackingId');

  return (
    <div className="auth-done" role="status">
      <i><Icon name={outcome.icon} size={34} /></i>
      <h2>{outcome.title}</h2>
      <p>
        {outcome.text}
        {trackingId && (
          <>
            {' '}Parcel <b>{trackingId}</b>.
          </>
        )}
      </p>
      <Link className="btn dark" href="/dashboard/parcels">Back to shipments</Link>
      {trackingId && (
        <Link className="btn line" href={`/track/${encodeURIComponent(trackingId)}`} style={{ marginTop: 10 }}>
          Track the parcel
        </Link>
      )}
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <AuthShell switchPrompt="Need your dashboard?" switchHref="/dashboard" switchLabel="Open it">
      <Suspense fallback={<p>Loading…</p>}>
        <ResultContent />
      </Suspense>
    </AuthShell>
  );
}
