// src/Loginmodal.jsx
import { useState } from 'react';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock.js';

export default function Signup({ isOpen, onClose, onSignupSuccess }) {
  const [userId, setUserId] = useState(''); // 아이디 (username)
  const [password, setPassword] = useState(''); // 비밀번호
  const [email, setEmail] = useState(''); // 이메일
  const [nickname, setNickname] = useState(''); // 닉네임
  const [error, setError] = useState('');

  useBodyScrollLock(isOpen);

  // 모달이 닫혀 있으면 아무 것도 안 그리기
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // 카드가 아니라 회색 배경을 클릭했을 때 닫기
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // ✅ 실제 백엔드 회원가입: fetch로 서버에 요청 보내기
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 4개 다 채워졌는지 확인
    if (!userId || !password || !email || !nickname) {
      setError('아이디, 비밀번호, 이메일, 닉네임을 모두 입력해주세요.');
      return;
    }

    try {
      const res = await fetch('/api/user', {
        // 🔹 회원가입 엔드포인트 주소는 백엔드랑 맞춰서 필요하면 수정
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userId, // 백엔드 필드 이름 username
          password,
          email,
          nickname,
        }),
      });

      // 상태코드에 따라 에러 처리
      if (!res.ok) {
        if (res.status === 409) {
          setError('이미 사용 중인 아이디입니다.');
          return;
        }
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      const data = await res.json();

      // 필요하면 회원가입 후 자동 로그인처럼 사용
      if (onSignupSuccess) {
        onSignupSuccess(data); // Header/App 쪽으로 유저 정보 전달
      }

      if (onClose) {
        onClose(); // 회원가입 성공 후 모달 닫기
      }
    } catch (err) {
      console.error(err);
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const inputClass =
    'rounded-2xl border-[1.5px] border-border bg-muted/40 px-4 py-3.5 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-card focus:ring-4 focus:ring-primary/15';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/45 p-4 font-sans"
      onMouseDown={handleOverlayClick}
      data-testid="overlay"
    >
      <div className="relative w-full max-w-[440px] rounded-[32px] border border-border bg-card px-10 pb-10 pt-12 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        <button
          type="button"
          className="absolute right-[22px] top-[18px] border-none bg-transparent text-xl text-muted-foreground transition-colors hover:text-foreground"
          onClick={onClose}
        >
          ✕
        </button>

        <h1 className="mb-10 text-[32px] font-bold tracking-tight text-foreground">회원가입</h1>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="mb-2 text-sm text-muted-foreground">아이디</label>
            <input
              type="text"
              className={inputClass}
              placeholder="아이디를 입력하세요"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-sm text-muted-foreground">비밀번호</label>
            <input
              type="password"
              className={inputClass}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-sm text-muted-foreground">이메일</label>
            <input
              type="email"
              className={inputClass}
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-sm text-muted-foreground">닉네임</label>
            <input
              type="text"
              className={inputClass}
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {error && <div className="mt-1.5 text-xs text-red-600">{error}</div>}

          <button
            type="submit"
            className="mt-3 w-full rounded-[20px] border-none bg-[#594adc] py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#3f2edc]"
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}
