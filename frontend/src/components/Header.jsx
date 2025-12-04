import { useState, useEffect } from "react";
// import { logout } from '../utils/auth';
import LoginModal from "../pages/Login";
import SignupModal from "../pages/Signupmodal";

/**
 * 애플리케이션의 헤더 컴포넌트.
 * 로그인 상태에 따라 '로그인' 또는 '로그아웃' 버튼을 표시합니다.
 * @param {object} props
 * @param {() => void} props.onLoginClick - 로그인 버튼 클릭 시 호출될 함수
 */
export const Header = ({ onLoginClick }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // useEffect(() => {
  //   // 컴포넌트가 마운트될 때 localStorage를 확인하여 로그인 상태를 설정합니다.
  //   const token = localStorage.getItem('accessToken');
  //   setIsLoggedIn(!!token);
  // }, []);


  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const navigateToDashboard = () => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE("/dashboard");
    }
  };

  const navigateToHome = () => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE("/home");
    }
  };

  const navigateToLogin = () => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE("/login");
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={navigateToHome}
                className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                style={{ fontFamily: '"Pacifico", serif' }}
              >
                MIRUM
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-3">
              {/* <button
                onClick={() => scrollToSection("features")}
                className="text-gray-700 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                기능
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="text-gray-700 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                장점
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-gray-700 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                요금제
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-700 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                문의
              </button> */}
              <button
                onClick={() => setIsLoginOpen(true)}
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
                  onClick={navigateToDashboard}
                  className="text-left bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors mt-2 cursor-pointer whitespace-nowrap"
                >
                  로그인/회원가입
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={() => {
              setIsLoginOpen(false);
              if (window.REACT_APP_NAVIGATE) {
                  window.REACT_APP_NAVIGATE("/dashboard");
              }
          }}
          onClickSignUp={() => {
              setIsLoginOpen(false);
              setIsSignupOpen(true);
          }}
      />

      <SignupModal
          isOpen={isSignupOpen}
          onClose={() => setIsSignupOpen(false)}
          onSignUpSuccess={() => {
              setIsSignupOpen(false);
                alert("회원가입 완료!");
          }}
      />
    </>
  );
};
