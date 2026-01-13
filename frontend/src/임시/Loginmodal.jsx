// src/Loginmodal.jsx
import { useState } from "react";
import "./Signupmodal.css";

export default function Login({ isOpen, onClose, onLoginSuccess }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 모달이 닫혀 있으면 아무 것도 안 그리기
 if (!isOpen) return null;

const handleOverlayClick = (e) => {
  // 카드가 아니라 회색 배경을 클릭했을 때만 닫기
  if (e.target === e.currentTarget && onClose) {
    onClose();
  }
};

// ✅ 실제 백엔드 로그인: fetch로 서버에 요청 보내기
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!userId || !password) {
    setError("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });

    // 상태코드에 따라 에러 처리
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const data = await res.json();
    console.log("로그인 성공", data);

    // 필요하면 토큰 저장
    // localStorage.setItem("accessToken", data.accessToken);

    if (onLoginSuccess) {
      onLoginSuccess(data); // Header/App 쪽으로 유저 정보 전달
    }

    if (onClose) {
      onClose(); // 로그인 성공 후 모달 닫기
    }
  } catch (err) {
    console.error(err);
    setError("네트워크 오류가 발생했습니다.");
  }
};


// ✅ 가라 로그인: 아이디/비밀번호만 채워져 있으면 '성공' 처리
    //   // 진짜처럼 보이게 최소한의 검증만
//   if (!userId || !password) {
//     setError("아이디와 비밀번호를 입력해주세요.");
//     return;
//   }

//   // 여기서부터는 그냥 데모용 가짜 유저 데이터
//   const fakeUserData = {
//     userId,
//     name: "미룸 데모 유저",
//     token: "demo-token",
//   };

//   // Header에서 넘겨준 onLoginSuccess 호출 → 대시보드로 이동
//   if (onLoginSuccess) {
//     onLoginSuccess(fakeUserData);
//   }
// };

  return (
    <div className="login-overlay" onClick={handleOverlayClick}>
      <div className="login-card">
        {/* 닫기 버튼 */}
        <button
          type="button"
          className="login-close-btn"
          onClick={onClose}
        >
          ✕
        </button>

        <h1 className="login-title">로그인</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">아이디</label>
            <input
              type="text"
              className="login-input"
              placeholder="아이디를 입력하세요"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label className="login-label">비밀번호</label>
            <input
              type="password"
              className="login-input"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="login-error">{error}</div>}
          </div>

          <button type="submit" className="login-button">
            로그인
          </button>

          <button
            type="button"
            className="login-secondary-button"
            onClick={() => {
              console.log("계정이 없어요 클릭");
            }}
          >
            계정이 없어요
          </button>
        </form>
      </div>
    </div>
  );
}
