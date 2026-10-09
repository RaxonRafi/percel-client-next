import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ChatWidget } from '@/components/chat-widget';
import { IconSprite } from '@/components/icon-sprite';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Parcel Payout — Effortless delivery for a faster tomorrow',
  description:
    'Book pickups, follow every scan live, and get proof on every drop-off.',
};

/**
 * Runs before first paint. Entrance animations start from a hidden state, and
 * that state is only applied when this class is present — so with reduced
 * motion on (or scripts off) every page simply renders in its final state.
 */
const MOTION_GATE = `if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-motion')`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The gate script adds a class to <html> before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_GATE }} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <IconSprite />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
