import { useRef } from 'react';
import HeroSection from '../components/HeroSection';
import BenefitsSection from '../components/BenefitsSection';
import CharterSection from '../components/CharterSection';
import StatsSection from '../components/StatsSection';
import RegistrationFormNew from '../components/RegistrationFormNew';
import Footer from '../components/Footer';

export default function LandingPage() {
  const formRef = useRef<HTMLElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      <HeroSection onScrollToForm={scrollToForm} />
      <BenefitsSection />
      <CharterSection />
      <StatsSection />

      <section ref={formRef} id="inscription" className="py-20 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RegistrationFormNew />
        </div>
      </section>

      <Footer />
    </div>
  );
}
