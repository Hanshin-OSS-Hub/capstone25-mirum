import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { FeaturesSection } from './components/FeaturesSection';
// import { BenefitsSection } from './components/BenefitsSection';
// import { PricingSection } from './components/PricingSection';
// import { ContactSection } from './components/ContactSection';
// import { Footer } from './components/Footer';
import SignupModal from '../features/auth/components/Signupmodal';
import { useAuth } from '../features/auth/hooks/useAuth';
import { HeroSection } from '../shared/components/HeroSection';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const handleLoginClick = () => {
    // 📢 "야! 로그인 모달 좀 열어줘!" 라고 방송
    window.dispatchEvent(new CustomEvent('openLoginModal'));
  };

  // 로그인 상태면 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div
                className="cursor-pointer text-2xl font-bold text-indigo-600 transition-colors hover:text-indigo-700"
                style={{ fontFamily: '"Pacifico", serif' }}
              >
                MIRUM
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-3 md:flex">
              <button
                onClick={handleLoginClick}
                className="cursor-pointer whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
              >
                로그인
              </button>

              <button
                onClick={() => setIsSignupOpen(true)}
                className="cursor-pointer whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
              >
                회원가입
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
            >
              <i className={`${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-xl`}></i>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="border-t border-gray-200 py-4 md:hidden">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection('features')}
                  className="cursor-pointer py-2 text-left text-gray-700 transition-colors hover:text-indigo-600"
                >
                  기능
                </button>
                <button
                  onClick={() => scrollToSection('benefits')}
                  className="cursor-pointer py-2 text-left text-gray-700 transition-colors hover:text-indigo-600"
                >
                  장점
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="cursor-pointer py-2 text-left text-gray-700 transition-colors hover:text-indigo-600"
                >
                  요금제
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="cursor-pointer py-2 text-left text-gray-700 transition-colors hover:text-indigo-600"
                >
                  문의
                </button>
                <button
                  onClick={() => handleLoginClick}
                  className="mt-2 cursor-pointer whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-left text-white transition-colors hover:bg-indigo-700"
                >
                  로그인/회원가입
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection />
        {/* <FeaturesSection /> 
        <BenefitsSection />
        <PricingSection />
        <ContactSection /> */}
      </main>

      {isSignupOpen && (
        <SignupModal
          isOpen={isSignupOpen}
          onClose={() => setIsSignupOpen(false)}
          onSignUpSuccess={() => {
            setIsSignupOpen(false);
            alert('회원가입 완료!');
          }}
        />
      )}
    </div>
  );
}
