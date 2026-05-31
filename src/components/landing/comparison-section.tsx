import React from 'react';
import { Check, X, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ComparisonSection() {
  return (
    <section id="comparison" className="py-24 bg-[#FAFAF8] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
        
        {/* Section Title */}
        <div className="mb-20 text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Comparison</span>
          <h2 className="font-display mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-ink">
            Why teams switch to SwiftParcel
          </h2>
          <p className="mt-4 text-ink-2">
            See how upgrading from fragmented, manual tracking logs to our unified logistics dashboards simplifies package management.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* Card 1: Traditional Spreadsheets */}
          <div className="glass-panel rounded-2xl p-8 border border-surface-3 bg-white/20 text-left flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-ink-3">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">Legacy Methods</h3>
                  <p className="text-[10px] text-ink-3 uppercase font-semibold">Spreadsheets & Disconnected Logs</p>
                </div>
              </div>

              <div className="space-y-5">
                {[
                  { title: 'Manual Tracking Entries', desc: 'Fulfillment logs are manually entered in spreadsheets, resulting in typos and delayed status reports.' },
                  { title: 'Missing Event Logs', desc: 'No step-by-step history of who verified the parcel transit milestones or when they occurred.' },
                  { title: 'Fragmented Portal Space', desc: 'Senders and receivers share identical dashboards, leading to security oversights and interface confusion.' },
                  { title: 'Overloaded Support Teams', desc: 'Operators spend hours answering routine policy queries, lost parcel guidelines, and compensation limits.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start text-xs text-left">
                    <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                      <X className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink-2">{item.title}</h4>
                      <p className="text-[11px] text-ink-3 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: SwiftParcel (Highlighted) */}
          <div className="glass-panel rounded-2xl p-8 border-2 border-accent bg-white text-left flex flex-col justify-between shadow-2xl shadow-accent/5 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-28 w-28 bg-accent/5 rounded-full blur-xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-bg text-accent">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                    SwiftParcel 
                    <span className="text-[9px] bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-bold uppercase">Active System</span>
                  </h3>
                  <p className="text-[10px] text-ink-3 uppercase font-semibold">Unified Web Operations</p>
                </div>
              </div>

              <div className="space-y-5">
                {[
                  { title: 'Automated Status Logs', desc: 'Parcels transition cleanly through statuses like PENDING, PICKED_UP, IN_TRANSIT, and DELIVERED.' },
                  { title: 'Detailed Status Log Timelines', desc: 'Every update records the operator, date, and custom dispatcher notes for auditing.' },
                  { title: 'Role-Based Dashboards', desc: 'Secure, specialized views matching Senders, Receivers, Delivery personnel, and Administrator permissions.' },
                  { title: 'AI RAG Support Copilot', desc: 'Our chatbot scans custom shipping guidelines to resolve claim questions instantly without delays.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start text-xs text-left">
                    <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-accent-bg text-accent">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink">{item.title}</h4>
                      <p className="text-[11px] text-ink-2 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-3 flex items-center justify-between">
              <span className="text-xs text-ink-3">Modernize your logistics stack today.</span>
              <Link href="/register" className="flex items-center gap-1.5 text-xs font-bold text-accent hover:underline">
                Get Started <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
