import React from 'react';

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
}

const testimonials: TestimonialItem[] = [
  {
    quote: "SwiftParcel reduced our delivery delays by 38% and gave us complete operational visibility. The AI routing is a game changer for our dispatch team.",
    name: "Arthur Vance",
    role: "Head of Logistics",
    company: "Apex Distribution",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    rating: 5
  },
  {
    quote: "The developer APIs and webhooks allowed us to integrate automated shipping triggers inside our custom Shopify checkout in just a single afternoon.",
    name: "Sarah Jenkins",
    role: "Lead Engineer",
    company: "Threads & Co.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    rating: 5
  },
  {
    quote: "Reconciling $45,000 in Cash on Delivery payments used to take us 3 days every week. With SwiftParcel's automated ledger tools, it takes 15 minutes.",
    name: "Michael Chang",
    role: "Finance Director",
    company: "Atlas Retailers",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white/50 backdrop-blur-sm grid-pattern">
      <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
        
        {/* Section Title */}
        <div className="mb-16 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Testimonials</span>
          <h2 className="font-display mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-ink">
            What operations leaders are saying
          </h2>
          <p className="mt-4 text-ink-2">
            See how commerce brands and regional shipping giants modernize their fulfillment metrics.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div 
              key={idx}
              className="glass-panel text-left p-8 rounded-2xl flex flex-col justify-between border border-surface-3 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Rating stars */}
                <div className="flex gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-ink-2 leading-relaxed text-sm italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* User detail */}
              <div className="mt-8 flex items-center gap-4 border-t border-surface-3 pt-6">
                <img 
                  src={item.avatar} 
                  alt={item.name} 
                  className="h-10 w-10 rounded-full object-cover border border-surface-3 shadow-inner"
                />
                <div>
                  <h4 className="text-sm font-bold text-ink leading-tight">{item.name}</h4>
                  <p className="text-[11px] text-ink-3 mt-0.5">{item.role} · <span className="font-semibold text-accent">{item.company}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
