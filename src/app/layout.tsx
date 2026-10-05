import type { Metadata } from 'next';
import { DM_Sans, Poppins } from 'next/font/google';
import './globals.css';
import './swiftparcel.css';
import { ChatWidget } from '@/components/chat-widget';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Parcel Payout — Claims Platform',
  description: 'Deliver faster, track smarter',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${poppins.variable} antialiased`}>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
