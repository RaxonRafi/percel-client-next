'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Bell, Settings, Truck, Navigation, 
  Sparkles, CheckCircle2, Activity, 
  FileText, User, UserCheck
} from 'lucide-react';

export function DashboardMockup() {
  const [activeTab, setActiveTab] = useState<'tracker' | 'copilot' | 'roles'>('tracker');
  const [currentStep, setCurrentStep] = useState(2); // OUT_FOR_DELIVERY
  const [logs, setLogs] = useState([
    { id: 1, time: 'Just Now', text: 'Kevin R. changed status of #SWP-7811 to DELIVERED', status: 'done' },
    { id: 2, time: '3 mins ago', text: 'Sender created new parcel #SWP-9081 (PENDING)', status: 'pending' },
    { id: 3, time: '12 mins ago', text: 'Sender cancelled shipment #SWP-4412 (CANCELLED)', status: 'cancel' },
  ]);

  // Simulate updating log entries periodically using actual status workflows
  useEffect(() => {
    const texts = [
      'Delivery agent accepted parcel #SWP-3024 (PICKED_UP)',
      'Parcel #SWP-8911 departed sorting hub (IN_TRANSIT)',
      'Kevin R. assigned to deliver #SWP-4501 (OUT_FOR_DELIVERY)',
      'Sender cancelled shipment #SWP-2022 (CANCELLED)',
      'Receiver Natalie J. checked shipment #SWP-3024',
    ];
    const statuses = ['transit', 'transit', 'transit', 'cancel', 'done'];

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * texts.length);
      setLogs(prev => [
        {
          id: Date.now(),
          time: 'Just Now',
          text: texts[randomIndex],
          status: statuses[randomIndex],
        },
        ...prev.slice(0, 2),
      ]);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel-dark relative w-full overflow-hidden rounded-xl border border-white/10 text-white shadow-2xl transition-all duration-500 hover:shadow-accent/5">
      {/* Top Navbar */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 border border-white/10 text-[11px] text-white/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Operational Console
          </div>
          <div className="hidden text-xs text-white/40 md:inline">Hub Database v1.0</div>
        </div>

        {/* Control bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-white/50 w-36 md:w-48">
            <Search className="mr-1.5 h-3 w-3 text-white/30" />
            <span>Search tracking ID...</span>
          </div>
          <button className="relative rounded-lg p-1.5 hover:bg-white/5 transition-colors text-white/70">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
          </button>
          <button className="rounded-lg p-1.5 hover:bg-white/5 transition-colors text-white/70">
            <Settings className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 min-h-[380px]">
        
        {/* Left Side: Parcel Details & Lifecycle */}
        <div className="border-r border-white/10 p-5 flex flex-col justify-between gap-5 bg-white/[0.01]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Tracking Details</span>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent border border-accent/20">
                #SWP-7811-C
              </span>
            </div>

            {/* Tracking Status Timeline (Actual Status Flow) */}
            <div className="space-y-4">
              {[
                { title: 'PENDING', time: 'May 31 · 09:14 AM', desc: 'Sender created order' },
                { title: 'PICKED_UP', time: 'May 31 · 10:30 AM', desc: 'Driver Kevin R. collected' },
                { title: 'IN_TRANSIT', time: 'May 31 · 11:45 AM', desc: 'Departed sorting depot' },
                { title: 'OUT_FOR_DELIVERY', time: 'May 31 · 12:50 PM', desc: 'Near delivery address' },
                { title: 'DELIVERED', time: 'Expected by 2:45 PM', desc: 'Awaiting signature' }
              ].map((step, idx) => (
                <div key={idx} className="relative flex gap-3 text-left">
                  {/* Connective Line */}
                  {idx < 4 && (
                    <div className={`absolute left-2.5 top-6 bottom-0 w-0.5 ${
                      idx < currentStep ? 'bg-accent' : 'bg-white/10'
                    }`} />
                  )}

                  {/* Node Button */}
                  <button 
                    onClick={() => setCurrentStep(idx)}
                    className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      idx < currentStep 
                        ? 'bg-accent border-accent text-white shadow-sm' 
                        : idx === currentStep
                        ? 'bg-ink border-accent text-accent scale-110 ring-2 ring-accent/30'
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                  >
                    {idx < currentStep ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </button>

                  <div className="text-xs">
                    <p className={`font-semibold transition-colors ${
                      idx === currentStep ? 'text-accent' : 'text-white/80'
                    }`}>{step.title}</p>
                    <p className="text-[9px] text-white/40">{step.time} · <span className="text-white/50">{step.desc}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active status note */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-start gap-2.5 text-left">
            <FileText className="h-4.5 w-4.5 text-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wide">Status Log Note</h4>
              <p className="mt-1 text-[9px] text-white/60 leading-relaxed">
                &ldquo;Parcel package has been checked at sorting depot, loaded on EV delivery vehicle.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: Visual Tabs */}
        <div className="md:col-span-2 flex flex-col justify-between">
          
          {/* Tab Selection */}
          <div className="flex border-b border-white/10 px-5 pt-3">
            {[
              { id: 'tracker', label: 'Parcel Tracker', icon: Navigation },
              { id: 'copilot', label: 'AI Copilot Q&A', icon: Sparkles },
              { id: 'roles', label: 'Dashboard Roles', icon: UserCheck },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'tracker' | 'copilot' | 'roles')}
                  className={`flex items-center gap-1.5 border-b-2 px-3 pb-3 pt-1 text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-white/50 hover:text-white/80'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Screen Area */}
          <div className="relative flex-1 p-5 flex items-center justify-center">
            
            {/* Tab 1: Parcel Tracker (SVG Map displaying route address pins) */}
            {activeTab === 'tracker' && (
              <div className="relative w-full h-full min-h-[220px] flex items-center justify-center rounded-xl bg-white/[0.01] border border-white/5 overflow-hidden">
                <svg className="w-full h-full max-h-[260px] min-h-[200px]" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid overlay */}
                  <g opacity="0.1" stroke="currentColor" strokeWidth="0.5">
                    <line x1="0" y1="40" x2="400" y2="40" />
                    <line x1="0" y1="80" x2="400" y2="80" />
                    <line x1="0" y1="120" x2="400" y2="120" />
                    <line x1="0" y1="160" x2="400" y2="160" />
                    <line x1="200" y1="0" x2="200" y2="240" />
                  </g>

                  {/* Route path */}
                  <path
                    d="M60 160 C 140 160, 200 80, 340 80"
                    stroke="url(#orange-glow)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Pulsing indicator */}
                  <circle cx="200" cy="120" r="6" fill="#FF5A1F" className="animate-pulse" />
                  <circle cx="200" cy="120" r="12" fill="#FF5A1F" opacity="0.2" className="animate-ping" />

                  {/* Start Node */}
                  <circle cx="60" cy="160" r="5" fill="#fff" stroke="#FF5A1F" strokeWidth="2.5" />
                  {/* End Node */}
                  <circle cx="340" cy="80" r="5" fill="#fff" stroke="#3b82f6" strokeWidth="2.5" />

                  <defs>
                    <linearGradient id="orange-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF5A1F" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* SVG Floating Marker Details */}
                <div className="absolute left-6 bottom-6 glass-panel rounded-lg px-2.5 py-1.5 text-ink text-[9px] shadow-md border border-white/20">
                  <p className="font-bold text-black text-left">Pickup Address</p>
                  <p className="text-ink-3 text-left">New York Hub Sortation</p>
                </div>
                <div className="absolute right-6 top-6 glass-panel rounded-lg px-2.5 py-1.5 text-ink text-[9px] shadow-md border border-white/20">
                  <p className="font-bold text-black text-left">Delivery Address</p>
                  <p className="text-ink-3 text-left">120 Broadway, New York, NY</p>
                </div>
              </div>
            )}

            {/* Tab 2: AI Copilot Chat (Simulated RAG assistant interactions) */}
            {activeTab === 'copilot' && (
              <div className="w-full h-full min-h-[220px] flex flex-col justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5 font-sans">
                <div className="space-y-3 overflow-y-auto max-h-[200px] text-left text-xs">
                  <div className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center text-[9px] font-bold">AI</div>
                    <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/90 max-w-[85%] leading-relaxed">
                      Hello! I can answer shipping policies, tracking guidelines, or claim procedures from our database.
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-accent rounded-xl px-3 py-2 text-white max-w-[85%] leading-relaxed">
                      What is the compensation for lost uninsured parcels?
                    </div>
                    <div className="h-5 w-5 rounded-full bg-white/25 flex items-center justify-center text-[9px] font-bold text-ink">ME</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center text-[9px] font-bold">AI</div>
                    <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/90 max-w-[85%] leading-relaxed">
                      According to our policy, compensation for lost uninsured parcels is capped at <strong className="text-accent">$50</strong> or the invoice value, whichever is less.
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-white/5 text-[10px] text-white/30 text-left items-center">
                  <Sparkles className="h-3 w-3 text-accent animate-pulse" />
                  <span>RAG Engine: Referencing shipping_policy_v2.pdf</span>
                </div>
              </div>
            )}

            {/* Tab 3: System Roles (Dedicated portals description) */}
            {activeTab === 'roles' && (
              <div className="w-full h-full min-h-[220px] grid grid-cols-3 gap-3 rounded-xl p-2 bg-white/[0.01]">
                {[
                  {
                    title: 'Sender Portal',
                    desc: 'Create shipments, specify receiver details, cancel parcels, and monitor outgoing items.',
                    action: 'Create Parcel',
                    icon: User
                  },
                  {
                    title: 'Receiver Portal',
                    desc: 'Secure view of incoming shipments addressed to your phone number, showing live status.',
                    action: 'Track Incoming',
                    icon: UserCheck
                  },
                  {
                    title: 'Delivery Personnel',
                    desc: 'Log shift history, confirm pickups, update statuses, and log notes for each shipment.',
                    action: 'Update Status',
                    icon: Truck
                  }
                ].map((role, i) => {
                  const Icon = role.icon;
                  return (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between text-left h-full">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-accent" />
                          <h4 className="text-[11px] font-bold text-white leading-none">{role.title}</h4>
                        </div>
                        <p className="text-[9px] text-white/60 leading-normal">{role.desc}</p>
                      </div>
                      <span className="text-[9px] text-accent font-semibold block mt-2 text-right">
                        {role.action} →
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-time DB Action Feed */}
          <div className="border-t border-white/10 px-5 py-3.5 bg-white/[0.01] flex items-center justify-between text-xs text-white/40 gap-4 overflow-hidden">
            <div className="flex items-center gap-2 text-white/60 truncate flex-1">
              <Activity className="h-3.5 w-3.5 text-accent animate-pulse shrink-0" />
              <span className="font-semibold text-[10px] tracking-wider uppercase text-white/40 shrink-0">DB Operations:</span>
              <span className="text-white/80 transition-all duration-500 truncate text-[11px]">
                {logs[0]?.text || 'Database status synchronized.'}
              </span>
            </div>
            <div className="text-[10px] text-white/30 shrink-0">{logs[0]?.time}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
