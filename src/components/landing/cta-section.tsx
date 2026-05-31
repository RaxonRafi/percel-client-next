import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="px-6 py-20 md:px-12 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[32px] gradient-mesh-dark px-8 py-20 text-center text-white md:px-16 md:py-24 border border-white/5 shadow-2xl">
          
          {/* Animated Glow Spotlights */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/25 blur-[100px] animate-glow" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-blue/15 blur-[100px]" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Ready to Modernize Your <br />
              <span className="text-accent-2">Logistics Operations?</span>
            </h2>
            
            <p className="mx-auto max-w-md text-sm md:text-base text-white/60 leading-relaxed">
              Join users already creating shipments, tracking status logs, and resolving policy queries with our AI Copilot on SwiftParcel.
            </p>
            
            <div className="pt-6 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-[#c83a10] text-white font-semibold shadow-lg shadow-accent/20">
                <Link href="/register" className="flex items-center gap-2">
                  Start Free Trial <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                <Link href="/login" className="flex items-center gap-2 font-semibold">
                  <Play className="h-4 w-4 fill-current" /> Schedule Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
