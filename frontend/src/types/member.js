/**
 * @typedef {import('@/constants/memberConstants.js').PROJECT_ROLE} PROJECT_ROLE
 */

/**
 * 프로젝트 멤버 정보 DTO
 * @see ProjectMember.java
 * @see ../../../../../backend/src/main/java/backend/dto/project/ProjectMemberDTO.java
 * @typedef {object} ProjectMemberDTO
 * @property {string} username                  - 멤버 사용자 아이디
 * @property {string} nickname                  - 멤버 사용자 닉네임
 * @property {PROJECT_ROLE[keyof PROJECT_ROLE]} role - 프로젝트 내 권한 레벨 (Enum 기반)
 * @property {string} [profileImg]              - 프로필 이미지 URL
 */

export {};
