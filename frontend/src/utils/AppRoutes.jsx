import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import PrivateRoute from '@/utils/PrivateRoute.jsx';
import SocialLoginModal from '@/features/auth/components/SocialLoginModal.jsx';
import { LoadingSpinner, NotFoundState } from '@/shared/components/index.js';

// 1. 페이지 컴포넌트 지연 로딩 (Code Splitting)
const Landing = lazy(() => import('@/pages/Landing.jsx'));
const Home = lazy(() => import('@/pages/Home.jsx'));
const Task = lazy(() => import('@/pages/Task.jsx'));
const CookieCallback = lazy(() => import('@/pages/OAuthCallback.jsx'));

function NotFoundPage() {
  return <NotFoundState message="요청하신 페이지를 찾을 수 없습니다." />;
}

/**
 * 프로젝트 전체 라우팅 설정 컴포넌트
 * - 페이지 단위 코드 분할 및 인증 가드(PrivateRoute) 적용
 */
export default function AppRoutes() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const consumePostLoginRedirect = () => {
    const redirectPath = sessionStorage.getItem('postLoginRedirect');
    if (redirectPath) {
      sessionStorage.removeItem('postLoginRedirect');
      return redirectPath;
    }
    return '/dashboard';
  };

  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
    };
  }, []);

  /**
   * 로그인 모달 닫기 핸들러
   * @param {'success' | 'canceled'} result
   */
  const handleModalClose = (result) => {
    setIsLoginModalOpen(false);
    if (result === 'canceled') {
      localStorage.clear();
      sessionStorage.removeItem('postLoginRedirect');
      navigate('/');
    } else {
      navigate(consumePostLoginRedirect());
    }
  };

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" label="화면을 준비 중입니다..." />
        </div>
      }
    >
      <Routes>
        {/* 공개 경로 */}
        <Route path="/" element={<Landing />} />
        <Route path="/cookie" element={<CookieCallback />} />

        {/* 보호된 경로 (인증 필요) */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <PrivateRoute>
              <Task />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* 세션 만료 시 소셜 로그인 모달 */}
      {isLoginModalOpen && (
        <SocialLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => {
            setIsLoginModalOpen(false);
            localStorage.clear();
            sessionStorage.removeItem('postLoginRedirect');
            navigate('/');
          }}
          onProviderClick={() => {
            setIsLoginModalOpen(false);
          }}
        />
      )}
    </Suspense>
  );
}
