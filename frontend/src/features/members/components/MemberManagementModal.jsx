import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUserPlus } from "react-icons/hi2";
import { useUpdateMemberRole } from "../api/useUpdateMemberRole.js";
import { useDeleteMember } from "../api/useDeleteMember.js";
import { useInviteMember } from "../api/useInviteMember.js";
import { UserType } from '@/types/member';

/**
 * @param {Object} props
 * @param {import('@/types/member').UnifiedUser[]} props.members - 멤버 목록 (타입 힌트 적용!)
 */

function MemberManagementModal(props) {
  const navigate = useNavigate();
  const { projectId, myUsername, members, pendingInvites } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [userInput, setUserInput] = useState("")
  

  // 이걸 여기에 두는 게 맞나?
  const unifiedList = useMemo(() => {
    const memberList = members.map((m) => ({
      id: m.username,
      username: m.username,
      nickname: m.nickname,
      type: UserType.MEMBER,
      role: m.role,
      // (추후 구현)
      // profileImg: m.profileImg,
    }));

    const invitationList = pendingInvites.map((i) => ({
      id: i.inviteId,
      ////////////////////
      // 필드명 통일 필요 //
      ///////////////////
      username: i.inviteeName,
      nickname: i.inviteeName,
      type: UserType.INVITED,
      inviteId: i.inviteId,
      inviterName: i.inviterName,
      status: i.status
    }))
    // (추후 구현) 검색 자동완성 기능
    // const searchList = searchResults
    //     .filter(user => {
    //       // 이미 멤버 목록에 있는 유저인지 확인
    //       const isMember = memberList.some(m => m.username === user.username)
    //       // 이미 초대 목록에 있는 유저인지 확인
    //       const isInvited = invitationList.some(i => i.username === user.username)
    //
    //       return !isMember && !isInvited;
    //     })
    //     .map((user) => ({
    //       ...user,
    //       type: UserType.SEARCH,
    //     }))

    return [...memberList, ...invitationList];
  }, [members, pendingInvites]);

  console.log("Unified List:", unifiedList);

  const { mutate: InviteMember } = useInviteMember();
  const { mutate: updateRole } = useUpdateMemberRole();
  const { mutate: deleteMember } = useDeleteMember();

  // // 자기 자신을 맨 위로 정렬
  // const sortedMembers = [...members].sort((a, b) => {
  //   if (a.username === myUsername) return -1;
  //   if (b.username === myUsername) return 1;
  //   return 0;
  // });

  // 입력값으로 필터링
  const filteredMembers = unifiedList.filter(user =>
    (user.username?.toLowerCase().includes(userInput.toLowerCase())) ||
    (user.nickname?.toLowerCase().includes(userInput.toLowerCase()))
  );

  const canInvite = userInput.trim() &&
      !unifiedList.some(user => user.username === userInput.trim())
      // && !pendingInvites.some(invite => invite.invitedName === userInput.trim());


  const handleInviteMember = (userInput) => {
    InviteMember({
      projectId: projectId,
      invitedName: userInput
    })
  }

  const handleUpdateMemberRole = (username, role) => {
    updateRole({
      projectId: projectId,
      username: username,
      role: role
    })
  }

  const handleDeleteMember = (member) => {
    let deleteConfirmation;
    let alertMessage = member.username === myUsername ? "정말로 탈퇴하시겠습니까?" : `정말로 ${member.nickname} 님을 추방하시겠습니까?`;

    window.confirm(alertMessage) ? deleteConfirmation = true : deleteConfirmation = false;

    if (deleteConfirmation) {
      deleteMember({
        projectId: projectId,
        targetName: member.username
      });

      if (member.username === myUsername) {
        navigate("/dashboard");
      }
    }
  }
  
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
            onClick={() => handleInviteMember(userInput)}>
              <HiOutlineUserPlus style={ { fontSize: "20px" } } />
            </button>
          </div>

          {/* 멤버 리스트 */}
          <div style={ { height: "300px", maxHeight: "300px", overflowY: "auto", marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" } }>
          {
            Array.isArray(members) && filteredMembers.map(user => (
              // memberDTO에 id 값이 없어서 임시로 사용
              <label key={user.username}>
              <div  style={ { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", border: "1px solid #e5e7eb", borderRadius: "8px" } }>
                {/* 1. 좌측 정보 (공통) */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: user.type === UserType.MEMBER ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#d1d5db', display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", color: "#fff" }}>
                    {user.nickname.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: "16px", color: "#111827" }}>{user.nickname}</span>

                  {/* MEMBER 타입일 때만 리더 배지 표시 */}
                  {user.type === UserType.MEMBER && user.role === "LEADER" && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: "#f59e0b", fontWeight: "bold", background: "#fffbeb", borderRadius: 6, padding: "2px 6px" }}>리더</span>
                  )}
                </div>
                <div style={ { position: "relative", display: "flex", alignItems: "center" } }>
                  {/* (A) 기존 멤버일 때 */}
                  {user.type === UserType.MEMBER && (
                      <>
                        {user.username === myUsername && (
                            <span style={{ marginLeft: 8, fontSize: 12, color: "#2563eb", fontWeight: "bold", background: "#e0e7ff", borderRadius: 6, padding: "2px 6px" }}>me</span>
                        )}
                        {/* 리더이거나 본인이면 메뉴 버튼 표시 */}
                        <button onClick={() => { setOpenMenuId(user.username); setIsMenuOpen(!isMenuOpen); }}>
                          ⋯
                        </button>
                        {/* <button style={ { backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer" } }>추방</button> */}
                        {isMenuOpen && openMenuId === user.username && (
                            <div style={ { width: "100px", border: "1px solid #ccc", borderRadius: 8, position: "absolute", right: 0, top: "100%", backgroundColor: "#fff", zIndex: 10} }>
                              <ul style={ { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" } }>
                                {user.username !== myUsername && (
                                    <li style={ { cursor: "pointer", padding: "10px 12px 8px 12px", borderBottom: "1px solid #e5e7eb" } }
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setIsMenuOpen(false);
                                          // 관리자 또는 일반 멤버로 권한 변경
                                          const newRole = user.role === "LEADER" ? "MEMBER" : "LEADER";
                                          handleUpdateMemberRole(user.username, newRole);
                                          setIsMenuOpen(false);
                                        }}
                                    >
                                      { user.role === "LEADER" ? "리더권한 박탈하기" : "리더권한 부여하기" }
                                    </li>
                                )}
                                <li style={ { cursor: "pointer", padding: "10px 12px 8px 12px" } }
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setIsMenuOpen(false);
                                      handleDeleteMember(user.username);} }>
                                  {user.username === myUsername ? "탈퇴하기" : "추방하기"}
                                </li>
                              </ul>
                            </div>
                        )}
                      </>
                  )}

                  {/* (B) 초대된 유저일 때 */}
                  { user.type === UserType.INVITED && (
                    <>
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#000", background: "#d1d5db", borderRadius: 6, padding: "2px 6px" }}>
                        {user.status === 'INVITED' ? "수락 대기중" : user.status}
                      </span>
                      {/* 초대 취소 버튼 등 추가 가능 */}
                    </>
                  )}
                </div>
              </div>
              </label>
            ))
          }
          {/*</div>*/}

          {/* 초대 목록 */}
          {/*<div style={ { marginTop: "16px", height: "300px", maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" } }>*/}
          {/*  {Array.isArray(pendingInvites) && pendingInvites.map(invite => (*/}
          {/*    <label key={invite.inviteId}>*/}
          {/*      <div style={ { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", border: "1px solid #e5e7eb", borderRadius: "8px" } }>*/}
          {/*        <div style={ { display: "flex", alignItems: "center", gap: "12px" } }>*/}
          {/*          <div style={ { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#d1d5db", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", color: "#fff" } }>*/}
          {/*            {invite.invitedName.charAt(0).toUpperCase()}*/}
          {/*          </div>*/}
          {/*          <span style={ { fontSize: "16px", color: "#111827" } }>{invite.invitedName}</span>*/}
          {/*        </div>*/}
          {/*        <div style={ { position: "relative", display: "flex", alignItems: "center" } }>*/}
          {/*            <span style={{ marginLeft: 8, fontSize: 12, color: "#000", background: "#d1d5db", borderRadius: 6, padding: "2px 6px" }}>*/}
          {/*              {invite.status === 'INVITED' ? "수락 대기중" : invite.status}*/}
          {/*            </span>*/}
          {/*          {(sortedMembers[0].role === "LEADER") && (*/}
          {/*              <button style={ { marginLeft: 8, background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", color: "#9ca3af" } }>*/}
          {/*                ⋯*/}
          {/*              </button>*/}
          {/*          )}*/}
          {/*          /!*<button style={ { marginLeft: 8, background: "transparent", border: "none", cursor: "pointer", fontSize: "1px", color: "#9ca3af"} }>⋯</button>*!/*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </label>*/}
          {/*    )*/}
          {/*  )}*/}
          </div>

        </div>
      </div>
    </>
  );
}

export default MemberManagementModal;
