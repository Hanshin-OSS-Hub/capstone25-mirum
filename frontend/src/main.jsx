import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AuthProvider from './features/auth/context/AuthContext.jsx';
import './index.css';

// import.meta.env.MODE: 현재 실행 모드 (development 또는 production)
// import.meta.env.DEV: 개발 서버(npm run dev)로 실행 중이면 true, 아니면 false.
// import.meta.env.PROD: 프로덕션 빌드(npm run build)로 실행 중이면 true, 아니면 false.

async function enableMocking() {
  // 개발 환경이 아니면(배포 환경 등) 실행하지 않음
  if (import.meta.env.PROD) {
    return;
  }

  // 개발 환경일 때만 browser.js를 import 하고 worker를 시작함
  const { worker } = await import('./mocks/browser');

  // Service Worker 시작!
  return worker.start();
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    // <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>,
    // </StrictMode>
  );
});
