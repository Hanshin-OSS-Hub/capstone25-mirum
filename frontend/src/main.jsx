import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AuthProvider from './features/auth/context/AuthContext.jsx';
import './index.css';
import { Toaster } from './shared/components/ui/index.js';
import { applyDomTheme, readThemePreference } from './shared/lib/theme.js';

applyDomTheme(readThemePreference());

/**
 * 개발 환경에서 MSW(Mock Service Worker)를 활성화합니다.
 * 프로덕션 환경(import.meta.env.PROD)에서는 실행되지 않습니다.
 * @returns {Promise<ServiceWorkerRegistration | undefined>}
 */
// async function enableMocking() {
//   if (import.meta.env.PROD) {
//     return;
//   }
//
//   const { worker } = await import('./mocks/browser');
//   return worker.start({
//     onUnhandledRequest(request, print) {
//       const { pathname } = new URL(request.url);
//
//       // API 요청만 모킹 대상으로 간주하고, 나머지(라우팅/정적 자산)는 완전히 우회합니다.
//       if (pathname.startsWith('/api/')) {
//         print.warning();
//       }
//     },
//   });
// }

// 서비스 워커 시작 후 애플리케이션 렌더링
// enableMocking().then(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  createRoot(rootElement).render(
    // NOTE: 개발 단계의 잠재적 버그 식별을 위해 StrictMode 활성화를 권장합니다.
    // 현재는 레거시 라이브러리 호환성 또는 중복 호출 방지를 위해 주석 처리됨.
    // <StrictMode>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>,
    // </StrictMode>
  );
// });
