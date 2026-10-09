import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import '@/styles/track.css';
import { SiteFooter } from '@/components/site-footer';
import { TrackView } from './track-view';

export const metadata: Metadata = {
  title: 'Track a parcel — Parcel Payout',
  description: 'Enter a tracking ID to see where your parcel is right now.',
};

/** The search screen. A result lives at /track/[id], which is cached with ISR. */
export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  // `/track?id=…` is the old link shape (emails, the footer form) — send it on.
  const { id } = await searchParams;
  if (id?.trim()) redirect(`/track/${encodeURIComponent(id.trim())}`);

  return (
    <div className="shell pg-track">
      <TrackView />
      <SiteFooter />
    </div>
  );
}
