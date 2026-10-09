import '@/styles/landing.css';
import { Contact } from '@/components/landing/contact';
import { Faq } from '@/components/landing/faq';
import { Features } from '@/components/landing/features';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { LandingMotion } from '@/components/landing/landing-motion';
import { Reviews } from '@/components/landing/reviews';
import { Trusted } from '@/components/landing/trusted';
import { MotionReveal } from '@/components/motion-reveal';
import { SiteFooter } from '@/components/site-footer';

export default function LandingPage() {
  return (
    <div className="shell pg-landing">
      <Hero />
      <main>
        <Trusted />
        <Features />
        <HowItWorks />
        <Reviews />
        <Faq />
        <Contact />
      </main>
      <SiteFooter />
      <MotionReveal />
      <LandingMotion />
    </div>
  );
}
