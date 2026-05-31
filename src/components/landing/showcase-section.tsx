import React from 'react';
import { 
  CheckCircle2, PlusCircle, CheckSquare, ClipboardList,
  Sparkles, FileText
} from 'lucide-react';

export function ShowcaseSection() {
  return (
    <section id="showcase" className="py-24 bg-[#FAFAF8] space-y-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        
        {/* Section Title */}
        <div className="mb-20 text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Feature Focus</span>
          <h2 className="font-display mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-ink">
            A real-world shipping system
          </h2>
          <p className="mt-4 text-ink-2">
            See how SwiftParcel segregates operations into dedicated user spaces, keeping data synchronized and secure.
          </p>
        </div>

        {/* Section 1: Sender Portal (Text Left, Graphic Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-bg text-accent shadow-sm">
              <PlusCircle className="h-5 w-5" />
            </div>
            <h3 className="font-display text-2xl md:text-4xl font-extrabold text-ink tracking-tight">
              Sender Portal
            </h3>
            <p className="text-ink-2 leading-relaxed">
              Create shipments in seconds. Senders enter recipient details, addresses, and parcel descriptions. Once submitted, the system generates a tracking ID and adds it to the outgoing parcels database.
            </p>
            <ul className="space-y-3.5">
              {[
                { title: 'Create Parcels', desc: 'Specify receiver name, phone, pickup, and delivery address.' },
                { title: 'Self-Service Cancellations', desc: 'Cancel shipments instantly prior to courier pickup.' },
                { title: 'Outgoing Ledger', desc: 'View a list of all your created shipments with live status labels.' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-accent-bg text-accent">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">{item.title}</h4>
                    <p className="text-xs text-ink-3 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7 flex justify-center">
            {/* Mockup Card */}
            <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-surface-3 shadow-xl">
              <div className="flex justify-between items-center pb-4 border-b border-surface-3 mb-4">
                <span className="text-xs font-bold text-ink-2 uppercase tracking-wide">Create Parcel (Sender Panel)</span>
                <span className="text-[10px] text-ink-3">New Entry</span>
              </div>
              <div className="space-y-3.5 text-left text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-ink-3 font-bold uppercase mb-1">Receiver Name</label>
                    <div className="bg-surface-2 border border-surface-3 p-2 rounded-lg text-ink font-semibold">Sarah Jenkins</div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-ink-3 font-bold uppercase mb-1">Receiver Phone</label>
                    <div className="bg-surface-2 border border-surface-3 p-2 rounded-lg text-ink font-semibold">+1 (555) 019-2834</div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-ink-3 font-bold uppercase mb-1">Pickup Address</label>
                  <div className="bg-surface-2 border border-surface-3 p-2 rounded-lg text-ink">120 Broadway, New York, NY 10271</div>
                </div>
                <div>
                  <label className="block text-[10px] text-ink-3 font-bold uppercase mb-1">Delivery Address</label>
                  <div className="bg-surface-2 border border-surface-3 p-2 rounded-lg text-ink">555 California St, San Francisco, CA 94104</div>
                </div>
                <div className="pt-2">
                  <button className="w-full bg-accent text-white font-bold py-2.5 rounded-lg text-center hover:bg-[#c83a10] transition-colors">
                    Create Parcel Shipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Receivers Portal (Graphic Left, Text Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 flex justify-center order-last lg:order-first">
            {/* Mockup Card */}
            <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-surface-3 shadow-xl">
              <div className="flex justify-between items-center pb-4 border-b border-surface-3 mb-4">
                <span className="text-xs font-bold text-ink-2 uppercase tracking-wide">Incoming Shipments (Receiver Panel)</span>
                <span className="text-[10px] bg-blue-bg text-blue px-2 py-0.5 rounded-full font-bold">1 Incoming</span>
              </div>
              <div className="space-y-3 text-left">
                <div className="bg-white/40 border border-surface-3 rounded-xl p-4 transition-all">
                  <div className="flex justify-between items-center mb-2.5">
                    <div>
                      <p className="text-xs font-bold text-ink">#SWP-3024-C</p>
                      <p className="text-[9px] text-ink-3">Sender: Arthur Vance</p>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-bg text-amber border border-amber/20 px-2.5 py-0.5 rounded-full uppercase">
                      IN_TRANSIT
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-[10px] text-ink-3 shrink-0">Progress:</span>
                    <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: '60%' }} />
                    </div>
                    <span className="text-[10px] font-bold text-ink-2">Out depot</span>
                  </div>
                  <p className="text-[9px] text-ink-3 mt-3">Fulfillment Note: loaded on EV-02 courier run.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-bg text-blue shadow-sm">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h3 className="font-display text-2xl md:text-4xl font-extrabold text-ink tracking-tight">
              Receiver Portal
            </h3>
            <p className="text-ink-2 leading-relaxed">
              No guesswork. Receivers log in to see incoming packages addressed specifically to their registered phone number. Verify sender names, delivery locations, and logs on a single page.
            </p>
            <ul className="space-y-3.5">
              {[
                { title: 'Phone Number Mapping', desc: 'Auto-detects incoming shipments assigned to your phone.' },
                { title: 'Secure Package Review', desc: 'Examine detailed status logs and courier comments.' },
                { title: 'Fulfillment Milestones', desc: 'Follow progress stages from PICKED_UP to final delivery.' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-blue-bg text-blue">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">{item.title}</h4>
                    <p className="text-xs text-ink-3 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 3: Delivery Personnel Desk (Text Left, Graphic Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-bg text-green shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="font-display text-2xl md:text-4xl font-extrabold text-ink tracking-tight">
              Delivery Agent Terminal
            </h3>
            <p className="text-ink-2 leading-relaxed">
              Designed for agent ease. Courier personnel log in to see their history, accept pickups, and submit status logs (PENDING, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED) with custom notes.
            </p>
            <ul className="space-y-3.5">
              {[
                { title: 'Fulfillment Checklist', desc: 'Courier agents access pending packages assigned for delivery.' },
                { title: 'Real-time Log Overwrite', desc: 'Change parcel status tags and add dispatcher logs.' },
                { title: 'Mobile Responsive View', desc: 'Update coordinates and statuses on-site directly from a mobile device.' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-green-bg text-green">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">{item.title}</h4>
                    <p className="text-xs text-ink-3 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7 flex justify-center">
            {/* Mockup Card */}
            <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-surface-3 shadow-xl text-left space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-surface-3">
                <span className="text-xs font-bold text-ink-2 uppercase tracking-wide">Status Log Editor (Courier Panel)</span>
                <span className="text-[10px] text-accent font-semibold flex items-center">Kevin Reynolds</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[9px] text-ink-3 font-bold uppercase mb-1">Target Package</label>
                  <div className="bg-surface-2 border border-surface-3 p-2 rounded-lg font-bold">#SWP-7811-C</div>
                </div>
                <div>
                  <label className="block text-[9px] text-ink-3 font-bold uppercase mb-1">Select Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((s, i) => (
                      <span key={i} className={`px-2 py-1 rounded border font-semibold cursor-pointer ${
                        s === 'OUT_FOR_DELIVERY' ? 'bg-accent text-white border-accent' : 'bg-white border-surface-3 text-ink-2'
                      }`}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] text-ink-3 font-bold uppercase mb-1">Log Note</label>
                  <div className="bg-white border border-surface-3 p-2 rounded-lg text-ink font-mono min-h-12">
                    Package loaded on delivery truck, en route to customer home.
                  </div>
                </div>
                <button className="w-full bg-accent text-white font-bold py-2.5 rounded-lg text-center hover:bg-[#c83a10] transition-colors">
                  Log Status Change
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: AI Copilot Assistant (Graphic Left, Text Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 flex justify-center order-last lg:order-first">
            {/* Mockup Card */}
            <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-surface-3 shadow-xl text-left space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-surface-3">
                <span className="text-xs font-bold text-ink-2 uppercase tracking-wide">RAG Policy Assistant (AI Copilot)</span>
                <span className="text-[10px] text-green font-bold bg-green-bg px-2 py-0.5 rounded-full">Copilot Online</span>
              </div>
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-start gap-2 text-left">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-[9px]">ME</div>
                  <div className="bg-surface-2 border border-surface-3 rounded-xl px-3 py-2 text-ink max-w-[85%]">
                    Can I ship frozen foods?
                  </div>
                </div>
                <div className="flex items-start gap-2 text-left">
                  <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-[9px] text-white font-bold">AI</div>
                  <div className="bg-white border border-surface-3 rounded-xl px-3 py-2 text-ink-2 max-w-[85%] leading-relaxed">
                    According to the <strong className="text-accent">Shipping Restriction Rules (Page 2)</strong>, perishable items and frozen foods are strictly prohibited. These require chilled reefer logistics which are not supported.
                  </div>
                </div>
                <div className="pt-2 border-t border-surface-3 flex items-center gap-1.5 text-[9px] text-ink-3">
                  <FileText className="h-3 w-3 text-accent" />
                  <span>References: prohibited_items_guidelines.pdf · Section 2.4</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-bg text-amber shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-display text-2xl md:text-4xl font-extrabold text-ink tracking-tight">
              AI Support Copilot
            </h3>
            <p className="text-ink-2 leading-relaxed">
              Resolve claims and policy questions instantly. The SwiftParcel chat assistant is equipped with Retrieval-Augmented Generation (RAG) to cross-reference shipping guidelines, compensation limits, and courier rules.
            </p>
            <ul className="space-y-3.5">
              {[
                { title: 'Verified Policy Citations', desc: 'Returns direct page and section references from PDFs.' },
                { title: 'Automated FAQ Help', desc: 'Resolves parcel claim questions without hub operator intervention.' },
                { title: 'Policy Synchronization', desc: 'Answers update instantly as new rules PDF logs are uploaded by admin.' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-amber-bg text-amber">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">{item.title}</h4>
                    <p className="text-xs text-ink-3 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
