import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useGetProjectList } from '../features/projects/api/useGetProjectList';
import { useGetDeletedProject } from "@/features/projects/api/useGetDeletedProject.js";
import { useRestoreProject } from "@/features/projects/api/useRestoreProject.js";
import {HiOutlineBell, HiOutlineTrash} from "react-icons/hi2";
import CreateProjectModal from '../features/projects/components/CreateProject';
import ProjectInvitationModal from '../features/invitations/components/ProjectInvitationModal';
import ProfileModal from '../features/auth/components/ProfileModal';
import {HiOutlineRefresh} from "react-icons/hi";

// 환경 변수로 테스트/API 모드 선택
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export default function Home() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const {data: projects, isError, error} = useGetProjectList();
    const {data: deletedProjects, isError: deleted_isError, error: deleted_error} = useGetDeletedProject();
    // const [receivedInvitations, setReceivedInvitations] = useState([]);
    // const [sentInvitations, setSentInvitations] = useState([]);

    const { mutate: restoreProject } = useRestoreProject();

    const handleRestore = (projectId) => {
      if (window.confirm("이 프로젝트를 복구하시겠습니까?")) {
        restoreProject(projectId);
      }
    };
    // const [projects, setProjects] = useState(() => {
    //     if (USE_MOCK) {
    //         const saved = localStorage.getItem("projects");
    //         return saved ? JSON.parse(saved) : [];
    //     }
    //     return [];
    // });

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

    // ==================== [테스트용 함수들] ====================

    // // [READ] 초대 목록 조회 (테스트용)
    // // 전체 초대 이력을 저장하되, 렌더링 시에는 INVITED 상태만 표시
    // const getInvitationsTest = () => {
    //     const mockInvitations = [
    //         {
    //             "inviteId": 101,
    //             "projectName": "프로젝트 A",
    //             "inviterName": "inviter_user",
    //             "invitedName": "me",
    //             "status": "INVITED"
    //         },
    //         {
    //             "inviteId": 102,
    //             "projectName": "프로젝트 B",
    //             "inviterName": "another_user",
    //             "invitedName": "me",
    //             "status": "INVITED"
    //         },
    //         {
    //             "inviteId": 103,
    //             "projectName": "프로젝트 C",
    //             "inviterName": "team_lead",
    //             "invitedName": "me",
    //             "status": "INVITED"
    //         }
    //     ];
    //     setReceivedInvitations(mockInvitations);
    // };

    // // [CREATE] 초대 수락 (테스트용)
    // // status를 INVITED → ACCEPTED로 변경 (목록에서 자동으로 필터링됨)
    // const acceptInvitationTest = (invitationId) => {
    //     const invitation = receivedInvitations.find(inv => inv.inviteId === invitationId);
    //     if (!invitation) return;
    //
    //     setReceivedInvitations(prev =>
    //         prev.map(inv =>
    //             inv.inviteId === invitationId
    //                 ? { ...inv, status: "ACCEPTED" }
    //                 : inv
    //         )
    //     );
    //
    //     const newProject = {
    //         id: Math.floor(Math.random() * 1000) + 1, // 임의의 프로젝트 ID 생성
    //         projectName: invitation.projectName,
    //         description: "초대받아 참가하게 된 프로젝트입니다.",
    //         progress: 0,
    //         // 생성한 유저를 리더로 추가 (임의로 userId 1 사용)
    //         members: [
    //             { userId: 1, username: "qwer", role: "LEADER", name: "미룸 데모 유저", profileImg: null, email: "demo@mirum.com" }
    //         ],
    //         created_at: new Date().toISOString(),
    //         updated_at: new Date().toISOString(),
    //     };
    //
    //     const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    //     const updatedProjects = [...savedProjects, newProject];
    //     localStorage.setItem("projects", JSON.stringify(updatedProjects));
    //     setProjects(updatedProjects);
    //     alert(`(테스트 모드) "${invitation.projectName}" 프로젝트 초대를 수락했습니다.`);
    //     alert('(테스트 모드) 프로젝트 목록이 갱신되었습니다.');
    // };

    // // [DELETE] 초대 거절 (테스트용)
    // // status를 INVITED → DECLINED로 변경 (목록에서 자동으로 필터링됨)
    // const rejectInvitationTest = (invitationId) => {
    //     const invitation = receivedInvitations.find(inv => inv.inviteId === invitationId);
    //
    //     setReceivedInvitations(prev =>
    //         prev.map(inv =>
    //             inv.inviteId === invitationId
    //                 ? { ...inv, status: "DECLINED" }
    //                 : inv
    //         )
    //     );
    //     if(invitation) {
    //         alert(`(테스트 모드) "${invitation.projectName}" 프로젝트 초대를 거절했습니다.`);
    //     }
    // };

    // ==================== [핸들러 선택] ====================
    // 환경변수에 따라 API 또는 테스트 함수 사용
    // const handleGetReceivedInvitations = USE_MOCK ? getInvitationsTest : handleGetInvitationsApi;
    // const handleGetSentInvitations = USE_MOCK ? handleGetProjectInvitationsApi2 : handleGetProjectInvitationsApi2;
    // const handleAcceptInvitation = USE_MOCK ? acceptInvitationTest : handleAcceptInvitationApi;
    // const handleRejectInvitation = USE_MOCK ? rejectInvitationTest : handleRejectInvitationApi;


    // useEffect(() => {
    //     if (USE_MOCK) {
    //         // 테스트 모드: 모의 초대 데이터 로드
    //         localStorage.clear();
    //         getInvitationsTest();
    //     } else {
    //         // 실제 API 모드
    //         handleGetProjectList();
    //         handleGetReceivedInvitations();
    //         // handleGetSentInvitations();
    //     }
    // }, []);

    // 로그인 상태면 대시보드로 리다이렉트
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        // user가 null이면 로딩 중으로 간주
        if (user === null) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return <div>로딩 중...</div>;
    }

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
                            onClick={() => {
                                setIsProfileModalOpen(false);
                                setIsInvitationModalOpen(!isInvitationModalOpen);
                            }}
                        >
                            <HiOutlineBell size={20} />
                        </button>
                        <button
                            className="profile-btn"
                            onClick={() => {
                                setIsInvitationModalOpen(false);
                                setIsProfileModalOpen(!isProfileModalOpen);}}
                        >
                            {/* 26.03.03 localStorage에 nickname이 저장되지 않아 흰 화면 뜸 */}
                            {user?.nickname?.charAt(0) || "?"}
                        </button>
                    </div>

                    {isInvitationModalOpen && (
                        <ProjectInvitationModal
                            // receivedInvitations={receivedInvitations}
                            // sentInvitations={sentInvitations}
                            onClose={() => setIsInvitationModalOpen(false)}
                            // onAccept={handleAcceptInvitation}
                            // onReject={handleRejectInvitation}
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
                            <h1>안녕하세요, {user?.nickname || "김미룸"}님! 👋</h1>
                            <p>오늘도 팀 프로젝트를 효율적으로 관리해보세요.</p>
                        </section>

                        <CreateProjectModal
                            isOpen={isCreateProjectModalOpen}
                            onClose={() => setIsCreateProjectModalOpen(false)}
                            // onCreateProjectSuccess={(data) => {
                            //     setIsCreateProjectModalOpen(false);
                            //     alert("프로젝트 생성 완료!");
                            //     handleGetProjectList();
                            //     // setter 함수의 이전 값을 prev로 꺼내서 갱신하는 로직인데 왜 prev가 undefined였을까..?
                            //     setProjects((projects) => {
                            //         const newProjects = [...projects, data];
                            //         localStorage.setItem("projects", JSON.stringify(newProjects));
                            //         return newProjects;
                            //     });
                            // }}
                        />

                        {
                           !Array.isArray(projects) || projects.length === 0 ? (
                                <div style={{ textAlign: "center", marginTop: "50px", color: "#666", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                                    <p>진행 중인 프로젝트가 없습니다.</p>
                                    <button className="primary-btn" onClick={() => setIsCreateProjectModalOpen(true)}>+ 새 프로젝트 생성</button>
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
                                        <button className="primary-btn" onClick={() => setIsCreateProjectModalOpen(true)}>+ 새 프로젝트</button>
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
                                                    <span>👤 {p.memberCount || 0}명</span>
                                                    <span>📅 {p.creationDate?.slice(0, 10) || "-"}</span>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                    </div>
                                </section>
                                {/* 휴지통 섹션 (삭제된 프로젝트가 있을 때만 표시) */}
                                {
                                  deletedProjects?.length > 0 && (
                                  <section className="project-section deleted-section" style={{ marginTop: "40px", opacity: 0.8 }}>
                                    <div className="section-header">
                                      <h2 style={{ color: "#6b7280", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <HiOutlineTrash /> 휴지통 <span style={{ fontSize: "14px", fontWeight: "normal" }}>({deletedProjects.length})</span>
                                      </h2>
                                    </div>

                                  <div className="project-grid">
                                    {deletedProjects.map((p) => (
                                        <div
                                            key={p.projectId}
                                            className="card project-card deleted-card"
                                            style={{
                                              backgroundColor: "#f9fafb", // 회색 배경
                                              border: "1px dashed #d1d5db", // 점선 테두리
                                              cursor: "default" // 클릭 이동 방지
                                            }}
                                        >
                                          <div className="project-header">
                                            <div className="project-text">
                                              <h2 style={{ color: "#4b5563", textDecoration: "line-through" }}>{p.projectName}</h2>
                                              <p className="project-desc" style={{ color: "#9ca3af" }}>
                                                {p.description?.length > 30 ? p.description.slice(0, 20) + "..." : p.description}
                                              </p>
                                            </div>
                                          </div>

                                          {/* 프로그레스 바 대신 복구 버튼 배치 */}
                                          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
                                            <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleRestore(p.projectId);
                                                }}
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: "6px",
                                                  padding: "8px 16px",
                                                  backgroundColor: "#fff",
                                                  border: "1px solid #2563eb",
                                                  color: "#2563eb",
                                                  borderRadius: "6px",
                                                  cursor: "pointer",
                                                  fontWeight: "bold",
                                                  fontSize: "14px",
                                                  transition: "all 0.2s"
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#eff6ff"}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                                            >
                                              <HiOutlineRefresh /> 복구하기
                                            </button>
                                          </div>

                                          <div className="card-footer" style={{ marginTop: "12px", color: "#9ca3af" }}>
                                            <span>삭제일: {p.updateDate?.slice(0, 10) || "-"}</span>
                                          </div>
                                        </div>
                                    ))}
                                    </div>
                                  </section>
                                  )
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