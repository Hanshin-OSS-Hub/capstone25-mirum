import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineCog6Tooth, HiOutlineUserPlus } from "react-icons/hi2";
import { api } from "../pages/client";
import { apiClient } from "../pages/client";
import { useLocation } from "react-router-dom";
import ProjectUpdateModal from "../components/ProjectUpdateModal";
import ProjectMemberModal from "../components/ProjectMemberModal";
import "./Project.css";

// 환경 변수로 테스트/API 모드 선택
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function ProjectConfigMenu(props) {
    return (
        <div style={ { position: "absolute", top: 40, right: 0, background: "#fff", border: "1px solid #ccc", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 1000, } }>
          <span style={ { padding: "2.5px 5px 0 0", display: "block", fontSize: 11, cursor: "pointer", textAlign: "right" } }
          onClick={() => props.setIsConfigMenuOpen(false)}>
            ✕
          </span>
          <ul style={ { display: "flex", flexDirection: "column", listStyle: "none", padding: 10, gap: 10 } }>
              <li style={{ cursor: "pointer" }} onClick={() => props.setIsMemberModalOpen(true)}>멤버 관리</li>
              <li style={{ cursor: "pointer" }} onClick={() => props.setIsUpdateModalOpen(true)}>프로젝트 수정</li>
              <li style={{ cursor: "pointer" }} onClick={() => { props.onDelete(); }}>프로젝트 삭제</li>
          </ul>
        </div>
    );
}

