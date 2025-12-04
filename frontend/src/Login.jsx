// src/Login.jsx
import { useState } from "react";
import "./Login.css";

export default function Login({ onLoginSuccess }) {   // ← props 추가
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      if (!res.ok) {
        throw new Error("아이디 또는 비밀번호를 확인해주세요.");
      }

      // 백엔드에서 토큰/유저 정보 받았다고 가정
      const data = await res.json();
      console.log("로그인 성공", data);

      // ✅ App.jsx 쪽으로 "성공했다" 알려주기
      if (onLoginSuccess) {
        onLoginSuccess(data); // 필요하면 data 같이 넘겨도 됨
      }
    } catch (err) {
      setError(err.message || "Failed to fetch");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
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
