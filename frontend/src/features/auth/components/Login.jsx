import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import './modal.css';
import { api } from '../../../api/client';

function Login(props) {

    const { login } = useAuth();
    
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    // ------------------------------------------------------------------------
    // 참고 자료:
    //  * https://velog.io/@sunkim/Javascript-e.target과-e.currentTarget의-차이점
    //  event.target: 이벤트가 발생한 요소 (자식 태그?)
    //  event.currentTarget: 이벤트가 발생한 요소 전체 (부모+자식)
     
    //  (cf) onClose 파라미터 (함수)가 제대로 안 넘어올 수도 있으니 나름 예외처리(?)
    //  ------------------------------------------------------------------------

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget && props.onClose)
            props.onClose();
    }

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
     * 
     * @param {Event} event - 폼 제출 이벤트
     * @returns {Promise<void>} POST /login API 호출 후 인증 토큰 및 사용자 정보를 AuthContext에 저장
     * @description username과 password를 서버에 전송하여 인증 후, 토큰과 사용자 정보를 받아 login() 호출
     * 서버 응답 예시: { "accessToken": "...", "refreshToken": "..." }
     */

    const handleSubmit = async (event) =>  {
        event.preventDefault();
        setError("");

        if (!userName || !password) {
            setError("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        try {
            const tokenData = await api.post('login', {
                username: userName,
                password: password 
            });

            if (!tokenData || !tokenData.accessToken || !tokenData.refreshToken) {
                throw new Error("토큰 정보를 받아오지 못했습니다.");
            }

            // 1. 토큰을 임시로 localStorage에 저장 (프로필 조회를 위한 인증용)
            localStorage.setItem("accessToken", tokenData.accessToken);
            localStorage.setItem("refreshToken", tokenData.refreshToken);
            
            // 2. 사용자 프로필 정보 조회 (GET /user)
            let nickname = null;
            let email = null;
            try {
                const userProfile = await api.get("user");
                // 백엔드 응답: { username, social, nickname, email }
                nickname = userProfile?.nickname || null;
                email = userProfile?.email || null;
            } catch (profileError) {
                console.error("사용자 프로필 조회 실패:", profileError);
                // 프로필 조회 실패해도 로그인은 유지
            }

            // 3. 모든 정보를 한 번에 login() 함수로 저장
            login({
                accessToken: tokenData.accessToken,
                refreshToken: tokenData.refreshToken,
                username: userName,
                nickname: nickname,
                email: email
            });

            if (props.onLoginSuccess)
                props.onLoginSuccess();

        } catch (error) {
            alert(error.message || "알 수 없는 오류가 발생했습니다.");
        }
    }

    return (
        <>
          <div className="login-overlay" onMouseDown={handleOverlayClick} data-testid="overlay">
            <div className="login-card">
                {/* 닫기 버튼 */}
                <button
                    type="button"
                    className="login-close-btn"
                    onClick={handleCancel}
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
                            value={userName}
                            onChange={(event) => setUserName(event.target.value)}
                        />
                    </div>
                    <div className="login-field">
                        <label className="login-label">비밀번호</label>
                        <input
                            type="password"
                            className="login-input"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                        {error && <div className="login-error">{error}</div>}
                    </div>

                    <button disabled={!userName || !password} type="submit" className={!userName || !password ? "login-secondary-button" : "login-button"}>
                        로그인
                    </button>

                    <button
                        type="button"
                        className="login-secondary-button"
                        onClick={handleCancel}
                    >
                        닫기
                    </button>
                </form>
            </div>
          </div>
        </>
    );
}

export default Login;