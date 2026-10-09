/**
 * Every icon the site uses, as one hidden SVG sprite. Render once in the root
 * layout, then draw an icon anywhere with <Icon name="box" />.
 */
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="i-box" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" /></symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></symbol>
        <symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.500C5 14.900 12 21 12 21Z" /><circle cx="12" cy="9.500" r="2.500" /></symbol>
        <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 5 6v5.500c0 4.300 2.900 7.800 7 9.500 4.100-1.700 7-5.200 7-9.500V6l-7-3Z" /><path d="m9 12 2.200 2.200L15 10.400" /></symbol>
        <symbol id="i-camera" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l1.500-2h7L17 8h3v11H4V8Z" /><circle cx="12" cy="13" r="3.200" /></symbol>
        <symbol id="i-truck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z" /><circle cx="6.500" cy="17.500" r="1.800" /><circle cx="17" cy="17.500" r="1.800" /></symbol>
        <symbol id="i-bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></symbol>
        <symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></symbol>
        <symbol id="i-repeat" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4" /></symbol>
        <symbol id="i-quote" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18v-5.500C4 8.900 6 6.400 9.500 6v2.300C7.800 8.800 7 10 7 11.500h3V18H4Zm10 0v-5.500c0-3.600 2-6.100 5.500-6.500v2.300c-1.700.5-2.500 1.700-2.500 3.200h3V18h-6Z" /></symbol>
        <symbol id="i-star" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.500 2.900 6.100 6.600.9-4.800 4.600 1.200 6.600L12 17.500l-5.900 3.200 1.200-6.600L2.500 9.500l6.600-.9L12 2.500Z" /></symbol>
        <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7.500 8 5.500 8-5.500" /></symbol>
        <symbol id="i-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4c5 0 9 3.400 9 7.700s-4 7.700-9 7.700c-1 0-2-.1-2.900-.4L4.500 21l1.100-3.700C4 15.900 3 13.900 3 11.700 3 7.400 7 4 12 4Z" /></symbol>
        <symbol id="i-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.500 9.300a2.600 2.600 0 0 1 5 .9c0 1.800-2.500 2.200-2.500 3.800M12 17h.01" /></symbol>
        <symbol id="i-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></symbol>
        <symbol id="s-x" viewBox="0 0 24 24" fill="currentColor"><path d="M17.500 3h3.200l-7 8 8.300 10h-6.500l-5-6.100L4.800 21H1.600l7.500-8.600L1.200 3h6.600l4.600 5.600L17.500 3Zm-1.100 16h1.800L7 4.900H5.100L16.400 19Z" /></symbol>
        <symbol id="s-in" viewBox="0 0 24 24" fill="currentColor"><path d="M4.500 3A1.500 1.500 0 0 0 3 4.500v15A1.500 1.500 0 0 0 4.500 21h15a1.500 1.500 0 0 0 1.500-1.500v-15A1.500 1.500 0 0 0 19.500 3h-15Zm3.300 4.300a1.400 1.400 0 1 1 0 2.800 1.400 1.400 0 0 1 0-2.800ZM6.600 11h2.400v7H6.600v-7Zm4 0h2.300v1c.4-.7 1.300-1.200 2.400-1.200 2 0 2.700 1.300 2.700 3.300V18h-2.400v-3.500c0-.9-.3-1.600-1.200-1.600-1 0-1.400.7-1.400 1.700V18h-2.400v-7Z" /></symbol>
        <symbol id="s-ig" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3.500" y="3.500" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.800" /><path d="M17 7h.01" /></symbol>
        <symbol id="s-fb" viewBox="0 0 24 24" fill="currentColor"><path d="M13.500 21v-7.500h2.600l.4-3h-3V8.600c0-.9.300-1.500 1.600-1.500h1.500V4.400c-.3 0-1.200-.1-2.200-.1-2.200 0-3.800 1.400-3.800 3.900v2.300H8v3h2.600V21h2.900Z" /></symbol>
        <symbol id="g-ring" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="12" cy="12" r="8" /></symbol>
        <symbol id="g-bars" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="4" rx="2" /><rect x="3" y="10" width="12" height="4" rx="2" /><rect x="3" y="16" width="18" height="4" rx="2" /></symbol>
        <symbol id="g-diamond" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 22 12 12 22 2 12Z" /></symbol>
        <symbol id="g-half" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 0 1 0 18V3Z" /><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" /></symbol>
        <symbol id="g-tri" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 22 20H2Z" /></symbol>
        <symbol id="g-dots" viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" /></symbol>
        <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.500 4.500" /></symbol>
        <symbol id="i-route" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="18" r="2.500" /><circle cx="18" cy="6" r="2.500" /><path d="M8.500 18H14a3.500 3.500 0 0 0 0-7h-4a3.500 3.500 0 0 1 0-7h5.500" /></symbol>
        <symbol id="i-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.500 11 8.500-7 8.500 7M6 9.500V20h12V9.500" /></symbol>
        <symbol id="i-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8.500" y="8.500" width="12" height="12" rx="2.500" /><path d="M15.500 5.500v-.5A1.500 1.500 0 0 0 14 3.500H5A1.500 1.500 0 0 0 3.500 5v9A1.500 1.500 0 0 0 5 15.500h.5" /></symbol>
        <symbol id="i-alert" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.500 2.500 20h19L12 3.500Z" /><path d="M12 10v4.500M12 17.200h.01" /></symbol>
        <symbol id="i-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="7" height="9" rx="2" /><rect x="13.5" y="3.5" width="7" height="5" rx="2" /><rect x="13.5" y="11.5" width="7" height="9" rx="2" /><rect x="3.5" y="15.5" width="7" height="5" rx="2" /></symbol>
        <symbol id="i-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 19.500c.6-3 3.200-4.500 6.500-4.500s5.900 1.500 6.500 4.500M16 4.800a3.500 3.500 0 0 1 0 6.400M18.500 15.300c1.600.6 2.700 1.900 3 4.200" /></symbol>
        <symbol id="i-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M21 20H3" /></symbol>
        <symbol id="i-bot" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="16" height="12" rx="4" /><path d="M12 8V4M9 14h.01M15 14h.01M2 13v3M22 13v3" /></symbol>
        <symbol id="i-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4.5 20.500c.8-3.600 3.800-5.500 7.500-5.500s6.700 1.900 7.500 5.500" /></symbol>
        <symbol id="i-logout" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" /></symbol>
        <symbol id="i-bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.500 2h-15L6 16ZM10 20.500a2.200 2.200 0 0 0 4 0" /></symbol>
        <symbol id="i-back" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></symbol>
        <symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></symbol>
        <symbol id="i-ban" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="8.500" /><path d="m6 6 12 12" /></symbol>
        <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h10" /></symbol>
        <symbol id="i-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10.5" width="16" height="10" rx="3" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></symbol>
        <symbol id="i-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></symbol>
        <symbol id="i-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16M9.9 5.8A8.700 8.700 0 0 1 12 5.5c6 0 9.500 6.500 9.500 6.500a15 15 0 0 1-2.900 3.600M6.200 7.700A15 15 0 0 0 2.500 12S6 18.500 12 18.500c1.300 0 2.500-.3 3.600-.8M9.900 9.900a3 3 0 0 0 4.200 4.200" /></symbol>
        <symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2.500" width="10" height="19" rx="2.500" /><path d="M11 18h2" /></symbol>
        <symbol id="i-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.500h.01" /></symbol>
      </defs>
    </svg>
  );
}

export function Icon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} aria-hidden="true">
      <use href={`#${name}`} />
    </svg>
  );
}
