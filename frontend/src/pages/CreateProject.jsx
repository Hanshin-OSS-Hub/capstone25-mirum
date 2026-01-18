import {useState} from "react";
import './modal.css';
import {api} from '../api/client';

const USE_Mock = import.meta.env.VITE_USE_MOCK === 'true';

export default function CreateProject(props) {
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

    /** [백엔드 개발자 참고]
      프론트엔드에서 프로젝트 생성 시 POST /project로 아래와 같은 JSON을 전송합니다:
      {
        "title": <string>,
        "description": <string>
      }

      서버는 아래와 같은 형식의 데이터를 JSON으로 반환해야 합니다
      // 프론트엔드에서 입력값으로 state를 즉시 갱신할 수도 있지만,
      // 서버에서 반환된 프로젝트 객체로 상태를 갱신하는 이유는
      // 1) 서버(DB)가 최종적이고 신뢰할 수 있는 데이터 소스(authoritative source)이기 때문이며,
      // 2) 서버에서 실제로 저장된 값(예: id 자동 생성, 멤버/리더 자동 추가, 권한, 기타 비즈니스 로직 반영 등)이
      //    프론트엔드 입력값과 다를 수 있기 때문입니다.
      // 따라서 서버 응답을 기준으로 상태를 동기화하면 데이터 일관성과 신뢰성을 보장할 수 있습니다.
      {
        "id": <string|number>,
        "projectName": <string>,
        "description": <string>,
        "progress": <number>,
        "members": [
          {
            "userId": <string|number>,
            "username": <string>,
            "role": <string> // 예: "LEADER"
          }
        ],
        "day": <string> // ISO 날짜
      }
    */
    const fakeCreateProjectAPI = (projectData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newProject = {
                    id: Math.floor(Math.random() * 1000) + 1, // 임의의 프로젝트 ID 생성
                    projectName: projectData.title,
                    description: projectData.description,
                    progress: 0,
                    // 생성한 유저를 리더로 추가 (임의로 userId 1 사용)
                    members: [
                        { userId: 1, username: "qwer", role: "LEADER", name: "미룸 데모 유저", profileImg: null, email: "demo@mirum.com" }
                    ], 
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };

                resolve({
                    success: true,
                    message: "프로젝트가 (데모) 생성되었습니다.",
                    data: newProject,
                });
            }, 100); // 0.1초 지연을 시뮬레이션하여 로딩 상태를 확인
        });
    };

    const handleCreateProjectApi = async () => {
        return api.post('project', {
            projectName: projectTitle,
            description: projectDesc,
        });
    }

    const handleCreateProject = USE_Mock ? fakeCreateProjectAPI : handleCreateProjectApi;

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
            const data = await handleCreateProject();
            // 성공 콜백 함수 호출
            if (props.onCreateProjectSuccess) {
                props.onCreateProjectSuccess(data); // 생성된 프로젝트 데이터를 전달
            }
            handleClose();
        }
        catch (error) {
            alert(error.message || "프로젝트 생성에 실패했습니다.")
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

                    <button disabled={!projectTitle.trim()} type="submit" className={!projectTitle.trim() ? "login-secondary-button" : "login-button"}>
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