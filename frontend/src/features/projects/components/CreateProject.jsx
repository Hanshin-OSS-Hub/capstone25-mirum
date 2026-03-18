import { useEffect, useState } from 'react';
import { useCreateProject } from '@/features/projects/api/useCreateProject.js';
import '../../auth/components/modal.css';

export default function CreateProject(props) {
  const { isOpen, onClose } = props;
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [error, setError] = useState('');

  const { mutate: createProject } = useCreateProject();

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setProjectTitle(''); // 제목 비우기
    setProjectDesc(''); // 설명 비우기

    if (onClose) {
      props.onClose();
    }
  };

  // const handleOverlayClick = (event) => {
  //   if (event.target === event.currentTarget && props.onClose) handleClose();
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!projectTitle.trim()) {
      setError('프로젝트 제목을 입력해주세요.');
      return;
    }

    createProject(
      {
        projectName: projectTitle,
        description: projectDesc,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  // const fakeCreateProjectAPI = (projectData) => {
  //     return new Promise((resolve) => {
  //         setTimeout(() => {
  //             const newProject = {
  //                 id: Math.floor(Math.random() * 1000) + 1, // 임의의 프로젝트 ID 생성
  //                 projectName: projectData.title,
  //                 description: projectData.description,
  //                 progress: 0,
  //                 // 생성한 유저를 리더로 추가 (임의로 userId 1 사용)
  //                 members: [
  //                     { userId: 1, username: "qwer", role: "LEADER", name: "미룸 데모 유저", profileImg: null, email: "demo@mirum.com" }
  //                 ],
  //                 created_at: new Date().toISOString(),
  //                 updated_at: new Date().toISOString(),
  //             };
  //
  //             resolve({
  //                 success: true,
  //                 message: "프로젝트가 (데모) 생성되었습니다.",
  //                 data: newProject,
  //             });
  //         }, 100); // 0.1초 지연을 시뮬레이션하여 로딩 상태를 확인
  //     });
  // };

  // const handleCreateProject = USE_Mock ? fakeCreateProjectAPI : handleCreateProjectApi;

  return (
    <>
      <div className="login-overlay" /*onMouseDown={handleOverlayClick}*/ data-testid="overlay">
        <div className="login-card">
          {/* 닫기 버튼 */}
          <button type="button" className="login-close-btn" onClick={props.onClose}>
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

            <button
              disabled={!projectTitle.trim()}
              type="submit"
              className={!projectTitle.trim() ? 'login-secondary-button' : 'login-button'}
            >
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
