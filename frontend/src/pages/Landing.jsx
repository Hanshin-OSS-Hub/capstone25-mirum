import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import LoginModal from '@/features/auth/components/Login.jsx';
import RegisterModal from '@/features/auth/components/SignupModal.jsx';
import { IconClose, IconMenu } from '@/shared/assets/icons.js';
import { HeroSection } from '@/shared/components/index.js';

/**
 * 랜딩 페이지 컴포넌트
 */
export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-lg shadow-blue-100">
                M
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">Mirum</span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden items-center space-x-2 md:flex">
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="cursor-pointer whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                회원가입
              </button>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="ml-2 cursor-pointer whitespace-nowrap rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 hover:shadow-blue-200 active:scale-95"
              >
                로그인
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="rounded-xl p-2 text-gray-600 outline-none transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {isMenuOpen ? <IconClose size={24} /> : <IconMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isMenuOpen && (
          <div className="animate-in slide-in-from-top-4 border-t border-gray-100 bg-white px-4 py-6 duration-300 md:hidden">
            <div className="flex flex-col space-y-4">
              <button
                // onClick={() => navigate('/login')}
                onClick={() => setIsRegisterOpen(true)}
                className="w-full rounded-xl px-4 py-3 text-left text-base font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                회원가입
              </button>
              <button
                // onClick={() => navigate('/login')}
                onClick={() => setIsLoginOpen(true)}
                className="w-full rounded-xl bg-indigo-600 px-4 py-4 text-center text-base font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700"
              >
                로그인
              </button>
            </div>
          </div>
        )}
      </header>

      {isLoginOpen ? (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          onCancel={() => setIsLoginOpen(false)}
          onLoginSuccess={() => {
            setIsLoginOpen(false);
            navigate('/dashboard');
          }}
        />
      ) : null}
      {isRegisterOpen ? (
        <RegisterModal
          isOpen={true}
          onClose={() => setIsRegisterOpen(false)}
          onCancel={() => setIsRegisterOpen(false)}
          onSignupSuccess={() => {
            setIsRegisterOpen(false);
            setIsLoginOpen(true); // 회원가입 후 로그인 모달로 유도
          }}
        />
      ) : null}

      {/* Main Content */}
      <main>
        <HeroSection
          onLoginOpen={() => setIsLoginOpen(true)}
          onRegisterOpen={() => setIsRegisterOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-center gap-2 opacity-50 grayscale">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-600 text-xs font-black text-white">
              M
            </div>
            <span className="text-lg font-bold tracking-tighter text-gray-900">Mirum</span>
          </div>
          <p className="text-sm font-medium text-gray-400">
            &copy; 2026 Mirum Project. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
