import { Navigate } from 'react-router-dom';

/**
 * 로그인한 사용자만 접근할 수 있는 경로를 위한 컴포넌트입니다.
 * @param {object} props
 * @param {React.ReactNode} props.children - 보호할 페이지 컴포넌트
 */
const PrivateRoute = ({ children }) => {
  // 1. localStorage에서 accessToken을 가져와 로그인 상태를 확인합니다.
  const isAuthenticated = !!localStorage.getItem('accessToken');

  // 2. 로그인 상태이면 자식 컴포넌트(요청한 페이지)를 렌더링하고,
  //    아니면 홈페이지로 리디렉션합니다.
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
