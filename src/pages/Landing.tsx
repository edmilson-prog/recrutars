import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function Landing() {
  return (
    <PublicLayout>
      <div className="min-h-screen pb-12">
        <Header />
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
        <Footer />
      </div>
    </PublicLayout>
  );
}
