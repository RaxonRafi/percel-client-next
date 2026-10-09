import type { Metadata } from 'next';
import { Suspense } from 'react';
import '@/styles/track.css';
import { SiteFooter } from '@/components/site-footer';
import { TrackView } from './track-view';

export const metadata: Metadata = {
  title: 'Track a parcel — Parcel Payout',
  description: 'Enter a tracking ID to see where your parcel is right now.',
};

export default function TrackPage() {
  return (
    <div className="shell pg-track">
      {/* useSearchParams needs a Suspense boundary to prerender */}
      <Suspense fallback={null}>
        <TrackView />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
