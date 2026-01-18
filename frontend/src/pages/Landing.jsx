import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import LoginModal from "./Login";
import SignupModal from "./Signupmodal";
import { HeroSection } from '../components/HeroSection';
// import { FeaturesSection } from './components/FeaturesSection';
// import { BenefitsSection } from './components/BenefitsSection';
// import { PricingSection } from './components/PricingSection';
// import { ContactSection } from './components/ContactSection';
// import { Footer } from './components/Footer';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const handleLoginClick = () => {
    // 📢 "야! 로그인 모달 좀 열어줘!" 라고 방송
    window.dispatchEvent(new CustomEvent("openLoginModal"));
  };

  // 로그인 상태면 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div
                className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                style={{ fontFamily: '"Pacifico", serif' }}
              >
                MIRUM
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => {handleLoginClick()}}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                로그인
              </button>

              <button
                onClick={() => setIsSignupOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                회원가입
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i
                className={`${
                  isMenuOpen ? "ri-close-line" : "ri-menu-line"
                } text-xl`}
              ></i>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-left text-gray-700 hover:text-indigo-600 transition-colors py-2 cursor-pointer"
                >
                  기능
                </button>
                <button
                  onClick={() => scrollToSection("benefits")}
                  className="text-left text-gray-700 hover:text-indigo-600 transition-colors py-2 cursor-pointer"
                >
                  장점
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-left text-gray-700 hover:text-indigo-600 transition-colors py-2 cursor-pointer"
                >
                  요금제
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-left text-gray-700 hover:text-indigo-600 transition-colors py-2 cursor-pointer"
                >
                  문의
                </button>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="text-left bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors mt-2 cursor-pointer whitespace-nowrap"
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

      {/* Modals */}
      {isLoginOpen && (
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={() => {
            setIsLoginOpen(false);
            navigate("/dashboard");
          }}
          onClickSignUp={() => {
            setIsLoginOpen(false);
            setIsSignupOpen(true);
          }}
        />
      )}

      {isSignupOpen && (
        <SignupModal
          isOpen={isSignupOpen}
          onClose={() => setIsSignupOpen(false)}
          onSignUpSuccess={() => {
            setIsSignupOpen(false);
            alert("회원가입 완료!");
          }}
        />
      )}
    </div>
  );
}
