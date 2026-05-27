import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import SocialLoginModal from '@/features/auth/components/SocialLoginModal.jsx';
import { HeroSection } from '@/shared/components/index.js';

/**
 * 랜딩 페이지 컴포넌트
 */
export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [isSocialLoginOpen, setIsSocialLoginOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-lg shadow-blue-100">
                M
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">Mirum</span>
            </div>

            {/* Desktop: 로그인 버튼만 */}
            <nav className="hidden items-center md:flex">
              <button
                onClick={() => setIsSocialLoginOpen(true)}
                className="ml-2 cursor-pointer whitespace-nowrap rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
              >
                로그인
              </button>
            </nav>

            {/* Mobile: 로그인 버튼만 */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsSocialLoginOpen(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection onLoginOpen={() => setIsSocialLoginOpen(true)} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-center gap-2 opacity-40">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
              M
            </div>
            <span className="text-lg font-bold tracking-tighter text-foreground">Mirum</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            &copy; 2026 Mirum Project. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 소셜 로그인 모달 */}
      <SocialLoginModal
        isOpen={isSocialLoginOpen}
        onClose={() => setIsSocialLoginOpen(false)}
        onProviderClick={() => setIsSocialLoginOpen(false)}
      />
    </div>
  );
}
