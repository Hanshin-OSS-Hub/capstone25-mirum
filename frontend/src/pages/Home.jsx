import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { HiOutlineBell } from "react-icons/hi2";
import { api } from '../api/client';
import CreateProjectModal from './CreateProject';
import ProjectInvitationModal from '../components/ProjectInvitationModal';
import ProfileModal from '../components/ProfileModal';

// 환경 변수로 테스트/API 모드 선택
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function Home() {
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const [invitations, setInvitations] = useState([]);
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
     *     "id": "uuid-or-projectId",    // 프로젝트 고유 ID (지금은 서버에서 제공하지 않음)
     *     "projectName": "프로젝트 이름",
     *     "description": "프로젝트 설명",
     *     "taskProgress": 65,           // 진행률 (0-100)
     *     "memberCount": 3,             // 멤버 수
     *     "creationDate": "2024-01-15T00:00:00Z"  // ISO 8601 날짜
     *   },
     *   ...
     * ]
     */

    const handleGetProjectList = useCallback(async () => {
        api.get('projects')
        .then(response => {
            setProjects(response);
            localStorage.setItem("projects", JSON.stringify(response));
        })
        .catch(error => {
            alert(error.message || '프로젝트 목록을 불러오는 데 실패했습니다. 다시 시도해주세요.');
        });
        }, []);
    
    
    /**
     * [READ] 초대 목록 조회 API
     * 
     * 현재 상태:
     * @returns {Array} 서버가 기본 초대 정보만 반환
     * 서버 응답 예시:
     * [
     *   {
     *     "projectName": "프로젝트 이름",
     *     "inviterName": "초대한 사용자명",
     *     "inviteeName": "초대받은 사용자명",
     *     "status": "INVITED" // INVITED, ACCEPTED, DECLINED
     *   },
     *   ...
     * ]
     * 문제점: 초대를 식별하기 위해 projectName + inviterName 조합 사용 필요, API 호출 시 ID가 없음
     * 
     * 개선된 상태 (권장):
     * @returns {Array} 서버가 고유 ID와 projectId 포함하여 반환
     * 서버 응답 예시:
     * [
     *   {
     *     "id": "inv-uuid-1234",                    // 초대 고유 ID (UUID)
     *     "projectName": "프로젝트 이름",
     *     "inviterName": "초대한 사용자명",
     *     "inviteeName": "초대받은 사용자명",
     *     "status": "INVITED",                      // INVITED, ACCEPTED, DECLINED
     *     "createdAt": "2024-01-15T10:30:00Z"       // 초대 생성 시각
     *     "projectId": "proj-uuid-5678",            // (선택사항) 프로젝트 고유 ID (UUID) 특정 프로젝트의 초대만 필터링하고 싶을 때 / 초대 수락 시 곧바로 그 프로젝트로 이동하고 싶을 때
     *   },
     *   ...
     * ]
     * 장점: 
     * - 초대를 명확하게 식별 가능 (단순 id 사용)
     * - API 호출 시 POST /invitations/{id}/accept 형태로 깔끔함
     * - projectId로 어느 프로젝트의 초대인지 명확함
     * - 프론트엔드에서 composite key 불필요
     */

    const handleGetInvitationsApi = useCallback(async () => {
        api.get('invitations/received')
        .then(response => {
            setInvitations(response.data);
        })
        .catch(error => {
            alert(error.message || '초대 목록을 불러오는 데 실패했습니다. 다시 시도해주세요.');
        });
    }, []);


    /**
     * [CREATE] 초대 수락 API
     * 
     * @param {string} invitationId - 수락할 초대의 ID
     * @returns {Promise<void>} POST /invitations/{id}/accept API 호출, 성공 시 invitations 상태 업데이트 및 프로젝트 목록 갱신
     * @description 초대를 수락하면 해당 초대는 제거되고 프로젝트 목록에 추가됨
     */
    const handleAcceptInvitationApi = async (invitationId) => {
        return api.post(`/invitations/${invitationId}/accept`)
        .then(() => {
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
            alert('프로젝트 초대를 수락했습니다.');
            // 초대 수락 후 프로젝트 목록 갱신
            handleGetProjectList();
        })
        .catch(error => {
            alert(error.message || '초대 수락에 실패했습니다. 다시 시도해주세요.');
        });
    };

    /**
     * [DELETE] 초대 거절 API
     * 
     * @param {string} invitationId - 거절할 초대의 ID
     * @returns {Promise<void>} POST /invitations/{id}/reject API 호출, 성공 시 invitations 상태에서 제거
     * @description 초대를 거절하면 해당 초대는 목록에서 제거됨
     */
    const handleRejectInvitationApi = async (invitationId) => {
        return api.post(`/invitations/${invitationId}/reject`)
        .then(() => {
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
            alert('프로젝트 초대를 거절했습니다.');
        })
        .catch(error => {
            alert(error.message || '초대 거절에 실패했습니다. 다시 시도해주세요.');
        });
    };

    // ==================== [테스트용 함수들] ====================

    // [READ] 초대 목록 조회 (테스트용)
    // 전체 초대 이력을 저장하되, 렌더링 시에는 INVITED 상태만 표시
    const getInvitationsTest = () => {
        const mockInvitations = [
            {
                "projectName": "프로젝트 A",
                "inviterName": "inviter_user",
                "inviteeName": "me",
                "status": "INVITED"
            },
            {
                "projectName": "프로젝트 B",
                "inviterName": "another_user",
                "inviteeName": "me",
                "status": "INVITED"
            },
            {
                "projectName": "프로젝트 C",
                "inviterName": "team_lead",
                "inviteeName": "me",
                "status": "INVITED"
            }
        ];
        setInvitations(mockInvitations);
    };

    // [CREATE] 초대 수락 (테스트용)
    // status를 INVITED → ACCEPTED로 변경 (목록에서 자동으로 필터링됨)
    const acceptInvitationTest = (invitation) => {
        setInvitations(prev => 
            prev.map(inv => 
                inv.projectName === invitation.projectName && inv.inviterName === invitation.inviterName
                    ? { ...inv, status: "ACCEPTED" }
                    : inv
            )
        );

        const newProject = {
            id: Math.floor(Math.random() * 1000) + 1, // 임의의 프로젝트 ID 생성
            projectName: invitation.projectName,
            description: "초대받아 참가하게 된 프로젝트입니다.",
            progress: 0,
            // 생성한 유저를 리더로 추가 (임의로 userId 1 사용)
            members: [
                { userId: 1, username: "qwer", role: "LEADER", name: "미룸 데모 유저", profileImg: null, email: "demo@mirum.com" }
            ], 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
        const updatedProjects = [...savedProjects, newProject];
        localStorage.setItem("projects", JSON.stringify(updatedProjects));
        setProjects(updatedProjects);
        alert(`(테스트 모드) "${invitation.projectName}" 프로젝트 초대를 수락했습니다.`);
        alert('(테스트 모드) 프로젝트 목록이 갱신되었습니다.');
    };

    // [DELETE] 초대 거절 (테스트용)
    // status를 INVITED → DECLINED로 변경 (목록에서 자동으로 필터링됨)
    const rejectInvitationTest = (invitation) => {
        setInvitations(prev => 
            prev.map(inv => 
                inv.projectName === invitation.projectName && inv.inviterName === invitation.inviterName
                    ? { ...inv, status: "DECLINED" }
                    : inv
            )
        );
        alert(`(테스트 모드) "${invitation.projectName}" 프로젝트 초대를 거절했습니다.`);
    };

    // ==================== [핸들러 선택] ====================
    // 환경변수에 따라 API 또는 테스트 함수 사용
    const handleGetInvitations = USE_MOCK ? getInvitationsTest : handleGetInvitationsApi;
    const handleAcceptInvitation = USE_MOCK ? acceptInvitationTest : handleAcceptInvitationApi;
    const handleRejectInvitation = USE_MOCK ? rejectInvitationTest : handleRejectInvitationApi;

    useEffect(() => {
        if (USE_MOCK) {
            // 테스트 모드: 모의 초대 데이터 로드
            getInvitationsTest();
        } else {
            // 실제 API 모드
            handleGetProjectList();
            handleGetInvitations();
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
                        <button className="profile-btn" style={ { backgroundColor: "transparent" }}
                            onClick={() => setIsInvitationModalOpen(!isInvitationModalOpen)}
                        >
                            <HiOutlineBell size={20} />
                        </button>
                        <button 
                            className="profile-btn" 
                            onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}
                        >
                            {localStorage.getItem("name")?.charAt(0) || "?"}
                        </button>
                    </div>

                    {isInvitationModalOpen && (
                        <ProjectInvitationModal 
                            invitations={invitations}
                            onAccept={handleAcceptInvitation}
                            onReject={handleRejectInvitation}
                        />
                    )}


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
                                handleGetProjectList();
                                setProjects((projects) => {
                                    const newProjects = [...projects, data];
                                    localStorage.setItem("projects", JSON.stringify(newProjects));
                                    return newProjects;
                                });
                            }}
                        />

                        {
                            projects === undefined || projects.length === 0 ? (
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
                                        projects.map((p) => {
                                            return(
                                                // 1. 최상위 요소에 고유한 'key'를 추가합니다. (project.id가 가장 이상적입니다.)
                                                <div
                                                    key={p.projectId}
                                                    data-testid="project-card"
                                                    className="card project-card"
                                                    onClick={() => {
                                                        const projectId = p.projectId;
                                                        if (USE_MOCK) {
                                                            navigate(`/project/${projectId}`, { state: { p } });
                                                        } else {
                                                            navigate(`/project/${projectId}`);
                                                        }
                                                    }}
                                                >
                                                    <div className="project-header">
                                                    <div className="project-text">
                                                        {/* 2. 하드코딩된 텍스트를 props로 받은 데이터로 교체합니다. */}
                                                        <h2>{p?.projectName}</h2>
                                                        <p className="project-desc">
                                                            <br />
                                                            {
                                                            p?.description?.length > 30 ? p.description.slice(0, 20) : p.description
                                                        }</p>
                                                    </div>
                                                    <div className="project-icon">📂</div>
                                                    </div>

                                                    <div className="progress-bar">
                                                    <div className="full" style={{ width: `${p?.taskProgress}%`, height: 100, backgroundColor: p.progress > 80 ? '#c900fbed' : (p.progress > 30 ? '#2563eb' : '#03f7c2ed') }}></div>
                                                    </div>

                                                    <div className="card-footer">                                                
                                                    <span>👤 {USE_MOCK ? p.members.length : p.memberCount || 0}명</span>
                                                    <span>📅 {USE_MOCK ? p.created_at.slice(0, 10) : p.creationDate?.slice(0, 10) || "-"}</span>
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