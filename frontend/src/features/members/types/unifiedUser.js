/**
 * 통합 유저 모델 (Unified User Model)
 * - 멤버 관리 모달 등에서 사용
 */

// UserType.MEMBER = 'FOO' 처럼 값을 변경하려는 시도를 막을 수 있어 안전함
export const UserType = Object.freeze({
  MEMBER: 'MEMBER',       // 기존 멤버 (ProjectMemberDTO)
  INVITED: 'INVITED',     // 초대된 유저 (InviteResponseDTO)
  SEARCHED: 'SEARCHED',   // 검색된 유저 (UserDTO - 추후 구현)
});

/**
 * @typedef {Object} UnifiedUser
 * @property {string|number} id - 유저 식별자 (MEMBER: username, INVITED: inviteId, SEARCHED: username)
 * @property {string} username - 아이디 (MEMBER: username, INVITED: invitedName)
 * @property {string} nickname - 닉네임 (MEMBER: nickname, INVITED: invitedName(임시))
 // * @property {string} [avatar] - 프로필 이미지 URL (선택)
 * @property {string} type - UserType 중 하나 ('MEMBER' | 'INVITED' | 'SEARCHED')
 * 
 * // MEMBER 타입 전용 속성
 * @property {'LEADER'|'MEMBER'} [role] - 멤버 권한 (ProjectMemberDTO.role)
 * 
 * // INVITED 타입 전용 속성
 * @property {number} [inviteId] - 초대 고유 ID (InviteResponseDTO.inviteId)
 * @property {string} [inviterName] - 초대한 사람 이름 (InviteResponseDTO.inviterName)
 * @property {string} [inviteeName] - 초대받은 사람 이름 (InviteResponseDTO.inviteeName)
 * @property {'INVITED'|'ACCEPTED'|'DECLINED'} [status] - 초대 상태 (InviteResponseDTO.status)
 */
