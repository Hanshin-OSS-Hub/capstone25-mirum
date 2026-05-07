import { useNavigate } from 'react-router-dom';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock.js';
import { IconClose } from '@/shared/assets/icons.js';

/** @typedef {'kakao' | 'google'} SocialLoginProvider */

/**
 * OAuth 제공자 선택 모달
 *
 * [DEV]  버튼 클릭 → navigate('/cookie?code=mock-...&provider=...')
 *        MSW가 POST /jwt/exchange 를 가로채 mock 토큰 반환
 *
 * [PROD] 버튼 클릭 → window.location.href = 백엔드 OAuth 시작 URL
 *        백엔드가 소셜 로그인 후 refreshToken 쿠키를 내리고 /cookie 로 redirect
 *        /cookie 페이지에서 POST /jwt/exchange 호출 → accessToken/refreshToken 수신
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen
 * @param {() => void} props.onClose
 */

/** @type {Record<SocialLoginProvider, string>} */
const OAUTH_START_URL = {
  kakao: '/oauth2/authorization/kakao',
  google: '/oauth2/authorization/google',
};

export default function SocialLoginModal({ isOpen, onClose, onProviderClick }) {
  const navigate = useNavigate();
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleOverlayMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const handleProvider = (provider) => {
    if (onProviderClick) {
      onProviderClick(provider);
    }
    if (import.meta.env.DEV) {
      // 개발(MSW): 풀 리로드 없이 /cookie 로 직접 이동
      const mockCode = `mock-${provider}-${Date.now()}`;
      navigate(`/cookie?code=${mockCode}&provider=${provider}`);
    } else {
      // 프로덕션: 브라우저를 백엔드 OAuth 시작 URL로 이동 (fetch 아님, 직접 이동)
      window.location.href = OAUTH_START_URL[provider];
    }
  };

  const btnBase =
    'flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left text-sm font-bold transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={handleOverlayMouseDown}
    >
      <div className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-2xl ring-1 ring-border">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-foreground">시작하기</h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              소셜 계정으로 간편하게 로그인하세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {/* Kakao */}
          <button
            onClick={() => handleProvider('kakao')}
            className={`${btnBase} border-[#FEE500]/60 bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FFD700]`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.477 2 10.9c0 2.795 1.697 5.251 4.27 6.746L5.2 21l4.803-3.18A11.3 11.3 0 0 0 12 18c5.523 0 10-3.477 10-7.1S17.523 3 12 3z" />
            </svg>
            카카오로 시작하기
          </button>

          {/* Google */}
          <button
            onClick={() => handleProvider('google')}
            className={`${btnBase} border-border bg-card text-foreground hover:bg-muted`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 시작하기
          </button>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          로그인 시{' '}
          <span className="font-bold text-foreground">서비스 이용약관</span> 및{' '}
          <span className="font-bold text-foreground">개인정보처리방침</span>에 동의합니다.
        </p>
      </div>
    </div>
  );
}
