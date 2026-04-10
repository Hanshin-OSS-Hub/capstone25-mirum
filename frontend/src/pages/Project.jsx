import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineCog6Tooth, HiOutlineUserPlus } from "react-icons/hi2";
import { api, client } from "../api/client";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import { useLocation } from "react-router-dom";
import ProjectUpdateModal from "../features/projects/components/ProjectUpdateModal.jsx";
import ProjectMemberModal from "../features/invitations/components/ProjectMemberModal.jsx";
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
              <li style={{ cursor: "pointer" }} onClick={() => { props.setIsConfigMenuOpen(false); props.setIsMemberModalOpen(true); }}>멤버 관리</li>
              <li style={{ cursor: "pointer" }} onClick={() => { props.setIsConfigMenuOpen(false); props.setIsUpdateModalOpen(true); }}>프로젝트 수정</li>
              <li style={{ cursor: "pointer" }} onClick={() => { props.setIsConfigMenuOpen(false); props.onDelete(); }}>프로젝트 삭제</li>
          </ul>
        </div>
    );
}

function Project() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();                    // /api/project/:id 에서 id 읽기

  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pendingInvites, setPendingInvites] = useState([]);
  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const location = useLocation();
  const myUsername = user?.username || "";
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

  // ==================== [실제 API 함수들] ====================

  /**
   * [READ] 프로젝트 상세 정보 조회 API
   *
   * 현재 상태:
   * @returns {Object} 서버가 프로젝트 기본 정보를 반환
   * 서버 응답 예시:
   * {
   *   "projectId": "<string|number>",     // 프로젝트 고유 ID
   *   "projectName": "<string>",          // 프로젝트 이름
   *   "description": "<string>",           // 프로젝트 설명
   *   "creationDate": "<ISO8601>"         // 생성일 (ISO 8601 형식)
   * }
   * 문제점: 멤버 수, 작업 수 등 추가 정보가 없어 별도 API 호출 필요
   *
   * 개선된 상태 (권장):
   * @returns {Object} 서버가 프로젝트 전체 정보를 포함하여 반환
   * 서버 응답 예시:
   * {
   *   "projectId": "<string|number>",     // 프로젝트 고유 ID
   *   "projectName": "<string>",          // 프로젝트 이름
   *   "description": "<string>",           // 프로젝트 설명
   *   "creationDate": "<ISO8601>",        // 생성일 (ISO 8601 형식)
   *   "memberCount": 5,                    // 멤버 수
   *   "taskCount": 12,                      // 전체 작업 수
   *   "completedTaskCount": 3,             // 완료된 작업 수
   *   "leaderUsername": "johndoe"           // 리더 사용자명
   * }
   * 장점:
   * - 프로젝트 상세 페이지 렌더링에 필요한 모든 정보를 한 번에 제공
   * - 추가 API 호출 없이 대시보드 정보 표시 가능
   * - 네트워크 요청 횟수 감소로 성능 향상
   */
  const handleGetProjectDetailsAPI = useCallback(() => {
      api.get(`project/${id}`)
      .then((data) => {
          setProject(data);
          setError("");
      })
      .catch((error) => {
        setProject(null);
        alert(error.message || "프로젝트 정보를 불러오는데 실패했습니다.");
      });
    }, [id]);

  /**
   * [UPDATE] 프로젝트 정보 수정 API
   *
   * 현재 상태:
   * @param {Object} data - 수정할 프로젝트 정보
   * @param {string|number} data.projectId - 프로젝트 고유 ID
   * @param {string} data.projectName - 프로젝트 이름
   * @param {string} data.description - 프로젝트 설명
   * @returns {Object} 서버가 수정된 프로젝트 정보를 반환
   * 서버 응답 예시:
   * {
   *   "projectId": "<string|number>",
   *   "projectName": "<string>",
   *   "description": "<string>"
   * }
   * 문제점: 수정된 프로젝트 정보만 반환되어 추가 정보(멤버 수, 작업 수 등) 갱신 불가
   *
   * 개선된 상태 (권장):
   * @param {Object} data - 수정할 프로젝트 정보
   * @param {string|number} data.projectId - 프로젝트 고유 ID
   * @param {string} data.projectName - 프로젝트 이름
   * @param {string} data.description - 프로젝트 설명
   * @returns {Object} 서버가 수정된 프로젝트 전체 정보를 반환
   * 서버 응답 예시:
   * {
   *   "projectId": "<string|number>",
   *   "projectName": "<string>",
   *   "description": "<string>",
   *   "creationDate": "<ISO8601>",
   *   "memberCount": 5,
   *   "taskCount": 12,
   *   "completedTaskCount": 3,
   *   "leaderUsername": "johndoe"
   * }
   * 장점:
   * - 서버(DB)가 최종적이고 신뢰할 수 있는 데이터 소스이므로 서버 응답으로 상태 동기화
   * - 서버에서 실제로 저장된 값(필드 자동 보정, 권한, 비즈니스 로직 반영 등) 반영
   * - 데이터 일관성과 신뢰성 보장
   * - 추가 정보 갱신으로 UI 일관성 유지
   */
  const handleUpdateProjectAPI = (data) => {
    // 백엔드 엔드포인트는 /project이고, projectId는 body에 포함되어야 함
    api.put(`project`, {
      ...data,
      projectId: Number(id) // id를 숫자로 변환하여 포함
    })
    .then(() => {
        alert("프로젝트 정보를 업데이트했습니다.");
        setIsUpdateModalOpen(false);
        // 서버에서 최신 프로젝트 정보를 다시 가져옴 (서버가 최종 데이터 소스)
        handleGetProjectDetailsAPI();
    })
    .catch((error) => {
        alert(error.message || "프로젝트 정보 업데이트에 실패했습니다.");
    });
  };

  /**
   * [DELETE] 프로젝트 삭제 API
   *
   * 현재 상태:
   * @returns {void} 서버가 삭제 성공 시 빈 응답 또는 성공 메시지 반환
   * 서버 응답 예시:
   * - 204 No Content (빈 응답)
   * - 또는 { "success": true, "message": "프로젝트가 삭제되었습니다." }
   * 문제점: 삭제된 프로젝트 정보를 확인할 수 없어 로깅/감사 추적 어려움
   *
   * 개선된 상태 (권장):
   * @returns {Object} 서버가 삭제된 프로젝트 정보를 반환 (선택사항)
   * 서버 응답 예시:
   * {
   *   "success": true,
   *   "message": "프로젝트가 삭제되었습니다.",
   *   "deletedProjectId": "<string|number>",
   *   "deletedAt": "<ISO8601>"
   * }
   * 장점:
   * - 삭제된 프로젝트 ID 확인 가능
   * - 삭제 시각 기록으로 감사 추적 가능
   * - 클라이언트에서 삭제 확인 및 로깅 용이
   */
  const handleDeleteProjectAPI = () => {
    if (window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      api.delete(`project/${id}`)
      .then(() => {
        alert("프로젝트가 삭제되었습니다.");
        navigate("/dashboard");
      })
      .catch((error) => {
        alert(error.message || "프로젝트 삭제 중 오류가 발생했습니다.");
      });
    }     
  };

  /**
   * [CREATE] 멤버 초대(추가) API
   *
   * 현재 상태:
   * @param {string} userInput - 초대할 사용자의 username 또는 email
   * @returns {void} 서버가 초대 성공 시 빈 응답 또는 성공 메시지 반환
   * 서버 응답 예시:
   * - 201 Created (빈 응답)
   * - 또는 { "success": true, "message": "초대가 전송되었습니다." }
   * 문제점: 초대된 멤버 정보를 받을 수 없어 즉시 UI 업데이트 불가, 초대 ID 없어 추적 어려움
   *
   * 개선된 상태 (권장):
   * @param {string} userInput - 초대할 사용자의 username 또는 email
   * @returns {Object} 서버가 생성된 초대 정보를 반환
   * 서버 응답 예시:
   * {
   *   "invitationId": "inv-uuid-1234",     // 초대 고유 ID (UUID)
   *   "projectId": "proj-uuid-5678",        // 프로젝트 고유 ID
   *   "inviterUsername": "johndoe",        // 초대한 사용자명
   *   "inviteeUsername": "janedoe",         // 초대받은 사용자명
   *   "status": "INVITED",                  // 초대 상태
   *   "createdAt": "2024-01-15T10:30:00Z"  // 초대 생성 시각
   * }
   * 장점:
   * - 초대 정보를 받아 즉시 UI에 반영 가능
   * - 초대 ID로 추적 및 관리 용이
   * - 초대 상태 확인 및 취소 기능 구현 가능
   */
  const handleInviteMemberAPI = (userInput) => {
    api.post(`invitations`, {
      "projectId": Number(id),
      "invitedName": userInput
    })
    .then(() => {
      alert(`${userInput}님을 초대했습니다.`);
      handleGetProjectMembers(); // 멤버 정보 갱신
    })
    .catch((error) => {
      alert(error.message || "초대에 실패했습니다.");
    });
  };

  const handleInviteMemberTest = (userInput) => {
    alert(`테스트: ${userInput}님을 초대했습니다.`);
  }

  /**
   * [READ] 프로젝트 멤버 목록 조회 API
   *
   * 현재 상태:
   * @returns {Array} 서버가 기본 멤버 정보만 반환
   * 서버 응답 예시:
   * [
   *   {
   *     "nickname": "<string>",           // 닉네임
   *     "role": "<string>",               // "LEADER" 또는 "MEMBER"
   *   },
   *   ...
   * ]
   * 문제점: 일부 필드가 누락될 경우 프론트엔드에서 추가 가공/조인 필요, username만으로는 식별/표시가 제한적임
   *
   * 개선된 상태 (권장):
   * @returns {Array} 서버가 모든 멤버 관련 정보를 포함하여 반환
   * 서버 응답 예시:
   * [
   *   {
   *     "userId": "user-uuid-1234",       // 멤버 고유 ID (UUID)
   *     "username": "johndoe",            // 유일한 사용자명
   *     "name": "홍길동",                  // 실명 또는 닉네임
   *     "profileImg": "https://...",      // 프로필 이미지 URL
   *     "role": "LEADER",                 // "LEADER", "MEMBER" 등
   *     "email": "john@example.com"       // (선택) 이메일
   *   },
   *   ...
   * ]
   * 장점:
   * - 프론트엔드에서 members.map(...)만으로 바로 렌더링 가능
   * - username, name, profileImg 등 모든 정보가 있어 추가 가공 불필요
   * - 멤버 식별 및 표시가 명확함
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

  const handleGetProjectInvitationsApi = useCallback((projectId) => {
    api.get(`invitations/sent/${projectId}`)
        .then((data) => {
          setPendingInvites(data);
        })
        .catch((error) => {
          alert(error.message || "초대 목록을 불러오는데 실패했습니다.");
        })
      }, [])

  const handleGetProjectInvitationsTest = (id) => {
    const demodata = [
        {
          inviteId: "inv-uuid-1001",
          projectId: id,
          inviterName: "leader1",
          inviteeName: "alice",
          status: "INVITED",
        },
        {
          inviteId: "inv-uuid-1002",
          projectId: id,
          inviterName: "leader1",
          inviteeName: "bob",
          status: "INVITED",
        },
        {
          inviteId: "inv-uuid-1003",
          projectId: id,
          inviterName: "leader1",
          inviteeName: "carol",
          status: "ACCEPTED",
        },
        {
          inviteId: "inv-uuid-1004",
          projectId: id,
          inviterName: "leader1",
          inviteeName: "dave",
          status: "DECLINED",
        },
        {
          inviteId: "inv-uuid-1005",
          projectId: id,
          inviterName: "leader2",
          inviteeName: "eve",
          status: "INVITED",
        },
      ];

    setPendingInvites(demodata);
  }

  // [READ] 멤버 정보 api 요청
  const handleGetProjectMembersAPI = useCallback(() => {
    api.get(`member/${id}`)
    .then((data) => {
        setMembers(data);
    })
    .catch((error) => {
        alert(error.message || "멤버 정보를 불러오는데 실패했습니다.");
    });
  }, [id]);

  //사용자가 leader인 경우에만 멤버 권한 수정/탈퇴 가능

  /**
   * [UPDATE] 멤버 권한 수정 API
   *
   * 현재 상태:
   * @param {string} targetUsername - 권한을 변경할 멤버의 username
   * @param {string} role - 변경할 권한 ("LEADER" 또는 "MEMBER")
   * @returns {void} 서버가 권한 변경 성공 시 빈 응답 또는 성공 메시지 반환
   * 서버 응답 예시:
   * - 200 OK (빈 응답)
   * - 또는 { "success": true, "message": "멤버 권한을 변경했습니다." }
   * 문제점: 변경된 멤버 정보를 받을 수 없어 즉시 UI 업데이트를 위해 별도 조회 API 호출 필요
   *
   * 개선된 상태 (권장):
   * @param {string} targetUsername - 권한을 변경할 멤버의 username
   * @param {string} role - 변경할 권한 ("LEADER" 또는 "MEMBER")
   * @returns {Object} 서버가 변경된 멤버 정보를 반환
   * 서버 응답 예시:
   * {
   *   "username": "janedoe",               // 멤버 사용자명
   *   "role": "LEADER",                    // 변경된 권한
   *   "updatedAt": "2024-01-15T10:30:00Z" // 변경 시각
   * }
   * 장점:
   * - 변경된 멤버 정보를 받아 즉시 UI 업데이트 가능
   * - 추가 조회 API 호출 불필요로 성능 향상
   * - 변경 시각 기록으로 감사 추적 가능
   */
  const handleChangeMemberAuthAPI = (targetUsername, role) => {
    api.put(`member/${id}/role`, {
      "username": targetUsername,
      "role": role
    })
    .then(() => {
      alert("멤버 권한을 변경했습니다.");
      handleGetProjectMembers(); // 멤버 정보 갱신
    })
    .catch((error) => {
      console.error('멤버 권한 변경 실패:', error);
      alert(error.message || "멤버 권한 변경에 실패했습니다.");
    });
  }

  /**
   * [DELETE] 멤버 탈퇴/방출 API
   *
   * @param member
   *
   * 현재 상태:
   * @returns {void} 서버가 탈퇴/방출 성공 시 빈 응답 또는 성공 메시지 반환
   * 서버 응답 예시:
   * - 200 OK (빈 응답)
   * - 또는 { "success": true, "message": "멤버를 탈퇴/방출했습니다." }
   * 문제점: 탈퇴된 멤버 정보를 받을 수 없어 즉시 UI 업데이트를 위해 별도 조회 API 호출 필요
   *
   * 개선된 상태 (권장):
   * @returns {Object} 서버가 탈퇴/방출된 멤버 정보를 반환
   * 서버 응답 예시:
   * {
   *   "username": "janedoe",               // 탈퇴/방출된 멤버 사용자명
   *   "projectId": "proj-uuid-5678",       // 프로젝트 고유 ID
   *   "deletedAt": "2024-01-15T10:30:00Z", // 탈퇴/방출 시각
   *   "reason": "MEMBER_LEAVE"             // 탈퇴 사유 (MEMBER_LEAVE, LEADER_REMOVE 등)
   * }
   * 장점:
   * - 탈퇴/방출된 멤버 정보를 받아 즉시 UI 업데이트 가능
   * - 추가 조회 API 호출 불필요로 성능 향상
   * - 탈퇴 시각 및 사유 기록으로 감사 추적 가능
   * - 자신이 탈퇴한 경우 프로젝트 페이지에서 자동 리디렉션 처리 용이
   */
  const handleDeleteMemberAPI = (member) => {
    let deleteConfirmation = false;
    member.username === myUsername
      ? (window.confirm("정말로 탈퇴하시겠습니까?") ? deleteConfirmation = true : null)
      : (
        window.confirm(`정말로 ${member.nickname} 님을 방출하시겠습니까?`) ? deleteConfirmation = true : null
      );

    if (deleteConfirmation) {
      client(`member/${id}?targetName=${member.username}`, {
        method: "DELETE"
      })
      .then(() => {
        alert("멤버를 탈퇴/방출했습니다.");
        handleGetProjectMembers(); // 멤버 정보 갱신
        
        // 자신이 탈퇴한 경우 대시보드로 이동
        if (member.username === myUsername) {
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        alert(error.message || "멤버 탈퇴/방출에 실패했습니다.");
      });
    }
  }

  const handleDeleteMemberTest = (username) => {
    alert(`테스트 모드: ${username} 제거`);
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
  const handleDeleteMember = USE_MOCK ? handleDeleteMemberTest : handleDeleteMemberAPI;
  const handleGetProjectInvitations = USE_MOCK ?  (id) => handleGetProjectInvitationsTest(id) : (id) => handleGetProjectInvitationsApi(id);
  // ==================== [초기 데이터 로드] ====================
  // 테스트 모드: location.state에서 데이터 가져오기
  useEffect(() => {
    // alert(`현재 모드: ${USE_MOCK ? "테스트용(Mock)" : "API"}`);
    if (USE_MOCK) {
      setProject(location.state?.project);
      setMembers(location.state?.project.members || []);
    } else {
      // API 모드: 서버에서 데이터 가져오기
      handleGetProjectDetailsAPI();
      handleGetProjectMembersAPI();
      if (id) {
        handleGetProjectInvitations(id);
      }
    }
  }, []); // handleGetProjectDetailsAPI, handleGetProjectMembersAPI 제거 (무한 루프 방지)
  
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
            id={id}
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
            myUsername={myUsername}
            pendingInvites={pendingInvites}
            onClose={() => setIsMemberModalOpen(false)}
            onInvite={(userInput) => handleInviteMember(userInput)}
            onModify={(username, role) => handleChangeMemberAuth(username, role)}
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
