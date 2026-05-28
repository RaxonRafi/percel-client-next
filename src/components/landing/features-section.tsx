import { Map, Bell, BarChart3, Code, Smartphone, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Map,
    color: 'accent',
    title: 'Live route optimization',
    desc: 'AI-driven routing recalculates in real time based on traffic, weather, and delivery windows.',
  },
  {
    icon: Bell,
    color: 'green',
    title: 'Customer notifications',
    desc: 'Automatic SMS, email, and WhatsApp updates at every stage.',
  },
  {
    icon: BarChart3,
    color: 'blue',
    title: 'Analytics dashboard',
    desc: 'Drill into delivery performance by driver, zone, or customer segment.',
  },
  {
    icon: Code,
    color: 'amber',
    title: 'REST API & webhooks',
    desc: 'Plug SwiftParcel into your existing stack in minutes.',
  },
  {
    icon: Smartphone,
    color: 'purple',
    title: 'Driver mobile app',
    desc: 'iOS & Android app with offline support and proof-of-delivery capture.',
  },
  {
    icon: ShieldCheck,
    color: 'pink',
    title: 'COD & payment tracking',
    desc: 'Manage cash-on-delivery collections and reconciliation in one place.',
  },
];

const iconBg: Record<string, string> = {
  accent: 'bg-accent-bg text-accent',
  green: 'bg-green-bg text-green',
  blue: 'bg-blue-bg text-blue',
  amber: 'bg-amber-bg text-amber',
  purple: 'bg-purple-100 text-purple-600',
  pink: 'bg-pink-100 text-pink-600',
};

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white px-6 py-24 md:px-12">
      <div className="mx-auto max-w-6xl">
        <span className="text-xs font-medium uppercase tracking-widest text-accent">
          Platform features
        </span>
        <h2 className="font-display mt-4 mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Everything logistics
          <br />
          teams actually need
        </h2>
        <p className="mb-16 max-w-lg text-ink-2">
          Purpose-built tools for dispatchers, drivers, and customers — unified in
          one platform.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-[var(--radius-lg)] border border-surface-3 p-7 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] ${iconBg[f.color]}`}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-ink-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
