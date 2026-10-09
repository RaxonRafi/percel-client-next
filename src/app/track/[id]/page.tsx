import type { Metadata } from 'next';
import '@/styles/track.css';
import { API_BASE_URL } from '@/lib/config';
import type { PublicParcel } from '@/lib/types';
import { SiteFooter } from '@/components/site-footer';
import { TrackView } from '../track-view';

/**
 * Incremental Static Regeneration. Tracking data is public and identical for
 * every visitor, so each parcel's page is rendered once on the server, cached,
 * and regenerated in the background at most every 30 seconds. A visitor always
 * gets instant HTML; the browser then keeps it current (see TrackView).
 */
export const revalidate = 30;

/** Nothing is prebuilt; each ID is rendered on first request and cached from then on. */
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ id: string }> };

async function getParcel(trackingId: string): Promise<PublicParcel | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/parcels/${encodeURIComponent(trackingId)}`, {
      next: { revalidate },
    });
    // An unknown ID (or an API outage) renders the "not found" state; it is
    // retried on the next regeneration rather than cached for good.
    return res.ok ? ((await res.json()) as PublicParcel) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trackingId = decodeURIComponent((await params).id);
  return {
    title: `${trackingId} — Track a parcel — Parcel Payout`,
    description: `Live status and journey for parcel ${trackingId}.`,
    // Tracking pages are per-parcel and not meant for search results.
    robots: { index: false },
  };
}

export default async function TrackResultPage({ params }: Props) {
  const trackingId = decodeURIComponent((await params).id);
  const parcel = await getParcel(trackingId);

  return (
    <div className="shell pg-track">
      <TrackView trackingId={trackingId} initialParcel={parcel} notFound={!parcel} />
      <SiteFooter />
    </div>
  );
}
