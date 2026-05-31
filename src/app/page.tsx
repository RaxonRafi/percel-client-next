import { LandingNav } from '@/components/landing/landing-nav';
import { HeroSection } from '@/components/landing/hero-section';
import { TrustSection } from '@/components/landing/trust-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { ShowcaseSection } from '@/components/landing/showcase-section';
import { StatsSection } from '@/components/landing/stats-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { ComparisonSection } from '@/components/landing/comparison-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] antialiased select-none selection:bg-accent selection:text-white">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section (Contains SaaS Dashboard & Interactive Map Widget) */}
      <HeroSection />

      {/* Trust Logo Cloud */}
      <TrustSection />

      {/* Bento Grid Features */}
      <FeaturesSection />

      {/* Alternating Showcase Features */}
      <ShowcaseSection />

      {/* Counting Stats Metrics */}
      <StatsSection />

      {/* Testimonials Review Slider */}
      <TestimonialsSection />

      {/* Comparison Legacy vs SwiftParcel Grid */}
      <ComparisonSection />

      {/* Final CTA Strip */}
      <CTASection />

      {/* Multi-column Footer */}
      <Footer />
    </div>
  );
}

