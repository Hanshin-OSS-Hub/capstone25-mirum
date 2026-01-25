import { useState } from 'react';
import { HiOutlineUserPlus } from "react-icons/hi2";

function ProjectMemberModal(props) {
  const [userInput, setUserInput] = useState("")
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const members = props.members || [];

  // 현재 로그인한 사용자 username(localStorage에서 가져옴)
  // const myUsername = localStorage.getItem("username");
  const myUsername = props.myUsername;

  // 자기 자신을 맨 위로 정렬
  const sortedMembers = [...members].sort((a, b) => {
    if (a.username === myUsername) return -1;
    if (b.username === myUsername) return 1;
    return 0;
  });

  // 입력값으로 필터링
  const filteredMembers = sortedMembers.filter(member =>
    (member.username && member.username.toLowerCase().includes(userInput.toLowerCase())) ||
    (member.nickname && member.nickname.toLowerCase().includes(userInput.toLowerCase()))
  );

  const canInvite = userInput.trim() && !members.some(member => member.username === userInput.trim());
  
  return (
    <>
      <div style={ { position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(15, 23, 42, 0.45)", display: "flex", alignItems: "center", justifyContent: "center" } }>
        <div style={ { position: "relative", padding: "48px 56px 40px", width: "440px", border: "1px solid #e5e7eb", borderRadius: "32px", backgroundColor: "#fff", boxShadow: "0 20px 45px rgba(15, 23, 42, 0.16)"} }>
          {/* 닫기 버튼 */}
          <button style={ { position: "absolute", top: "18px", right: "22px", border: "None", background: "transparent", fontSize: "20px", color: "#9ca3af", cursor: "pointer"} }
            type='button' onClick={props.onClose}
          >
            ✕
          </button>

          <h1 style={ { marginBottom: "24px", fontSize: "24px", fontWeight: "bold", color: "#111827", textAlign: "center"} }>프로젝트 멤버 관리</h1>
          {/* 아이디 입력창 + 초대하기 버튼 */}
          <div style={ { borderRadius: "8px", padding: "16px", display: "flex", justifyContent: "space-between", gap: "8px" } }>
            <input type="text" value={userInput} placeholder="검색 / 초대할 사용자 아이디" style={ { width: "100%", padding: "8px", marginBottom: "16px", border: "1px solid #d1d5db", borderRadius: "8px" } } 
            onChange={event => setUserInput(event.target.value)}/>
            <button disabled={!canInvite} style={ { backgroundColor: canInvite ? "#3b82f6" : "#9ca3af", width: "20%", padding: "10px", marginBottom: "16px", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" } }
            onClick={() => props.onInvite(userInput)}>
              <HiOutlineUserPlus style={ { fontSize: "20px" } } />
            </button>
          </div>

          {/* 멤버 리스트 */}
          <div style={ { height: "300px", maxHeight: "300px", overflowY: "auto", marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" } }>
          {
            filteredMembers.map(member => (
              <label key={member.userId}>
              <div  style={ { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", border: "1px solid #e5e7eb", borderRadius: "8px" } }>
                <div style={ { display: "flex", alignItems: "center", gap: "12px" } }>
                  <div style={ { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#d1d5db", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", color: "#fff" } }>
                    {member.nickname.charAt(0).toUpperCase()}
                  </div>
                  <span style={ { fontSize: "16px", color: "#111827" } }>{member.nickname}</span>
                  {member.role === "LEADER" ? (
                      <span style={ { marginLeft: 8, fontSize: 12, color: "#f59e0b", fontWeight: "bold", background: "#fffbeb", borderRadius: 6, padding: "2px 6px" } }>리더</span>
                    ) : (
                      <></>
                      // <span style={ { marginLeft: 8, fontSize: 12, color: "#6b7280", fontWeight: "bold", background: "#f3f4f6", borderRadius: 6, padding: "2px 6px" } }>멤버</span>
                    )}
                </div>
                <div style={ { position: "relative", display: "flex", alignItems: "center" } }>
                  {member.nickname === myUsername && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#2563eb", fontWeight: "bold", background: "#e0e7ff", borderRadius: 6, padding: "2px 6px" }}>me</span>
                  )}
                  {(sortedMembers[0].role === "LEADER" || member.nickname === myUsername) && (
                    <button style={ { marginLeft: 8, background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", color: "#9ca3af" } }
                  onClick={() => { setOpenMenuId(member.userId); setIsMenuOpen(!isMenuOpen);}}>
                    ⋯
                  </button>
                  )}
                  {/* <button style={ { backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer" } }>추방</button> */}
                  {isMenuOpen && openMenuId === member.userId && (
                    <div style={ { width: "100px", border: "1px solid #ccc", borderRadius: 8, position: "absolute", right: 0, top: "100%", backgroundColor: "#fff", zIndex: 10} }>
                      <ul style={ { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" } }>
                        {member.nickname !== myUsername && (
                          <li style={ { cursor: "pointer", padding: "10px 12px 8px 12px", borderBottom: "1px solid #e5e7eb" } }
                          onClick={() => {
                            const newRole = member.role === "LEADER" ? "MEMBER" : "LEADER";
                            props.onModify(member.nickname, newRole);
                            setIsMenuOpen(false);
                          }}
                        >
                          { member.role === "LEADER" ? "리더권한 박탈하기" : "리더권한 부여하기" }
                          </li>
                        )}
                        <li style={ { cursor: "pointer", padding: "10px 12px 8px 12px" } }
                          onClick={() => props.onEject(member.nickname)}>
                          {member.nickname === myUsername ? "탈퇴하기" : "추방하기"}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              </label>
            ))
          }
          </div>
        </div>
      </div>
    </>
  );
}

export default ProjectMemberModal;