/**
 * @typedef {import('@/constants/unifiedUserConstants.js').UNIFIED_USER_TYPE} UNIFIED_USER_TYPE
 * @typedef {import('@/constants/memberConstants.js').PROJECT_ROLE} PROJECT_ROLE
 * @typedef {import('@/constants/invitationConstants.js').INVITATION_STATUS} INVITATION_STATUS
 */

/**
 * 통합 유저 모델 (Unified User Model)
 */

/**
 * @typedef {object} UnifiedUser
 * @property {string | number} id               - 고유 식별자
 * @property {string} username                  - 사용자 로그인 아이디
 * @property {string} nickname                  - 사용자 표시 이름
 * @property {UNIFIED_USER_TYPE[keyof UNIFIED_USER_TYPE]} type - 데이터 소스 타입 (Enum 기반)
 * @property {string} [profileImg]              - 프로필 이미지 URL
 *
 * // MEMBER 전용
 * @property {PROJECT_ROLE[keyof PROJECT_ROLE]} [role] - 프로젝트 내 권한
 *
 * // INVITED 전용
 * @property {number} [inviteId]                - 초대 고유 ID
 * @property {string} [inviterName]             - 초대한 사람 아이디
 * @property {INVITATION_STATUS[keyof INVITATION_STATUS]} [status] - 현재 초대 처리 상태
 */

export {};
