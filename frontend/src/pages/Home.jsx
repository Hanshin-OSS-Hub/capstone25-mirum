import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
    HiOutlineBell, HiOutlineFolder, HiCheck, HiHome, HiUser // 👈 아이콘 추가 임포트
} from "react-icons/hi2";
import { api } from './client';
import CreateProjectModal from './CreateProject';
import ProfileModal from '../components/ProfileModal';

// 환경 변수로 테스트/API 모드 선택
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function Home() {
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const [projects, setProjects] = useState(() => {
        if (USE_MOCK) {
            const saved = localStorage.getItem("projects");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    // const location = useLocation();

    // // 서버 연결 전, mockProjects에서 삭제된 프로젝트를 필터링하여 초기값으로 사용 (테스트용)
    // const [projects, setProjects] = useState(() => {
    //     if (location.state?.deletedProjectId) {
    //         return mockProjects.filter(p => p.id !== Number(location.state.deletedProjectId));
    //     }
    //     return mockProjects;
    // });

    // // 삭제 후 state 정리만 담당 (필요시)
    // useEffect(() => {
    //     if (location.state?.deletedProjectId) {
    //         navigate(location.pathname, { replace: true, state: null });
    //     }
    // }, [location, navigate]);

    /**
     * [READ] 프로젝트 목록 조회 API
     * 
     * @returns {Promise<void>} GET /projects API 호출 후 프로젝트 목록을 setProjects로 업데이트
     * @description 서버에서 프로젝트 목록을 가져와 상태를 업데이트. 실패 시 alert 표시
     * 
     * 서버 응답 예시:
     * [
     *   {
     *     "id": "uuid-or-projectId",
     *     "projectName": "프로젝트 이름",
     *     "description": "프로젝트 설명",
     *     "taskProgress": 65,           // 진행률 (0-100)
     *     "memberCount": 3,             // 멤버 수
     *     "creationDate": "2024-01-15T00:00:00Z"  // ISO 8601 날짜
     *   },
     *   ...
     * ]
     */

    const handleGetProjectList = async () => {
        api.get('projects')
        .then(response => {
            setProjects(response.data);
        })
        .catch(error => {
            alert(error.message || '프로젝트 목록을 불러오는 데 실패했습니다. 다시 시도해주세요.');
        });
    }

    useEffect(() => {
        if (!USE_MOCK) {
            handleGetProjectList();
        }
    }, []);

    return (
        <>
            <div className="dashboard-container">
                {/* 1. 헤더 영역 */}
                <header className="header" style={ { position: "relative" } }>
                    <div className="header-left">
                        <div className="logo-box">M</div>
                        <span className="logo-text">Mirum</span>
                    </div>
                    <div className="header-right">
                        <button className="profile-btn" style={ { backgroundColor: "transparent" }}>
                            <HiOutlineBell size={20} />
                        </button>
                        <button 
                            className="profile-btn" 
                            onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}
                        >
                            {localStorage.getItem("name")?.charAt(0) || "?"}
                        </button>
                    </div>

                    {isProfileModalOpen && (
                        <ProfileModal 
                            onClose={() => setIsProfileModalOpen(false)} 
                        />
                    )}
                </header>

                {/* 2. 메인 콘텐츠 영역 (회색 배경) */}
                <main className="main-content">
                    <div className="content-inner">

                        {/* 인사말 섹션 */}
                        <section className="greeting-section">
                            <h1>안녕하세요, {localStorage.getItem("name") || "김미룸"}님! 👋</h1>
                            <p>오늘도 팀 프로젝트를 효율적으로 관리해보세요.</p>
                        </section>

                        <CreateProjectModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onCreateProjectSuccess={(data) => {
                                setIsModalOpen(false);
                                alert("프로젝트 생성 완료!");
                                // handleGetProjectList();
                                setProjects((prev) => {
                                    const newProjects = [...prev, data];
                                    localStorage.setItem("projects", JSON.stringify(newProjects));
                                    return newProjects;
                                });
                            }}
                        />

                        {
                            projects.length === 0 ? (
                                <div style={{ textAlign: "center", marginTop: "50px", color: "#666", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                                    <p>진행 중인 프로젝트가 없습니다.</p>
                                    <button className="primary-btn" onClick={() => setIsModalOpen(true)}>+ 새 프로젝트 생성</button>
                                </div>
                            ) : (
                                <>
                                {/* 요약 카드 섹션 (가로 배치) */}
                                <section className="summary-cards">
                                    <div className="card summary-card">
                                        <div className="card-info">
                                            <span>🔥 진행 중인 프로젝트</span>
                                            <strong>{projects.length}개</strong>
                                        </div>
                                        <div className="icon-box blue">🚀</div>
                                    </div>

                                    <div className="card summary-card">
                                        <div className="card-info">
                                            <span>⏰ 금일 마감까지 남은 시간</span>
                                            <strong>3시간 20분</strong> {/* 예시값, 실제 계산 필요 */}
                                        </div>
                                        <div className="icon-box green">⏳</div>
                                    </div>

                                    <div className="card summary-card">
                                        <div className="card-info">
                                            <span>🎯 오늘의 목표 달성률</span>
                                            <strong>60%</strong> {/* 예시값, 실제 계산 필요 */}
                                        </div>
                                        <div className="icon-box purple">📈</div>
                                    </div>
                                </section>

                                {/* 내 프로젝트 섹션 */}
                                <section className="project-section">
                                    <div className="section-header">
                                        <h2>내 프로젝트</h2>
                                        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>+ 새 프로젝트</button>
                                    </div>

                                    <div className="project-grid">
                                    {
                                        projects.map((project) => {
                                            return(
                                                // 1. 최상위 요소에 고유한 'key'를 추가합니다. (project.id가 가장 이상적입니다.)
                                                <div
                                                    key={project.id}
                                                    data-testid="project-card"
                                                    className="card project-card"
                                                    onClick={() => {
                                                        if (USE_MOCK) {
                                                            navigate(`/project/${project.id}`, { state: { project } });
                                                        } else {
                                                            navigate(`/project/${project.id}`);
                                                        }
                                                    }}
                                                >
                                                    <div className="project-header">
                                                    <div className="project-text">
                                                        {/* 2. 하드코딩된 텍스트를 props로 받은 데이터로 교체합니다. */}
                                                        <h2>{project?.projectName}</h2>
                                                        <p className="project-desc">
                                                            <br />
                                                            {
                                                            project?.description?.length > 30 ? project.description.slice(0, 20) : project.description
                                                        }</p>
                                                    </div>
                                                    <div className="project-icon">📂</div>
                                                    </div>

                                                    <div className="progress-bar">
                                                    <div className="full" style={{ width: `${project?.taskProgress}%`, height: 100, backgroundColor: project.progress > 80 ? '#c900fbed' : (project.progress > 30 ? '#2563eb' : '#03f7c2ed') }}></div>
                                                    </div>

                                                    <div className="card-footer">                                                
                                                    <span>👤 {project?.memberCount || 0}명</span>
                                                    <span>📅 {project?.creationDate ? project.creationDate.slice(0, 10) : "-"}</span>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }

                                        {/* 프로젝트 카드 1 */}
                                        {/* <div className="card project-card">
                                            <div className="project-header">
                                                <div className="project-text">
                                                    <h3>마케팅 전략</h3>
                                                    <p className="project-desc">브랜드 전략 수립 및 분석</p>
                                                </div>

                                                <div className="project-icon">📂</div>
                                            </div>

                                            <div className="progress-bar">
                                                <div className="fill" style={{ width: '65%' }}></div>
                                            </div>

                                            <div className="card-footer">
                                                <span>👤 3명</span>
                                                <span>📅 2시간 전</span>
                                            </div>
                                        </div> */}

                                        {/* 프로젝트 카드 2 */}
                                        {/* <div className="card project-card">
                                            <div style = { { "display" : "flex", "gap": "24px"} }>
                                                <h3>마케팅 과제</h3>
                                                <div className="project-icon">📂</div>
                                            </div>
                                            <p className="project-desc">브랜드 전략 수립 및 분석</p>
                                            <div className="progress-bar">
                                                <div className="fill" style={{width: '30%'}}></div>
                                            </div>
                                            <div className="card-footer">
                                                <span>👤 2명</span>
                                                <span>📅 1일 전</span>
                                            </div>
                                        </div>        */}

                                        </div>
                                    </section>
                                </>
                            )
                        }
                        </div>
                    </main>
                </div>
            </>
        // <>
        // {/* Header */}
        //   <header className="header">{/*"bg-white border-b border-gray-200">*/}
        //     <div className="container">
        //       <div>
        //         <div>
        //           <div className="logo">
        //               로고
        //           </div>
        //           <button>
        //               미룸
        //           </button>
        //         </div>
        //       </div>
        //         <div className="img">
        //           <button>알림</button>
        //           <button>내 정보</button>
        //         </div>
        //       </div>
        //   </header>
        //   <section>
        //       <p>
        //         <div style = { { "margin-bottom" : "10%" } }>
        //           <h2>안녕하세요, 김 학생님! 👋</h2>
        //           <text>오늘도 팀 프로젝트를 효율적으로 관리해보세요</text>
        //         </div>
        //         <div style = { { "display": "inline-flex", "justify-content": "space-between", "margin-bottom": "20%" } }>
        //             진행중인 프로젝트 /
        //             완료된 작업 /
        //             팀원 수(?)
        //         </div>
        //         <div>
        //             <h3>
        //                 프로젝트 목록
        //                 <button>프로젝트 생성</button>
        //             </h3>
        //         </div>
        //         <div>
        //             프로젝트 1 / 프로젝트 2 / 프로젝트 3
        //             프로젝트 4 / 프로젝트 5 / 프로젝트 6
        //         </div>
        //       </p>
        //   </section>
        //   <footer>
        //
        //   </footer>
        // </>
    )
}

// function Home() {
//     return(
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
//                 <i className="ri-team-line text-white text-lg"></i>
//               </div>
//               <h1 className="text-xl font-bold text-gray-900">mirum</h1>
//             </div>
//             <button
//               onClick={() => setIsCreateModalOpen(true)}
//               className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
//             >
//               <i className="ri-add-line text-lg"></i>
//               <span>새 프로젝트</span>
//             </button>
//           </div>
//         </div>
//       </header>
//       </div>
//       )
// }

export default Home;