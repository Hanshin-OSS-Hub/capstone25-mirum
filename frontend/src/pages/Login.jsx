import { useState } from "react";
import './modal.css';

function Login(props) {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    if (!props.isOpen)
        return null;

    /**
     * https://velog.io/@sunkim/Javascript-e.target과-e.currentTarget의-차이점
     event.target: 이벤트가 발생한 요소 (자식 태그?)
     event.currentTarget: 이벤트가 발생한 요소 전체 (부모+자식)
     
     (cf) onClose 파라미터 (함수)가 제대로 안 넘어올 수도 있으니 나름 예외처리(?)
     */

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget && props.onClose)
            props.onClose();
    }

    /**
     * https://pa-pico.tistory.com/20
     event.preventDefault(): <a> 나 <submit(?)> 처럼 자체 기능이 탑재된
         태그들의 동작을 못하게 하는 함수(?).

     (cf) event.stopPropagation(): 자식 태그에 연결된 이벤트 동작이
     부모 요소에서도 작동하지 않도록 방지하는 함수(?).
     */
    
    const handleSubmit = async (event) =>  {
        event.preventDefault();
        setError("");

        if (!userName || !password) {
            setError("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        try {
            // const response = await fetch("http://localhost:8080/login", {
            //     method: "POST",
            //     headers: {"Content-Type": "application/json"},
            //     body: JSON.stringify({userName: userName, password: password}),
            // });
            //
            // // 'throw' of exception caught locally 경고: try 내부에서 강제로 예외 터뜨리지 말라고 하네요. 왜지?
            // // https://kyounghwan01.github.io/blog/JS/JSbasic/thorw-locally/
            // if (!response.ok)
            //     return Promise.reject( { message: response.statusText, status: response.status } );
            //     // throw new Error("Failed to login");
            //
            // const data = await response.json();
            // // ✅ 여기서 토큰을 localStorage에 저장합니다.
            // localStorage.setItem("accessToken", data.accessToken);
            // localStorage.setItem("refreshToken", data.refreshToken);
            //
            // if (props.onLoginSuccess)
            //     props.onLoginSuccess();

            // --- 데모용 코드 ---
            const fakeUserData = {
                userName,
                name: "미룸 데모 유저",
                accessToken: "demo-access-token-123",
                refreshToken: "demo-refresh-token-456",
            };

            // ✅ 여기서 토큰을 localStorage에 저장합니다.
            localStorage.setItem("accessToken", fakeUserData.accessToken);
            localStorage.setItem("refreshToken", fakeUserData.refreshToken);

            if (props.onLoginSuccess)
                props.onLoginSuccess();

        } catch (error) {
            setError(error.message || "Failed to fetch");
        }
    }

    return (
        <>
          <div className="login-overlay" onClick={handleOverlayClick}>
            <div className="login-card">
                {/* 닫기 버튼 */}
                <button
                    type="button"
                    className="login-close-btn"
                    onClick={props.onClose}
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

                    <button type="submit" className="login-button">
                        로그인
                    </button>

                    <button
                        type="button"
                        className="login-secondary-button"
                        onClick={() => {
                            props.onClickSignUp();
                        }}
                    >
                        계정이 없어요
                    </button>
                </form>
            </div>
          </div>
        </>
    );
}

export default Login;