'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Package, CheckCircle2, Globe, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardMockup } from './dashboard-mockup';

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // range: -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // range: -0.5 to 0.5
      setMousePosition({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden px-6 pb-20 pt-[120px] md:px-12 gradient-mesh grid-pattern"
    >
      {/* Glow Effects */}
      <div 
        className="pointer-events-none absolute -right-[10%] -top-[10%] h-[600px] w-[600px] rounded-full bg-accent/10 opacity-60 blur-[100px] animate-glow" 
        style={{
          transform: `translate3d(${mousePosition.x * 30}px, ${mousePosition.y * 30}px, 0)`
        }}
      />
      <div 
        className="pointer-events-none absolute -left-[10%] bottom-[10%] h-[400px] w-[400px] rounded-full bg-blue/5 opacity-55 blur-[80px]" 
        style={{
          transform: `translate3d(${mousePosition.x * -20}px, ${mousePosition.y * -20}px, 0)`
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-12">
          
          {/* Left Column: Copy & Actions */}
          <div className="flex flex-col items-start lg:col-span-5 text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-surface-3 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-2 shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Sparkles className="h-3 w-3 animate-spin-slow" />
              </span>
              Introducing AI Route Optimization 2.0
            </div>
            
            <h1 className="font-display mb-6 text-[clamp(36px,5.5vw,64px)] font-extrabold leading-[1.05] tracking-tight text-ink">
              Move Deliveries <span className="text-accent">Faster.</span> Scale Operations <span className="text-accent-2">Smarter.</span>
            </h1>
            
            <p className="mb-8 max-w-lg text-[16px] md:text-[17px] leading-relaxed text-ink-2">
              SwiftParcel gives senders, receivers, and delivery agents a unified web platform to track shipments, record real-time status logs, and resolve policies with our AI support copilot.
            </p>
            
            {/* CTA Buttons */}
            <div className="mb-12 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="bg-accent text-white hover:bg-[#c83a10] shadow-md shadow-accent/10">
                <Link href="/register" className="flex items-center gap-2 font-semibold">
                  Start Free Trial <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="glass-panel">
                <Link href="/login" className="flex items-center gap-2 font-semibold">
                  <Play className="h-4 w-4 fill-current" /> Book a Demo
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-5 border-t border-surface-3 pt-8 w-full">
              <div className="flex -space-x-3.5">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80',
                  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=64&h=64&q=80',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=64&h=64&q=80',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Customer Avatar"
                    className="h-10 w-10 rounded-full border-2 border-surface object-cover shadow-sm"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                  <span className="ml-1 text-sm font-bold text-ink">4.9/5</span>
                </div>
                <p className="text-xs text-ink-3">Trusted by active logistics managers</p>
              </div>
            </div>
          </div>

          {/* Right Column: Dashboard Mockup & Floating Glass Cards */}
          <div className="relative lg:col-span-7 flex items-center justify-center">
            
            {/* Background glowing glow behind the dashboard */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-blue/15 rounded-[40px] blur-[60px] opacity-70 pointer-events-none scale-90" />

            {/* Dashboard Mockup wrapper with Mouse Parallax Shift */}
            <div 
              className="w-full transition-transform duration-500 ease-out"
              style={{
                transform: `translate3d(${mousePosition.x * 12}px, ${mousePosition.y * 12}px, 0)`
              }}
            >
              <DashboardMockup />
            </div>

            {/* Floating Metric Card 1: 3 Portal Roles */}
            <div 
              className="glass-panel absolute -left-8 -top-8 hidden rounded-2xl p-4 shadow-xl border border-white/40 lg:flex items-center gap-3 transition-transform duration-500 ease-out animate-float"
              style={{
                transform: `translate3d(${mousePosition.x * -15}px, ${mousePosition.y * -15}px, 0)`
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-bg text-accent">
                <Package className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-display text-lg font-extrabold text-ink leading-none">3 Portals</p>
                <p className="text-[10px] text-ink-3 font-semibold uppercase tracking-wider mt-1">Dedicated Roles</p>
              </div>
            </div>

            {/* Floating Metric Card 2: AI Support Copilot */}
            <div 
              className="glass-panel absolute -right-6 -top-12 hidden rounded-2xl p-4 shadow-xl border border-white/45 lg:flex items-center gap-3 transition-transform duration-500 ease-out animate-float-delayed"
              style={{
                transform: `translate3d(${mousePosition.x * 25}px, ${mousePosition.y * -10}px, 0)`
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-bg text-green">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-display text-lg font-extrabold text-ink leading-none">AI Copilot</p>
                <p className="text-[10px] text-ink-3 font-semibold uppercase tracking-wider mt-1">RAG Support Chat</p>
              </div>
            </div>

            {/* Floating Metric Card 3: 6 Status Stages */}
            <div 
              className="glass-panel absolute -left-12 bottom-12 hidden rounded-2xl p-4 shadow-xl border border-white/45 lg:flex items-center gap-3 transition-transform duration-500 ease-out animate-float-delayed"
              style={{
                transform: `translate3d(${mousePosition.x * -20}px, ${mousePosition.y * 20}px, 0)`
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-bg text-blue">
                <Globe className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-display text-lg font-extrabold text-ink leading-none">6 Stages</p>
                <p className="text-[10px] text-ink-3 font-semibold uppercase tracking-wider mt-1">Milestone Logs</p>
              </div>
            </div>

            {/* Floating Metric Card 4: Public Tracking */}
            <div 
              className="glass-panel absolute -right-8 bottom-6 hidden rounded-2xl p-4 shadow-xl border border-white/40 lg:flex items-center gap-3 transition-transform duration-500 ease-out animate-float"
              style={{
                transform: `translate3d(${mousePosition.x * 15}px, ${mousePosition.y * 15}px, 0)`
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-bg text-amber">
                <Clock className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-display text-lg font-extrabold text-ink leading-none">Instant</p>
                <p className="text-[10px] text-ink-3 font-semibold uppercase tracking-wider mt-1">Public Tracker</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

