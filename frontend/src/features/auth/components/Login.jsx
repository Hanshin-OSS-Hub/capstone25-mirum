import { useState } from 'react';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';
import { useAuth } from '@/features/auth/hooks/useAuth.js';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock.js';

function Login(props) {
  const { login } = useAuth();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useBodyScrollLock(true);

  // ------------------------------------------------------------------------
  // 참고 자료:
  //  * https://velog.io/@sunkim/Javascript-e.target과-e.currentTarget의-차이점
  //  event.target: 이벤트가 발생한 요소 (자식 태그?)
  //  event.currentTarget: 이벤트가 발생한 요소 전체 (부모+자식)

  //  (cf) onClose 파라미터 (함수)가 제대로 안 넘어올 수도 있으니 나름 예외처리(?)
  //  ------------------------------------------------------------------------

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && props.onClose) props.onClose();
  };

  const handleCancel = () => {
    props.onCancel('canceled'); // ❌ 닫기 버튼 누르면 '취소' 알림
  };

  //  ------------------------------------------------------------------------
  //  참고 자료:
  //  * https://pa-pico.tistory.com/20
  //  event.preventDefault(): <a> 나 <submit(?)> 처럼 자체 기능이 탑재된
  //      태그들의 동작을 못하게 하는 함수(?).
  //
  //  (cf) event.stopPropagation(): 자식 태그에 연결된 이벤트 동작이
  //  부모 요소에서도 작동하지 않도록 방지하는 함수(?).
  //  ------------------------------------------------------------------------

  /**
   * 로그인 API
   * @param {Event} event - 폼 제출 이벤트
   * @returns {Promise<void>} POST /login API 호출 후 인증 토큰 및 사용자 정보를 AuthContext에 저장
   * @description username과 password를 서버에 전송하여 인증 후, 토큰과 사용자 정보를 받아 login() 호출
   * 서버 응답 예시: { "accessToken": "...", "refreshToken": "..." }
   */

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!userName || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userName,
          password: password,
        }),
      });

      if (!response.ok) {
        // 2. 에러 체크 (필수)
        throw new Error('로그인 실패');
      }

      const tokenData = (await response.json()).data;

      if (!tokenData || !tokenData.accessToken || !tokenData.refreshToken) {
        throw new Error('토큰 정보를 받아오지 못했습니다.');
      }

      // 1. 토큰을 임시로 localStorage에 저장 (프로필 조회를 위한 인증용)
      localStorage.setItem('accessToken', tokenData.accessToken);
      localStorage.setItem('refreshToken', tokenData.refreshToken);

      // 2. 사용자 프로필 정보 조회 (GET /user)
      let nickname = null;
      let email = null;
      try {
        const userProfile = await api.get('user');
        // 백엔드 응답: { username, social, nickname, email }
        nickname = userProfile?.nickname || null;
        email = userProfile?.email || null;
      } catch (profileError) {
        console.error('사용자 프로필 조회 실패:', profileError);
        // 프로필 조회 실패해도 로그인은 유지
      }

      // 3. 모든 정보를 한 번에 login() 함수로 저장
      login({
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        username: userName,
        nickname: nickname,
        email: email,
      });

      if (props.onLoginSuccess) props.onLoginSuccess();
    } catch (error) {
      notify.error(getErrorMessage(error, '알 수 없는 오류가 발생했습니다.'));
    }
  };

  const submitPrimary =
    'mt-3 w-full rounded-[20px] border-none bg-[#594adc] py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#3f2edc] disabled:pointer-events-none disabled:opacity-50';
  const secondaryBtn =
    'mt-2.5 w-full rounded-[20px] border-none bg-muted py-3.5 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground';

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/45 p-4 font-sans"
        onMouseDown={handleOverlayClick}
        data-testid="overlay"
      >
        <div className="relative w-full max-w-[440px] rounded-[32px] border border-border bg-card px-10 pb-10 pt-12 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
          <button
            type="button"
            className="absolute right-[22px] top-[18px] border-none bg-transparent text-xl text-muted-foreground transition-colors hover:text-foreground"
            onClick={handleCancel}
          >
            ✕
          </button>

          <h1 className="mb-10 text-[32px] font-bold tracking-tight text-foreground">로그인</h1>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label className="mb-2 text-sm text-muted-foreground">아이디</label>
              <input
                type="text"
                className="rounded-2xl border-[1.5px] border-border bg-muted/40 px-4 py-3.5 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/15"
                placeholder="아이디를 입력하세요"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm text-muted-foreground">비밀번호</label>
              <input
                type="password"
                className="rounded-2xl border-[1.5px] border-border bg-muted/40 px-4 py-3.5 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/15"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {error && <div className="mt-1.5 text-xs text-red-600">{error}</div>}
            </div>

            <button
              disabled={!userName || !password}
              type="submit"
              className={!userName || !password ? secondaryBtn : submitPrimary}
            >
              로그인
            </button>

            <button type="button" className={secondaryBtn} onClick={handleCancel}>
              닫기
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
