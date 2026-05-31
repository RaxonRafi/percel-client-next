'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-4 z-50 mx-auto w-[92%] max-w-7xl transition-all duration-300 ${
          scrolled
            ? 'glass-panel rounded-full py-3 shadow-lg'
            : 'bg-transparent py-5 border-b border-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-8">
          {/* Logo */}
          <Link href="/" className="font-display flex items-center gap-2 text-xl font-extrabold text-ink group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-md shadow-accent/20 transition-transform duration-300 group-hover:scale-105">
              <Package className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-white border-2 border-accent" />
            </div>
            <span className="tracking-tight">
              Swift<span className="text-accent">Parcel</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link href="#features" className="text-sm font-medium text-ink-2 transition-colors hover:text-accent">
              Features
            </Link>
            <Link href="#showcase" className="text-sm font-medium text-ink-2 transition-colors hover:text-accent">
              Product Tour
            </Link>
            <Link href="#comparison" className="text-sm font-medium text-ink-2 transition-colors hover:text-accent">
              Why Us
            </Link>
            <Link href="/track" className="text-sm font-medium text-ink-2 transition-colors hover:text-accent">
              Tracking
            </Link>
          </div>

          {/* Desktop Call to Actions */}
          <div className="hidden items-center gap-4 lg:flex">
            <Link href="/login" className="text-sm font-medium text-ink-2 transition-colors hover:text-accent">
              Sign In
            </Link>
            <Button asChild size="sm" className="shadow-sm shadow-accent/10">
              <Link href="/register" className="flex items-center gap-1">
                Start Free Trial <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-3 bg-white text-ink-2 hover:bg-surface-2 lg:hidden transition-colors"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-ink/30 backdrop-blur-md lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-sm glass-panel-dark p-8 shadow-2xl lg:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-8 pt-16">
            <div className="flex flex-col gap-6">
              <Link
                href="#features"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-white/80 hover:text-accent transition-colors"
              >
                Features
              </Link>
              <Link
                href="#showcase"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-white/80 hover:text-accent transition-colors"
              >
                Product Tour
              </Link>
              <Link
                href="#comparison"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-white/80 hover:text-accent transition-colors"
              >
                Why Us
              </Link>
              <Link
                href="/track"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-white/80 hover:text-accent transition-colors"
              >
                Tracking
              </Link>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex flex-col gap-4">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-base font-medium text-white hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
              <Button asChild size="lg" className="w-full bg-accent hover:bg-[#c83a10] text-white">
                <Link href="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-1.5">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="text-xs text-white/40 text-center">
            © {new Date().getFullYear()} SwiftParcel Technologies.
          </div>
        </div>
      </div>
    </>
  );
}

