'use client';


import { 
  Sparkles, Navigation, Check, FileText,
  UserCheck, Truck
} from 'lucide-react';

export function FeaturesSection() {
  return (
    <section id="features" className="relative px-6 py-24 md:px-12 bg-white/50 backdrop-blur-sm grid-pattern">
      <div className="mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="mb-16 text-left">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Fulfillment Capabilities
          </span>
          <h2 className="font-display mt-4 mb-4 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            A Complete Logistics Hub. <br />
            Built for <span className="text-accent">Real Operations.</span>
          </h2>
          <p className="max-w-lg text-ink-2">
            No mock claims. SwiftParcel gives operators, shippers, and couriers the exact tools they need to track, edit, and moderate deliveries.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: AI RAG Copilot (Col-Span 2) */}
          <div className="glass-panel group relative overflow-hidden rounded-xl p-8 lg:col-span-2 flex flex-col justify-between min-h-[320px] transition-all hover:shadow-lg hover:shadow-accent/5">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-48 w-48 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col gap-3 max-w-md text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-bg text-accent">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <h3 className="font-display text-xl font-bold text-ink">AI-Powered RAG Support</h3>
              <p className="text-sm leading-relaxed text-ink-2">
                Our built-in support chatbot uses Retrieval-Augmented Generation (RAG) to scan shipping documents and policy documents. Customers can ask compensation rates, shipping constraints, or claims procedures directly.
              </p>
            </div>

            {/* Visual Mini-Widget */}
            <div className="mt-8 rounded-lg bg-surface border border-surface-3 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs border-b border-surface-3 pb-2">
                <span className="font-semibold text-ink-2">Ask RAG Copilot</span>
                <span className="text-[10px] text-green font-bold bg-green-bg px-2 py-0.5 rounded-full">Copilot active</span>
              </div>
              <div className="space-y-2 text-left">
                <div className="text-[10px] bg-white border border-surface-3 rounded-lg p-2 max-w-[85%]">
                  <p className="font-bold text-ink">User: How do I claim for lost uninsured parcels?</p>
                </div>
                <div className="text-[10px] bg-accent/5 border border-accent/15 rounded-lg p-2 max-w-[90%] ml-auto">
                  <p className="text-accent font-bold">Copilot: According to section 4 of the guidelines, lost uninsured items are compensated up to a maximum cap of $50.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Public Tracker (Col-Span 1) */}
          <div className="glass-panel group relative overflow-hidden rounded-xl p-8 flex flex-col justify-between min-h-[320px] transition-all hover:shadow-lg">
            <div className="flex flex-col gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-bg text-blue">
                <Navigation className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-ink">Public Tracking Portal</h3>
              <p className="text-sm leading-relaxed text-ink-2">
                No sign-up required for tracking. Anyone can input their parcel tracking ID on the public lookup page to view en-route progress instantly.
              </p>
            </div>

            {/* Visual Mini-Widget */}
            <div className="mt-8 rounded-lg bg-surface border border-surface-3 p-4 relative overflow-hidden h-28 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/20 grid-pattern opacity-40" />
              <div className="w-full text-left space-y-1.5 z-10">
                <div className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded border border-surface-3 text-[10px]">
                  <span className="font-semibold text-ink">#SWP-7811-C</span>
                  <span className="text-blue font-bold">IN_TRANSIT</span>
                </div>
                <p className="text-[9px] text-ink-3">Pickup Address: Chicago Depot → Delivery Address: 500 N Michigan Ave</p>
              </div>
            </div>
          </div>

          {/* Card 3: Role-Based Portals (Col-Span 1) */}
          <div className="glass-panel group relative overflow-hidden rounded-xl p-8 flex flex-col justify-between min-h-[320px] transition-all hover:shadow-lg">
            <div className="flex flex-col gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-bg text-green">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-ink">Role-Based Logins</h3>
              <p className="text-sm leading-relaxed text-ink-2">
                Specialized views for Senders (to create packages), Receivers (to review incoming shipments), and Delivery personnel.
              </p>
            </div>

            {/* Visual Mini-Widget */}
            <div className="mt-8 flex flex-col gap-2">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/10 p-2.5 flex items-start gap-2 text-left">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-emerald-600">Sender View</p>
                  <p className="text-[9px] text-ink-2 leading-tight mt-0.5">Created parcels list & address lookup form.</p>
                </div>
              </div>
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/10 p-2.5 flex items-start gap-2 text-left">
                <Check className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-blue-600">Receiver View</p>
                  <p className="text-[9px] text-ink-2 leading-tight mt-0.5">Incoming parcels addressed to your phone.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Milestone Status Logs (Col-Span 1) */}
          <div className="glass-panel group relative overflow-hidden rounded-xl p-8 flex flex-col justify-between min-h-[320px] transition-all hover:shadow-lg">
            <div className="flex flex-col gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-ink">Milestone Status Logs</h3>
              <p className="text-sm leading-relaxed text-ink-2">
                Parcels track through status logs including PENDING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, and DELIVERED.
              </p>
            </div>

            {/* Visual Mini-Widget */}
            <div className="mt-8 rounded-lg bg-surface border border-surface-3 p-3 space-y-2 text-left">
              {[
                { status: 'PICKED_UP', note: 'Collected en route' },
                { status: 'IN_TRANSIT', note: 'Loaded at Chicago Hub' }
              ].map((log, idx) => (
                <div key={idx} className="text-[10px]">
                  <p className="font-bold text-ink">{log.status}</p>
                  <p className="text-[9px] text-ink-3">Note: {log.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Delivery Personnel Desk (Col-Span 1) */}
          <div className="glass-panel group relative overflow-hidden rounded-xl p-8 flex flex-col justify-between min-h-[320px] transition-all hover:shadow-lg">
            <div className="flex flex-col gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-bg text-amber">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-ink">Agent Delivery Logs</h3>
              <p className="text-sm leading-relaxed text-ink-2">
                Delivery agents log in to access history, confirm parcel pickups, and submit status logs with dispatcher notes.
              </p>
            </div>

            {/* Visual Mini-Widget */}
            <div className="mt-8 rounded-lg bg-surface border border-surface-3 p-3 flex justify-between items-center text-left">
              <div>
                <p className="text-[9px] text-ink-3 uppercase font-bold tracking-wider">Agent Station</p>
                <p className="font-display text-xs font-bold text-ink">Kevin Reynolds</p>
              </div>
              <button className="flex items-center justify-center gap-1 text-[9px] font-bold bg-green-bg text-green border border-green/20 rounded px-2 py-1">
                Active Duty
              </button>
            </div>
          </div>



        </div>
      </div>
    </section>
  );
}
