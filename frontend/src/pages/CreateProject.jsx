import { useState } from "react";
import './modal.css';
import { api } from './client';

function CreateProject(props) {
    const [projectTitle, setProjectTitle] = useState("");
    const [projectDesc, setProjectDesc] = useState("");
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

    const handleClose = () => {
        setProjectTitle("");        // 제목 비우기
        setProjectDesc("");         // 설명 비우기

        if (props.onClose) {        // 부모에서 넘긴 onClose 호출
            props.onClose();
        }
    }

        // 데모용 가짜 API 함수 (네트워크 지연 시뮬레이션)
    const fakeCreateProjectAPI = (projectData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
            const newProject = {
                id: Math.floor(Math.random() * 1000) + 1, // 임의의 ID 생성
                title: projectData.title,
                description: projectData.description,
                progress: 0,
                members: ["나 미룸"], // 배열로 전달
                day: new Date().toISOString(),
            };

            resolve({
                success: true,
                message: "프로젝트가 (데모) 생성되었습니다.",
                data: newProject,
            });
            }, 800); // 0.8초 지연을 시뮬레이션하여 로딩 상태를 확인
        });
    };

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

        if (!projectTitle.trim()) {
            setError("프로젝트 제목을 입력해주세요.");
            return;
        }

        try {
            // --- 데모용 코드 ---
            const response = await fakeCreateProjectAPI({ title: projectTitle, description: projectDesc });

            // // 3. 올바른 API 엔드포인트와 데이터로 요청
            // const response = await api.post("/projects", { 
            // title: projectTitle, 
            // description: projectDesc
            // });
            
            // 성공 콜백 함수 호출
            if (props.onCreateProjectSuccess) {
                props.onCreateProjectSuccess(response.data); // 생성된 프로젝트 데이터를 전달
            }

            handleClose();

        } catch (error) {
            setError(error.message || "프로젝트 생성에 실패했습니다.");
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
                    onClick={props.onClose}
                >
                    ✕
                </button>

                <h1 className="login-title">프로젝트 생성</h1>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label className="login-label">프로젝트 이름</label>
                        <input
                            type="text"
                            className="login-input"
                            placeholder="프로젝트 이름을 입력하세요"
                            value={projectTitle}
                            onChange={(event) => setProjectTitle(event.target.value)}
                        />
                    </div>
                    <div className="login-field">
                        <label className="login-label">설명</label>
                        <input
                            type="text"
                            className="login-input"
                            placeholder="프로젝트를 간단히 설명해주세요"
                            value={projectDesc}
                            onChange={(event) => setProjectDesc(event.target.value)}
                        />
                        {error && <div className="login-error">{error}</div>}
                    </div>

                    <button type="submit" className="login-button">
                        생성하기
                    </button>

                    <button
                        type="button"
                        className="login-secondary-button"
                        onClick={() => {
                            props.onClose();
                        }}
                    >
                        취소
                    </button>
                </form>
            </div>
          </div>
        </>
    );
}

export default CreateProject;