import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineCog6Tooth, HiOutlineUserPlus } from "react-icons/hi2";
import "./Project.css";
import { mockUsers } from '../data/user';
import { mockMembers } from "../data/members";
import { mockProjects } from "../data/projects";
import { mockTasks } from "../data/tasks";
import ProjectUpdateModal from "../components/ProjectUpdateModal";
import ProjectMemberModal from "../components/ProjectMemberModal";

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
  // const location = useLocation();
  // const project = location.state?.project;    // Home에서 넘긴 project 객체

  const navigate = useNavigate();
  const { id } = useParams();                    // /project/:id 에서 id 읽기

  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);


  // 새로고침 등으로 state가 날아갔을 때 대비
  const name = project?.title || "프로젝트 이름";
  const desc = project?.description || "프로젝트 설명";
  const memberCount = Array.isArray(members)
    ? members.length
    : 0;
  const day = project?.day ? project.day.slice(0, 10) : "-";

  // 대시보드(홈)로 돌아가기
  const handleBack = () => {
    navigate("/dashboard");
  };

  // GET 프로젝트 상세 정보 요청 (테스트용)
  useEffect(() => {
      // handleGetProjectDetails();
      // handleGetProjectMembers();
      const proj = mockProjects.find(p => p.id === parseInt(id));
      setProject(proj);
      const mems = mockMembers.filter(m => proj.members.includes(m.id));
      setMembers(mems);
      // const projTasks = mockTasks.filter(t => t.projectId === parseInt(id));
      // setTasks(projTasks);
  }, []);

  // GET 프로젝트 상세 정보 api 요청
  const handleGetProjectDetails = () => {
      fetch(`http://localhost:8080/project/${id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}`}
      })
      .then((response) => response.json())
      .then((data) => {
          setProject(data);
          // (프로젝트 상세 정보 처리 로직 추가)
      })
      .catch((error) => {
        setProject(null);
          console.error("프로젝트 상세 정보 불러오기 중 오류 발생:", error);
      });
  };

  const handleUpdateProject = (data) => {
    // 여기서 project 정보를 갱신하는 로직을 추가할 수 있습니다.
    // 예: API 호출을 통해 최신 프로젝트 정보를 가져오거나,
    // 전달받은 data를 사용하여 상태를 업데이트하는 등.
  };

  const handleDeleteProject = () => {
    if (window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
        fetch(`http://localhost:8080/projects/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}`},
        })
        .then((response) => {
        if (response.ok) {
            navigate("/dashboard");
        } else {
            alert("프로젝트 삭제에 실패했습니다.");
        }
      })
      .catch((error) => {
          console.error("프로젝트 삭제 중 오류 발생:", error);
      });
    }   
  };

  // CREATE 멤버 초대(추가) api 요청
  // 201?
  const handleInviteMember = (userInput) => {
    fetch(`http://localhost:8080/invitations`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "projectId": id,
        "invitedName": userInput
      }),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("초대에 실패했습니다.");
      }
      return response.json();
    })
    .then((data) => {
      alert(`${userInput}님을 초대했습니다.`);
      setUserInput("");
    })
    .catch((error) => {
      alert("초대에 실패했습니다.", error.message);
    })
  };

  // READ 멤버 정보 요청 (테스트용)
  const membersWithUserInfo = members.map(member => {
    const user = mockUsers.find(u => u.id === member.userId);
    return {
      ...member,
      username: user?.username,
      profileImg: user?.profileImg || "",
      name: user?.name || "이름없음",
      // email: user?.email || "",
    }
  })

  // READ 멤버 정보 api 요청
  const handleGetProjectMembers = () => {
      fetch(`http://localhost:8080/member/${id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}`}
      })
      .then((response) => response.json())
      .then((data) => {
          setMembers(data);
      })
      .catch((error) => {
          console.error("멤버 불러오기 중 오류 발생:", error);
      });
  };

  // UPDATE 멤버 권한 api 요청
  // 200?
  const handleChangeMemberAuth = (targetUsername, role) => {
    fetch(`http://localhost:8080/members/${id}/role`, {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "username": targetUsername,
        "role": role
      })
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("멤버 권한 변경에 실패했습니다.");
      }
      return response.json();
    })
    .then((data) => {
      alert("멤버 권한을 변경했습니다.");
      handleGetProjectMembers(); // 멤버 정보 갱신
    })
    .catch((error) => {
      alert("멤버 권한 변경에 실패했습니다.", error.message);
    });
  }

  // DELETE 멤버 탈퇴/방출 api 요청
  // 409?
  const handleDeleteMember = (targetUsername) => {
    if (window.confirm(`정말로 ${targetUsername}를 탈퇴/방출하시겠습니까?`)) {
      fetch(`http://localhost:8080/${id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "text/plain",
        },
        body: targetUsername,
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("멤버 탈퇴/방출에 실패했습니다.");
        }
      })
      .catch((error) => {
        alert("멤버 탈퇴/방출에 실패했습니다.", error.message);
      });
    }
  }

  // 추후 구현 예정
  // const handleGetProjectTasks = () => {
  //     fetch(`http://localhost:8080/tasks/project/${id}`, {
  //       headers: { 
  //         "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
  //         "Content-Type": "text/plain",
  //       },
  //     })
  //     .then((response) => response.json())
  //     .then((data) => {}
  //     )
  //     .catch((error) => {
  //         console.error("작업 불러오기 중 오류 발생:", error);
  //     });
  //   }


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
        {isUpdateModalOpen && (
          <ProjectUpdateModal
            project={project}
            onClose={() => setIsUpdateModalOpen(false)}
            onUpdate={() => handleUpdateProject()}
          />
        )}
        {isMemberModalOpen && (
          <ProjectMemberModal
            projectId={id}
            members={membersWithUserInfo}
            onClose={() => setIsMemberModalOpen(false)}
            onInvite={() => handleInviteMember()}
            onModify={() => handleChangeMemberAuth()}
            onEject={() => handleDeleteMember()}
          />
        )}
        <div className="pj-header-row">
          <div>
            <div style={ { position: "relative", display: "flex", flexDirection: "row", alignItems: "flex-end" } }>
              <h1 className="pj-title">{name} </h1>
              <span style={ {cursor: "pointer"} } onClick={ () => {setIsConfigMenuOpen(!isConfigMenuOpen);} }>
                <HiOutlineCog6Tooth />
              </span>
              { isConfigMenuOpen && <ProjectConfigMenu setIsConfigMenuOpen={setIsConfigMenuOpen} 
              setIsUpdateModalOpen={setIsUpdateModalOpen} setIsMemberModalOpen={setIsMemberModalOpen} onDelete={() => handleDeleteProject()} project={project} /> }
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