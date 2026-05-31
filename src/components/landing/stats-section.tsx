'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Navigation, Users, Clock, ClipboardList } from 'lucide-react';

interface StatItem {
  target: number;
  decimals?: number;
  suffix: string;
  prefix?: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const stats: StatItem[] = [
  { target: 6, suffix: ' Stages', label: 'Parcel Statuses', description: 'Pending to Delivered logs.', icon: ClipboardList },
  { target: 3, suffix: ' Portals', label: 'Dedicated Roles', description: 'Sender, Receiver, Courier.', icon: Users },
  { target: 100, suffix: '%', label: 'RAG Knowledge', description: 'Policy guidelines indexed.', icon: Sparkles },
  { target: 1, suffix: ' Click', label: 'Public Tracker', description: 'Search status instantly by ID.', icon: Navigation },
  { target: 24, suffix: '/7', label: 'Copilot Chat', description: 'Always active AI helper.', icon: Clock }
];

export function StatsSection() {
  return (
    <section className="relative py-24 bg-white border-y border-surface-3 grid-pattern">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <StatCard key={idx} stat={stat} Icon={Icon} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, Icon }: { stat: StatItem; Icon: React.ComponentType<{ className?: string }> }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const start = 0;
          const end = stat.target;
          const duration = 2000; // 2 seconds
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            const currentValue = start + easeProgress * (end - start);
            
            setCount(currentValue);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [stat.target, hasAnimated]);

  const formattedCount = stat.decimals 
    ? count.toFixed(stat.decimals) 
    : Math.floor(count).toString();

  return (
    <div 
      ref={elementRef}
      className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 p-6 rounded-2xl transition-all duration-300 hover:bg-surface"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display text-4xl md:text-5xl font-extrabold text-ink tracking-tight">
          {stat.prefix}{formattedCount}{stat.suffix}
        </p>
        <h4 className="text-sm font-bold text-ink mt-2.5">{stat.label}</h4>
        <p className="text-xs text-ink-3 mt-1 leading-relaxed">{stat.description}</p>
      </div>
    </div>
  );
}
