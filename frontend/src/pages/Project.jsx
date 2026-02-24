import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth.js";

import { useGetProjectDetails } from "@/features/projects/api/useGetProjectDetails.js";
import { useGetMemberList } from "../features/members/api/useGetMemberList.js";
import { useGetInvitees } from "../features/invitations/api/useGetInvitees.js";

import ProjectConfigMenu from "@/features/projects/components/projectConfigMenu.jsx";
import ProjectUpdateModal from "../features/projects/components/ProjectUpdateModal.jsx";
import ProjectMemberModal from "../features/members/components/MemberManagementModal.jsx";

import { HiOutlineCog6Tooth, HiOutlineUserPlus } from "react-icons/hi2";
import "./Project.css";

// 환경 변수로 테스트/API 모드 선택
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export default function Project() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // /api/project/:id 에서 id 읽기
  const { user } = useAuth();
  const myUsername = user?.username || "";

  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [projectError, setProjectError] = useState(""); // 프로젝트 관련 에러 상태로 이름 변경

  // useGetMemberList 훅 호출 및 데이터 구조 분해 (projectId와 myUsername 전달)
  // TanStack Query는 컴포넌트가 마운트될 때 자동으로 실행됩니다.
  // useEffect에서 별도로 호출할 필요가 없습니다.

  // [Hooks]
  const { data: project = [], isLoading, isError, error } = useGetProjectDetails()
  const { data: members = [], isLoading: isMembersLoading, error: membersError } = useGetMemberList(id, myUsername);
  const { data: pendingInvites = [], isLoading: isPendingInvitesLoading, error: pendingInvitesError } = useGetInvitees(id);
  const [tasks, setTasks] = useState([]);

  const myMember = members.find(m => m.username === myUsername);
  const isLeader = myMember?.role?.toUpperCase() === "LEADER";

  // 새로고침 등으로 state가 날아갔을 때 대비
  const name = project?.projectName || "프로젝트 이름";
  const desc = project?.description || "프로젝트 설명";
  const memberCount = Array.isArray(members)
    ? members.length
    : 0;
  const day = project?.creationDate ? project.creationDate.slice(0, 10) : "-";

  // 대시보드(홈)로 돌아가기
  const handleBack = () => {
    navigate("/dashboard");
  };

  // project 자체가 없는 경우 간단한 예외 화면
  if (!project) {
    return (
        <div className="pj-root">
          <header className="pj-top-bar">
            <div className="logo-area" style={{ cursor: "pointer" }} onClick={handleBack}>
              <div className="logo-icon">M</div>
              <span className="logo-text">Mirum</span>
            </div>

            <div className="top-right">
              <button className="icon-button" onClick={handleBack}>
                ← 전체 프로젝트
              </button>
            </div>
          </header>

          <main className="pj-main">
            <h1 className="pj-title">프로젝트 정보를 불러올 수 없습니다.</h1>
          </main>
        </div>
    );
  }

  return (
      <div className="pj-root">
        <header className="pj-top-bar">
          <div className="pj-top-inner">
            <div className="logo-area" style={{ cursor: "pointer" }} onClick={handleBack}>
              <div className="logo-icon">M</div>
              <span className="logo-text">Mirum</span>
            </div>

            <div className="top-right">
              <button className="icon-button" onClick={handleBack}>
                ← 전체 프로젝트
              </button>
            </div>
          </div>
        </header>

        <main className="pj-main">
          {isUpdateModalOpen && project && (
              <ProjectUpdateModal
                  projectId={id}
                  project={project}
                  error={projectError} // 프로젝트 관련 에러 전달
                  onClose={() => setIsUpdateModalOpen(false)}
                  // onUpdate={(data) => handleUpdateProject(data)}
              />
          )}
          {isMemberModalOpen && project && (
              <ProjectMemberModal
                  projectId={id}
                  members={members || []}
                  myUsername={myUsername}
                  pendingInvites={pendingInvites || []}
                  onClose={() => setIsMemberModalOpen(false)}
                  // onInvite={(userInput) => handleInviteMember(userInput)}
                  // onModify={(username, role) => handleChangeMemberAuth(username, role)}
                  // onEject={(username) => handleDeleteMember(username)}
              />
          )}
          <div className="pj-header-row">
            <div>
              <div style={ { position: "relative", display: "flex", flexDirection: "row", alignItems: "flex-end" } }>
                <h1 className="pj-title">{name} </h1>
                {
                  isLeader ? (
                      <>
                    <span style={ {cursor: "pointer"} } onClick={ () => {setIsConfigMenuOpen(!isConfigMenuOpen);} }>
                      <HiOutlineCog6Tooth />
                    </span>
                        { isConfigMenuOpen &&
                            <ProjectConfigMenu
                                setIsConfigMenuOpen={setIsConfigMenuOpen}
                                setIsUpdateModalOpen={setIsUpdateModalOpen}
                                setIsMemberModalOpen={setIsMemberModalOpen}
                                // onDelete={() => handleDeleteProject()}
                                // project={project}
                            /> }
                      </>
                  ) : (<></>)
                }
              </div>
              <p className="pj-sub">
                {desc}
                <br />
                <span style={{ fontSize: "14px", color: "#8b8b99" }}>
                시작일: {day} · 프로젝트 ID: {id}
              </span>
              </p>
            </div>

            <button className="pj-new-task-btn">+ 새 작업</button>
          </div>

          {
            tasks.length === 0 ? (
                <></>
            ) : (
                // 상단 요약 카드 4개
                <section className="pj-summary-row">
                  <div className="pj-summary-card">
                    <span className="pj-summary-label">전체 작업</span>
                    <span className="pj-summary-value">{tasks.length}</span>
                  </div>
                  <div className="pj-summary-card">
                    <span className="pj-summary-label">완료</span>
                    <span className="pj-summary-value">1</span>
                  </div>
                  <div className="pj-summary-card">
                    <span className="pj-summary-label">진행중</span>
                    <span className="pj-summary-value">0</span>
                  </div>
                  <div className="pj-summary-card">
                    <span className="pj-summary-label">팀원</span>
                    <span className="pj-summary-value">{memberCount}</span>
                  </div>
                </section>
            )
          }


          {/* 멤버별 작업 리스트 */}
          <section className="pj-members">
            {
              tasks.length === 0 ? (
                  <div className="pj-empty-tasks">
                    아직 할당된 작업이 없습니다
                    <button className="pj-link-button">새 작업 만들기</button>
                  </div>
              ) : (
                  <>
                    {/* 첫 번째 팀원 카드 (예시) */}
                    <div className="pj-member-card">
                      <div className="pj-member-header">
                        <div className="pj-member-left">
                          <div className="pj-member-avatar">박</div>
                          <div>
                            <div className="pj-member-name">박규민</div>
                            <div className="pj-member-role">
                              디자이너 · minsue@university.ac.kr
                            </div>
                          </div>
                        </div>

                        <div className="pj-member-stats">
                          <span>작업 1개</span>
                          <span className="pj-divider">·</span>
                          <span>완료 1개</span>
                        </div>
                      </div>


                      <div className="pj-task-card">
                        <div className="pj-task-header">
                          <div>
                            <span className="pj-badge pj-badge-red">높음</span>
                            <span className="pj-task-title">UI 디자인 완료</span>
                          </div>
                          <span className="pj-task-date">1월 15일</span>
                        </div>
                        <p className="pj-task-desc">
                          메인 페이지와 로그인 페이지의 UI 디자인을 완료해야 합니다.
                          사용자 경험을 고려하여 직관적인 인터페이스를 구성하세요.
                        </p>
                        <div className="pj-task-tags">
                          <span className="pj-tag">디자인</span>
                          <span className="pj-tag">UI/UX</span>
                        </div>
                      </div>
                    </div>

                    {/* 두 번째 팀원 (작업 없음 예시) */}
                    <div className="pj-member-card">
                      <div className="pj-member-header">
                        <div className="pj-member-left">
                          <div className="pj-member-avatar">백</div>
                          <div>
                            <div className="pj-member-name">백종빈</div>
                            <div className="pj-member-role">
                              디자이너 · minsue@university.ac.kr
                            </div>
                          </div>
                        </div>

                        <div className="pj-member-stats">
                          <span>작업 1개</span>
                          <span className="pj-divider">·</span>
                          <span>완료 1개</span>
                        </div>
                      </div>
                    </div>

                    {/* 세 번째 팀원 예시 */}
                    <div className="pj-member-card">
                      <div className="pj-member-header">
                        <div className="pj-member-left">
                          <div className="pj-member-avatar">허</div>
                          <div>
                            <div className="pj-member-name">허지훈</div>
                            <div className="pj-member-role">
                              디자이너 · minsue@university.ac.kr
                            </div>
                          </div>
                        </div>

                        <div className="pj-member-stats">
                          <span>작업 1개</span>
                          <span className="pj-divider">·</span>
                          <span>완료 1개</span>
                        </div>
                      </div>
                    </div>
                  </>
              )
            }
          </section>
        </main>
      </div>
  );
}

  // ==================== [테스트용 함수들] ====================
  const handleInviteMemberTest = (userInput) => {
    alert(`테스트: ${userInput}님을 초대했습니다.`);
  }

  // // [READ] 멤버 정보 요청 (테스트용)
  // const membersWithUserInfo = members.map(member => {
  //   const user = mockUsers.find(u => u.id === member.userId);
  //   return {
  //     ...member,
  //     // username: user?.username,
  //     profileImg: user?.profileImg || "",
  //     name: user?.name || "이름없음",
  //     // email: user?.email || "",
  //   }
  // })

  // const handleGetProjectInvitationsTest = (id) => {
  //   const demodata = [
  //       {
  //         inviteId: "inv-uuid-1001",
  //         projectId: id,
  //         inviterName: "leader1",
  //         inviteeName: "alice",
  //         status: "INVITED",
  //       },
  //       {
  //         inviteId: "inv-uuid-1002",
  //         projectId: id,
  //         inviterName: "leader1",
  //         inviteeName: "bob",
  //         status: "INVITED",
  //       },
  //       {
  //         inviteId: "inv-uuid-1003",
  //         projectId: id,
  //         inviterName: "leader1",
  //         inviteeName: "carol",
  //         status: "ACCEPTED",
  //       },
  //       {
  //         inviteId: "inv-uuid-1004",
  //         projectId: id,
  //         inviterName: "leader1",
  //         inviteeName: "dave",
  //         status: "DECLINED",
  //       },
  //       {
  //         inviteId: "inv-uuid-1005",
  //         projectId: id,
  //         inviterName: "leader2",
  //         inviteeName: "eve",
  //         status: "INVITED",
  //       },
  //     ];
  //
  //   setPendingInvites(demodata);
  // }

  const handleDeleteMemberTest = (username) => {
    alert(`테스트 모드: ${username} 방출`);
  }

  // [UPDATE] 프로젝트 정보 수정 요청 (테스트용)
  // const updateProjectDetailsInfoTest = (data) => {
  //     setProject(prevProject => {
  //       const updated = {
  //         ...prevProject,
  //         projectName: data.projectName,
  //         description: data.description
  //       };
  //       // localStorage projects도 함께 갱신
  //       const saved = localStorage.getItem("projects");
  //       if (saved) {
  //         const arr = JSON.parse(saved);
  //         const idx = arr.findIndex(p => p.id === updated.id);
  //         if (idx !== -1) {
  //           arr[idx] = { ...arr[idx], ...updated };
  //           localStorage.setItem("projects", JSON.stringify(arr));
  //         }
  //       }
  //       return updated;
  //     });
  //     alert("프로젝트 정보를 업데이트했습니다.");
  //     setIsUpdateModalOpen(false);
  // }

  // // [DELETE] 프로젝트 삭제 요청 (테스트용)
  // const deleteProjectTest = () => {
  //   alert("프로젝트가 삭제되었습니다. (테스트용)");
  //   const saved = localStorage.getItem("projects");
  //   let filteredProjects = [];
  //   if (saved) {
  //     const arr = JSON.parse(saved);
  //     filteredProjects = arr.filter(p => p.id !== parseInt(id));
  //     localStorage.setItem("projects", JSON.stringify(filteredProjects));
  //   }
  //   navigate("/dashboard");
  // };

  // ==================== [핸들러 선택] ====================
  // 환경변수에 따라 API 또는 테스트 함수 사용
  // const handleUpdateProject = USE_MOCK ? updateProjectDetailsInfoTest : handleUpdateProjectAPI;
  // const handleDeleteProject = USE_MOCK ? deleteProjectTest : handleDeleteProjectAPI;
  // const handleInviteMember = USE_MOCK ? handleInviteMemberTest : handleInviteMemberAPI;
  // const handleChangeMemberAuth = USE_MOCK ? (() => alert("테스트 모드: 멤버 권한 변경")) : handleChangeMemberAuthAPI;
  // const handleDeleteMember = USE_MOCK ? handleDeleteMemberTest : handleDeleteMemberAPI;
  // const handleGetProjectInvitations = USE_MOCK ?  (id) => handleGetProjectInvitationsTest(id) : (id) => handleGetProjectInvitationsApi(id); // Tanstack Query로 대체
  // ==================== [초기 데이터 로드] ====================
  // // 테스트 모드: location.state에서 데이터 가져오기
  // useEffect(() => {
  //   // alert(`현재 모드: ${USE_MOCK ? "테스트용(Mock)" : "API"}`);
  //   if (USE_MOCK) {
  //     setProject(location.state?.project);
  //     // Mock 모드일 때 members 처리는 별도 로직이 필요할 수 있음 (현재는 API 모드 집중)
  //   } else {
  //     // API 모드: 서버에서 데이터 가져오기
  //     handleGetProjectDetailsAPI();
  //     // handleGetProjectMembersAPI(); <-- 삭제! Tanstack Query가 알아서 함
  //     // handleGetProjectInvitations(id); <-- 삭제! Tanstack Query가 알아서 함
  //   }
  // }, []); // handleGetProjectDetailsAPI, handleGetProjectMembersAPI 제거 (무한 루프 방지)
  


// function projectDateFormat(dateString) {
//   const options = { year: 'numeric', month: 'long', day: 'numeric' };
//   const date = new Date(dateString);
//   return date.toLocaleDateString('ko-KR', options);
// }

// function formatDate(dateString) {
//   const date = new Date(dateString);
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }

// function formatDateKorean(dateString) {
//   const date = new Date(dateString);
//   const year = date.getFullYear();
//   const month = date.getMonth() + 1;
//   const day = date.getDate();
//   return `${year}년 ${month}월 ${day}일`;
// }

// function formatDateShort(dateString) {
//   const date = new Date(dateString);
//   const month = date.getMonth() + 1;
//   const day = date.getDate();
//   return `${month}월 ${day}일`;
// }
