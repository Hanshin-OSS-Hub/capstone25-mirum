/**
 * 프로젝트 멤버 DTO
 * - 백엔드 ProjectMemberDTO / ProjectMember 엔티티를 프론트에서 표현할 때 사용하는 도메인 타입입니다.
 * - API 응답 및 MSW projectsDB.members 요소 구조와 1:1로 매칭됩니다.
 *
 * @typedef {Object} ProjectMemberDTO
 * @property {string} username    - 멤버의 username (User.username)
 * @property {string} nickname    - 멤버의 표시 이름
 * @property {'LEADER'|'MEMBER'} role - 프로젝트 내에서의 역할
 */
