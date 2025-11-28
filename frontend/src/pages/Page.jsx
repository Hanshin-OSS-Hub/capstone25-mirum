


import { Header } from '../components/Header';
// import { Footer } from './components/Footer';
import { HeroSection } from '../components/HeroSection';
// import { FeaturesSection } from './components/FeaturesSection';
// import { BenefitsSection } from './components/BenefitsSection';
// import { PricingSection } from './components/PricingSection';
// import { ContactSection } from './components/ContactSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        {/* <FeaturesSection /> 
        <BenefitsSection />
        <PricingSection />
        <ContactSection /> */}
      </main>
      {/* <Footer /> */}
    </div>
  );
}
