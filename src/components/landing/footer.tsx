import React from 'react';
import Link from 'next/link';
import { Package, Twitter, Github, Linkedin, ArrowUpRight } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  badge?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  const columns: FooterColumn[] = [
    {
      title: 'Product',
      links: [
        { label: 'AI Copilot', href: '#features' },
        { label: 'Public Tracker', href: '/track' },
        { label: 'Fulfillment Stages', href: '#features' },
        { label: 'Pricing Plan', href: '/register' },
        { label: 'Changelog', href: '#' }
      ]
    },
    {
      title: 'Solutions',
      links: [
        { label: 'E-commerce Delivery', href: '#showcase' },
        { label: 'Local Courier Services', href: '#showcase' },
        { label: 'Enterprise Fleet', href: '#showcase' },
        { label: 'COD Bookkeeping', href: '#showcase' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'API Documentation', href: '#', external: true },
        { label: 'System Status', href: '#', external: true },
        { label: 'Help Center', href: '#' },
        { label: 'Developer SDKs', href: '#' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Careers', href: '#', badge: 'Hiring' },
        { label: 'Press Kit', href: '#' },
        { label: 'Contact Sales', href: '/login' }
      ]
    }
  ];

  return (
    <footer className="bg-[#FAFAF8] border-t border-surface-3 pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 pb-16">
          
          {/* Logo & Description */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <Link href="/" className="font-display flex items-center gap-2 text-xl font-extrabold text-ink group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-md shadow-accent/20">
                <Package className="h-5 w-5" />
              </div>
              <span>Swift<span className="text-accent">Parcel</span></span>
            </Link>
            <p className="text-xs text-ink-3 max-w-xs leading-relaxed">
              SwiftParcel is a secure delivery tracking platform helping senders, receivers, and delivery agents manage shipments, log status updates, and query policy rules with AI.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="h-8 w-8 rounded-full border border-surface-3 bg-white flex items-center justify-center text-ink-3 hover:text-accent hover:border-accent transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-8 w-8 rounded-full border border-surface-3 bg-white flex items-center justify-center text-ink-3 hover:text-accent hover:border-accent transition-colors">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-8 w-8 rounded-full border border-surface-3 bg-white flex items-center justify-center text-ink-3 hover:text-accent hover:border-accent transition-colors">
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="text-left space-y-5">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-3.5">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      href={link.href}
                      className="text-xs text-ink-2 hover:text-accent transition-colors flex items-center gap-1"
                    >
                      {link.label}
                      {link.external && <ArrowUpRight className="h-3 w-3 opacity-55" />}
                      {link.badge && (
                        <span className="text-[9px] bg-accent/10 text-accent border border-accent/25 px-1.5 py-0.5 rounded font-bold uppercase">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom Panel */}
        <div className="border-t border-surface-3 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-left text-xs text-ink-3">
          <div>
            © {currentYear} SwiftParcel Technologies Ltd. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-accent transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-accent transition-colors">SLA Agreement</Link>
            <Link href="#" className="hover:text-accent transition-colors">Trust Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
