/**
 * @typedef {import('@/constants/invitationConstants.js').INVITATION_STATUS} INVITATION_STATUS
 */

/**
 * 초대 도메인 공통 타입 정의
 */

/**
 * 프로젝트 초대 상세 정보 DTO
 * @see ProjectInvite.java
 * @see ../../../../../backend/src/main/java/backend/dto/invite/InviteResponseDTO.java
 * @typedef {object} Invitation
 * @property {number} inviteId                  - 초대 고유 식별자
 * @property {string} projectName               - 초대된 프로젝트 제목
 * @property {string} inviterName               - 초대를 보낸 사람 아이디
 * @property {string} invitedName               - 초대받은 사람 아이디 (본인)
 * @property {INVITATION_STATUS[keyof INVITATION_STATUS]} status - 초대 상태 (Enum 기반)
 * @property {string} inviteDate                - 초대 생성 일시 (ISO 문자열)
 * @property {string | null} [responseDate]     - 초대 수락/거절 일시 (ISO 문자열)
 */

export {};
