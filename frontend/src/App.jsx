import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import AppRoutes from './utils/AppRoutes.jsx';

/**
 * 전역 QueryClient 인스턴스 생성 및 기본 옵션 설정
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 fresh 상태로 유지
      gcTime: 1000 * 60 * 30, // 30분 후 캐시 가비지 컬렉션 (기존 cacheTime)
      retry: 1, // 실패 시 1회만 재시도
      refetchOnWindowFocus: false, // 탭 전환 시 자동 리페칭 끔
    },
  },
});

/**
 * 애플리케이션 루트 컴포넌트
 * 전역 컨텍스트(Query, Router)를 주입합니다.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
