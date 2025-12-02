import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
// import { FeaturesSection } from './components/FeaturesSection';
// import { BenefitsSection } from './components/BenefitsSection';
// import { PricingSection } from './components/PricingSection';
// import { ContactSection } from './components/ContactSection';
// import { Footer } from './components/Footer';

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
