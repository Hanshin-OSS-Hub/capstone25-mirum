import { Navigate } from 'react-router-dom';
import { useViewport } from '../useViewport';

/**
 * 데스크톱 환경에서만 접근 가능한 경로를 위한 컴포넌트.
 * 모바일일 경우 redirectTo 경로로 리디렉션합니다.
 * @param {{children: React.ReactNode, redirectTo: string}} props
 */
export const DesktopRoute = ({ children, redirectTo }) => {
  const { isMobile } = useViewport();
  return !isMobile ? children : <Navigate to={redirectTo} replace />;
};

/**
 * 모바일 환경에서만 접근 가능한 경로를 위한 컴포넌트.
 * 데스크톱일 경우 redirectTo 경로로 리디렉션합니다.
 * @param {{children: React.ReactNode, redirectTo: string}} props
 */
export const MobileRoute = ({ children, redirectTo }) => {
  const { isMobile } = useViewport();
  return isMobile ? children : <Navigate to={redirectTo} replace />;
};