function Project() {
  const navigate = useNavigate();
  const { id } = useParams();                    // /project/:id 에서 id 읽기

  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const location = useLocation();
  const myUsername = localStorage.getItem("username") || "";
  const myMember = members.find(m => m.username === myUsername);
  const isLeader = myMember?.role?.toUpperCase() === "LEADER";

  // 새로고침 등으로 state가 날아갔을 때 대비
  const name = project?.projectName || "프로젝트 이름";
  const desc = project?.description || "프로젝트 설명";
  const memberCount = Array.isArray(members)
    ? members.length
    : 0;
  const day = project?.created_at ? project.created_at.slice(0, 10) : "-";

  // 대시보드(홈)로 돌아가기
  const handleBack = () => {
    navigate("/dashboard");
  };

  // ==================== [실제 API 함수들] ====================

  // [READ] 프로젝트 상세 정보 api 요청
  const handleGetProjectDetailsAPI = useCallback(() => {
      api.get(`http://localhost:8080/project/${id}`)
      .then((data) => {
          setProject(data);
          setError("");
      })
      .catch((error) => {
        setProject(null);
        alert(error.message || "프로젝트 정보를 불러오는데 실패했습니다.");
      });
    }, [id]);

   /** [백엔드 개발자 참고]
    프론트엔드에서 프로젝트 수정 시 PUT /project로 아래와 같은 JSON을 전송합니다:
    {
      "projectId": <string|number>,
      "projectName": <string>,
      "description": <string>
    }

    서버는 아래와 같은 형식의 데이터를 JSON으로 반환해야 합니다
    // 프론트엔드에서 입력값으로 state를 즉시 갱신할 수도 있지만,
    // 서버에서 반환된 프로젝트 객체로 상태를 갱신하는 이유는
    // 1) 서버(DB)가 최종적이고 신뢰할 수 있는 데이터 소스(authoritative source)이기 때문이며,
    // 2) 서버에서 실제로 저장된 값(예: 필드 자동 보정, 권한, 기타 비즈니스 로직 반영 등)이
    //    프론트엔드 입력값과 다를 수 있기 때문입니다.
    // 따라서 서버 응답을 기준으로 상태를 동기화하면 데이터 일관성과 신뢰성을 보장할 수 있습니다.
    {
      "projectId": <string|number>,
      "projectName": <string>,
      "description": <string>
    }
  */

  // [UPDATE] 프로젝트 정보 수정 api 요청
  const handleUpdateProjectAPI = (data) => {
    api.put(`http://localhost:8080/project/${id}`, data)
    .then((updatedProject) => {
        setProject(updatedProject);
        alert("프로젝트 정보를 업데이트했습니다.");
        setIsUpdateModalOpen(false);
    })
    .catch((error) => {
        alert(error.message || "프로젝트 정보 업데이트에 실패했습니다.");
    });
  };

  // [DELETE] 프로젝트 삭제 api 요청
  const handleDeleteProjectAPI = () => {
    if (window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      api.delete(`http://localhost:8080/projects/${id}`)
      .then(() => {
        alert("프로젝트가 삭제되었습니다.");
        navigate("/dashboard");
      })
      .catch((error) => {
        alert(error.message || "프로젝트 삭제 중 오류가 발생했습니다.");
      });
    }     
  };

  // [CREATE] 멤버 초대(추가) api 요청
  const handleInviteMemberAPI = (userInput) => {
    api.post(`http://localhost:8080/invitations`, {
      "projectId": id,
      "invitedName": userInput
    })
    .then(() => {
      alert(`${userInput}님을 초대했습니다.`);
    })
    .catch((error) => {
      alert(error.message || "초대에 실패했습니다.");
    });
  };

  const handleInviteMemberTest = (userInput) => {
    alert(`테스트: ${userInput}님을 초대했습니다.`);
  }

  /** [백엔드 개발자 참고]
    프론트엔드에서 프로젝트 멤버 정보를 요청할 때 GET /members/:projectId로 아래와 같은 형식의 데이터를 기대합니다:
    [
      {
        "userId": <string|number>,
        "username": <string>,
        "name": <string>,
        "profileImg": <string>,
        "role": <string>, // 예: "LEADER", "MEMBER"
        // (선택) "email": <string>
      },
      ...
    ]

    프론트엔드에서 별도의 mockUsers 조인 없이 바로 멤버 정보를 렌더링하려면,
    username, name, profileImg 등 모든 필드를 서버에서 내려주는 것이 가장 이상적입니다.
    (예: username으로 내 멤버 객체를 찾거나, 프로필 이미지를 바로 표시)
    
    서버가 위와 같은 구조로 응답하면, 프론트엔드는 members.map(...)만으로 바로 렌더링이 가능합니다.
    
    만약 일부 필드가 누락되면, 프론트엔드에서 추가 가공/조인 로직이 필요하므로
    모든 멤버 관련 정보는 서버에서 제공해주시길 권장합니다.
  */

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

  // [READ] 멤버 정보 api 요청
  const handleGetProjectMembersAPI = useCallback(() => {
    api.get(`http://localhost:8080/members/${id}`)
    .then((data) => {
        setMembers(data);
    })
    .catch((error) => {
        alert(error.message || "멤버 정보를 불러오는데 실패했습니다.");
    });
  }, [id]);

  //사용자가 leader인 경우에만 멤버 권한 수정/탈퇴 가능

  // [UPDATE] 멤버 권한 수정 api 요청
  const handleChangeMemberAuthAPI = (targetUsername, role) => {
    api.put(`http://localhost:8080/members/${id}/role`, {
      "username": targetUsername,
      "role": role
    })
    .then(() => {
      alert("멤버 권한을 변경했습니다.");
      handleGetProjectMembers(); // 멤버 정보 갱신
    })
    .catch((error) => {
      alert(error.message || "멤버 권한 변경에 실패했습니다.");
    });
  }

  // [DELETE] 멤버 탈퇴/방출 api 요청
  const handleDeleteMemberAPI = (targetUsername) => {
    let deleteConfirmation = false;
    targetUsername === myUsername
      ? (window.confirm("정말로 탈퇴하시겠습니까?") ? deleteConfirmation = true : null)
      : (
        window.confirm(`정말로 ${targetUsername}를 방출하시겠습니까?`) ? deleteConfirmation = true : null
      );

    if (deleteConfirmation) {
      apiClient(`http://localhost:8080/members/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ username: targetUsername })
      })
      .then(() => {
        alert("멤버를 탈퇴/방출했습니다.");
        handleGetProjectMembers(); // 멤버 정보 갱신
        
        // 자신이 탈퇴한 경우 대시보드로 이동
        if (targetUsername === myUsername) {
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        alert(error.message || "멤버 탈퇴/방출에 실패했습니다.");
      });
    }
  }

  // ==================== [테스트용 함수들] ====================

  // [UPDATE] 프로젝트 정보 수정 요청 (테스트용)
  const updateProjectDetailsInfoTest = (data) => {
      setProject(prevProject => {
        const updated = {
          ...prevProject,
          projectName: data.projectName,
          description: data.description
        };
        // localStorage projects도 함께 갱신
        const saved = localStorage.getItem("projects");
        if (saved) {
          const arr = JSON.parse(saved);
          const idx = arr.findIndex(p => p.id === updated.id);
          if (idx !== -1) {
            arr[idx] = { ...arr[idx], ...updated };
            localStorage.setItem("projects", JSON.stringify(arr));
          }
        }
        return updated;
      });
      alert("프로젝트 정보를 업데이트했습니다.");
      setIsUpdateModalOpen(false);
  }

  // [DELETE] 프로젝트 삭제 요청 (테스트용)
  const deleteProjectTest = () => {
    alert("프로젝트가 삭제되었습니다. (테스트용)");
    const saved = localStorage.getItem("projects");
    let filteredProjects = [];
    if (saved) {
      const arr = JSON.parse(saved);
      filteredProjects = arr.filter(p => p.id !== parseInt(id));
      localStorage.setItem("projects", JSON.stringify(filteredProjects));
    }
    navigate("/dashboard");
  };

  // ==================== [핸들러 선택] ====================
  // 환경변수에 따라 API 또는 테스트 함수 사용
  const handleUpdateProject = USE_MOCK ? updateProjectDetailsInfoTest : handleUpdateProjectAPI;
  const handleDeleteProject = USE_MOCK ? deleteProjectTest : handleDeleteProjectAPI;
  const handleInviteMember = USE_MOCK ? handleInviteMemberTest : handleInviteMemberAPI;
  const handleGetProjectMembers = USE_MOCK ? (() => {}) : handleGetProjectMembersAPI;
  const handleChangeMemberAuth = USE_MOCK ? (() => alert("테스트 모드: 멤버 권한 변경")) : handleChangeMemberAuthAPI;
  const handleDeleteMember = USE_MOCK ? ((username) => alert(`테스트 모드: ${username} 제거`)) : handleDeleteMemberAPI;

  // ==================== [초기 데이터 로드] ====================
  // 테스트 모드: location.state에서 데이터 가져오기
  useEffect(() => {
    alert(`현재 모드: ${USE_MOCK ? "테스트용(Mock)" : "API"}`);
    if (USE_MOCK) {
      setProject(location.state?.project);
      setMembers(location.state?.project.members || []);
    } else {
      // API 모드: 서버에서 데이터 가져오기
      handleGetProjectDetailsAPI();
      handleGetProjectMembersAPI();
    }
  }, [location.state?.project, handleGetProjectDetailsAPI, handleGetProjectMembersAPI]);
  
  // project 자체가 없는 경우 간단한 예외 화면
  if (!project) {
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
            project={project}
            error={error}
            onClose={() => setIsUpdateModalOpen(false)}
            onUpdate={(data) => handleUpdateProject(data)}
          />
        )}
        {isMemberModalOpen && project && (
          <ProjectMemberModal
            projectId={id}
            members={members}
            onClose={() => setIsMemberModalOpen(false)}
            onInvite={() => handleInviteMember()}
            onModify={() => handleChangeMemberAuth()}
            onEject={(username) => handleDeleteMember(username)}
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
                        onDelete={() => handleDeleteProject()}
                        project={project} /> }
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

export default Project;

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