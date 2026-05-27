import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import { LoadingSpinner } from '@/shared/components/index.js';

/**
 * 소셜 로그인 콜백 페이지 (/cookie)
 *
 * 백엔드 흐름:
 *   1. 소셜 로그인 성공 → SocialSuccessHandler 실행
 *   2. refreshToken 쿠키 설정
 *   3. 백엔드가 이 페이지(http://localhost:5173/cookie)로 redirect
 *   4. POST /api/jwt/exchange 호출 → 쿠키의 refreshToken을 읽어 { accessToken, refreshToken } 반환
 *
 * DEV(MSW) 흐름:
 *   - ?code=mock-...&provider=... 파라미터를 받아 MSW mock 토큰으로 바로 로그인
 */
export default function CookieCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const calledRef = useRef(false);

  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    (async () => {
      try {
        let tokens;
        let responseBody;

        // 쿠키에 담긴 refreshToken으로 교환 (body 불필요)
        const res = await fetch(`/api/jwt/exchange`, {
          method: 'POST',
          credentials: 'include', // refreshToken 쿠키 자동 포함
        });

        if (!res.ok) throw new Error(`토큰 교환 실패 (${res.status})`);
        responseBody = await res.json();

        // 백엔드 공통 응답 구조(success, data)인 경우 data 추출
        tokens = responseBody.data || responseBody;

        // { accessToken, refreshToken } 구조 그대로 AuthContext.login() 전달
        await login(tokens);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('[OAuth Cookie] 토큰 교환 실패:', err);
        setErrorMsg(err.message || '로그인 처리 중 오류가 발생했습니다.');
      }
    })();
  }, [searchParams, navigate, login]);

  // 에러 발생 시 사용자에게 안내 + 재시도/홈 버튼
  if (errorMsg) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
          ⚠️
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">로그인에 실패했습니다</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">{errorMsg}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/', { replace: true })}
            className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-muted"
          >
            홈으로
          </button>
          <button
            onClick={() => {
              calledRef.current = false;
              setErrorMsg(null);
              window.dispatchEvent(new Event('openLoginModal'));
              navigate('/', { replace: true });
            }}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            다시 로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
      <LoadingSpinner size="lg" label="로그인 처리 중입니다..." />
      <p className="text-sm font-medium text-muted-foreground">
        잠시만 기다려 주세요
      </p>
    </div>
  );
}
