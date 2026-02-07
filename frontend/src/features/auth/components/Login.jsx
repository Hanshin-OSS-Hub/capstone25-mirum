import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import './modal.css';
import { api } from '../../../api/client';

// 환경 변수로 테스트/API 모드 선택
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const BASE_URL = import.meta.env.VITE_API_URL;

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

    const handleSubmitAPI = async (event) =>  {
        event.preventDefault();
        setError("");

        if (!userName || !password) {
            setError("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: userName, password: password }),
            // credentials: "include",
            // mode: "cors",
            // cache: "no-cache",
            // redirect: "follow",
            // referrerPolicy: "no-referrer",
        })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error("로그인에 실패하였습니다.");
            }

            // 백엔드 응답: ApiResponse 형태
            // { success: true, message: "성공", data: { accessToken, refreshToken } }
            const result = await response.json();
            
            // ApiResponse 구조에서 data 추출
            const tokenData = result?.data || result;
            
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
                nickname = userProfile.nickname || null;
                email = userProfile.email || null;
            } catch (profileError) {
                console.error("사용자 프로필 조회 실패:", profileError);
                //
                // 프로필 조회 실패해도 로그인은 유지 (username만 저장된 상태)
                //
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
        })
        .catch((error) => {
            alert(error.message || "알 수 없는 오류가 발생했습니다.");
        });
    }

    const handleSubmitTest = (event) =>  {
        event.preventDefault();
        setError("");

        if (!userName || !password) {
            setError("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        // --- 데모용 코드 ---
        const fakeUserData = {
            // 토큰 발급
            accessToken: "demo-access-token-123",
            refreshToken: "demo-refresh-token-456",
            // 사용자 정보
            // id: 1,  // 테스트용 고유 ID
            role: "user",
            username: userName,
            nickname: "미룸 데모 유저",
            email: "demo@example.com",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // ✅ login() 함수 호출 → localStorage 저장 + context 업데이트
        login(fakeUserData);
        
        if (props.onLoginSuccess)
            props.onLoginSuccess();
    }

    const handleSubmit = USE_MOCK ? handleSubmitTest : handleSubmitAPI;

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