import React from 'react';

export function TrustSection() {
  const partners = [
    {
      name: 'Stripe',
      logo: (
        <svg className="h-6 opacity-45 hover:opacity-90 transition-opacity" viewBox="0 0 60 25" fill="currentColor">
          <path d="M54.2 13.7c0-2.8-1.5-4.2-4-4.2-2.7 0-4.3 1.8-4.3 4.6 0 3 1.9 4.3 4.5 4.3 1.1 0 2.2-.2 3.1-.7l.3-1.6c-.9.4-1.8.6-2.7.6-1.6 0-2.5-.7-2.6-2h7.7zm-5.1-2.2c0-1 .7-1.5 1.5-1.5.8 0 1.4.5 1.4 1.5H49.1zm-8.8 6.7c1 0 1.8-.4 2.1-.8l.1.6h2.2V9.7h-2.3v1c-.3-.4-1.1-.9-2.1-.9-2.3 0-4.2 2-4.2 4.6-.1 2.6 1.9 4.6 4.2 4.6zm.5-7.3c1.3 0 2.1 1.1 2.1 2.6 0 1.5-.8 2.6-2.1 2.6-1.3 0-2.1-1.1-2.1-2.6.1-1.5.9-2.6 2.1-2.6zm-11 5.3V9.7h-2.3v8.5h2.3zm-1.1-10.4c.8 0 1.5-.7 1.5-1.5S29.9 3 29.1 3s-1.5.7-1.5 1.5c.1.8.7 1.5 1.6 1.5zm-5.1 10.4V12c0-1.8-1.2-2.5-2.6-2.5-1.2 0-2 .6-2.3 1.1v-1h-2.3v8.5H18V13c0-1 .5-1.5 1.2-1.5.7 0 1.1.4 1.1 1.2v5.5h2.3zm-12.7.1c0 1.2 1 1.8 2.8 2.2 2 .5 2.6.9 2.6 1.8 0 .8-.8 1.2-2.1 1.2-1.5 0-3.1-.6-4.2-1.3L2 23c1.4.8 3.5 1.3 5.4 1.3 3.9 0 6.5-1.9 6.5-4.8 0-2.8-1.9-3.8-4.5-4.4-1.8-.4-2.4-.7-2.4-1.4 0-.6.6-1 1.7-1 1.3 0 2.7.4 3.7 1l.9-1.9c-1-.6-2.6-1.1-4.2-1.1-3.6 0-6.1 1.8-6.1 4.5z"/>
        </svg>
      )
    },
    {
      name: 'Shopify',
      logo: (
        <svg className="h-6 opacity-45 hover:opacity-90 transition-opacity" viewBox="0 0 100 28" fill="currentColor">
          <path d="M14.7 4.2c-.3-.8-.9-1.3-1.6-1.5L5.4 1c-.5-.1-1 .1-1.2.6-.2.4-.1 1 .2 1.3L6 4.7C4.1 6 2.4 8 2.4 10.9v13c0 1.7 1.4 3.1 3.1 3.1h15.9c1.7 0 3.1-1.4 3.1-3.1v-13c0-3.5-2.4-5.8-5.3-6.5l-2.4-4.8c-.3-.8-.9-1.3-1.6-1.5L10.5.1c-.5-.1-1 .1-1.2.6-.2.4-.1 1 .2 1.3l1.9 2.8c-1.8 1.3-3.5 3.3-3.5 6.2v13c0 1.7 1.4 3.1 3.1 3.1h15.9c1.7 0 3.1-1.4 3.1-3.1v-13c0-3.5-2.4-5.8-5.3-6.5l-2.4-4.8z" opacity="0" />
          <text x="32" y="20" fontSize="16" fontWeight="bold" letterSpacing="-0.5">Shopify</text>
          <rect x="10" y="6" width="12" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      )
    },
    {
      name: 'Vercel',
      logo: (
        <svg className="h-5 opacity-45 hover:opacity-90 transition-opacity" viewBox="0 0 116 26" fill="currentColor">
          <path d="M13.75 2L27.5 25.83H0L13.75 2z" />
          <text x="38" y="20" fontSize="15" fontWeight="bold" letterSpacing="0.5">VERCEL</text>
        </svg>
      )
    },
    {
      name: 'DHL Logistics',
      logo: (
        <svg className="h-4 opacity-45 hover:opacity-90 transition-opacity" viewBox="0 0 120 20" fill="currentColor">
          <text x="0" y="16" fontSize="18" fontWeight="900" fontStyle="italic" letterSpacing="-1">DHL EXPRESS</text>
        </svg>
      )
    },
    {
      name: 'Flexport',
      logo: (
        <svg className="h-5 opacity-45 hover:opacity-90 transition-opacity" viewBox="0 0 110 24" fill="currentColor">
          <text x="0" y="18" fontSize="16" fontWeight="bold" letterSpacing="-0.5">flexport</text>
        </svg>
      )
    },
    {
      name: 'Ramp',
      logo: (
        <svg className="h-5 opacity-45 hover:opacity-90 transition-opacity" viewBox="0 0 80 22" fill="currentColor">
          <text x="0" y="17" fontSize="17" fontWeight="bold" letterSpacing="-0.8">RAMP</text>
        </svg>
      )
    },
    {
      name: 'Mercury',
      logo: (
        <svg className="h-5 opacity-45 hover:opacity-90 transition-opacity" viewBox="0 0 110 24" fill="currentColor">
          <text x="0" y="18" fontSize="16" fontWeight="semibold" letterSpacing="1">MERCURY</text>
        </svg>
      )
    },
    {
      name: 'Linear',
      logo: (
        <svg className="h-5 opacity-45 hover:opacity-90 transition-opacity" viewBox="0 0 90 22" fill="currentColor">
          <circle cx="10" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="10" cy="11" r="3" fill="currentColor" />
          <text x="25" y="17" fontSize="15" fontWeight="semibold" letterSpacing="-0.2">Linear</text>
        </svg>
      )
    }
  ];

  return (
    <section className="border-y border-surface-3 bg-white/35 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          Trusted by modern logistics teams & commerce brands
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-16 lg:gap-x-20">
          {partners.map((partner, index) => (
            <div key={index} className="flex items-center justify-center text-ink-3 hover:text-ink transition-colors">
              {partner.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
