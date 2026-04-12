/**
 * Project 엔티티 및 projects_data.json 기반 프로젝트 멤버 타입
 * - 실제 User 엔티티 전체가 아니라, 프로젝트 내에서 사용하는 요약 정보만 포함합니다.
 * @typedef {Object} ProjectMemberSummary
 * @property {string} username   - 사용자 ID (User.username)
 * @property {string} nickname   - 화면에 표시할 이름
 * @property {"LEADER" | "MEMBER"} role - 프로젝트 내 역할
 */

/**
 * Project 엔티티 및 projects_data.json 기반 프로젝트 데이터 타입
 *
 * 백엔드 Project 엔티티 필드 매핑
 * - id               → projectId (프론트/모킹에서 사용)
 * - projectName      → projectName
 * - description      → description
 * - createdDate      → createdDate (ISO 문자열)
 * - isDeleted        → isDeleted
 * - deletedDate      → deletedDate (ISO 문자열 | null)
 * - deleteUsername   → deleteUsername (string | null)
 * - memberCount      → memberCount (프로젝트 멤버 수)
 *
 * 추가 필드 (엔티티에는 없지만 프론트/모킹에서 사용하는 값)
 * - updatedDate      → 업데이트 일시 (ISO 문자열)
 * - taskProgress     → 작업 진행도 (% 단위 number)
 * - members          → ProjectMemberSummary[]
 *
 * 주의:
 * - 실제 백엔드 API 스펙이 확정되면, 필요에 따라 필수/선택 필드를 조정합니다.
 * - createdDate / updatedDate / deletedDate 는 LocalDateTime 을 ISO 문자열로 전달받는다고 가정합니다.
 *
 * @typedef {Object} ProjectData
 * @property {number} projectId                 - 프로젝트 식별자 (엔티티 id)
 * @property {string} projectName               - 프로젝트 이름
 * @property {string} description               - 프로젝트 설명
 * @property {number} taskProgress              - 작업 진행도 (0~100, mock 데이터 기준)
 * @property {number} memberCount               - 프로젝트 멤버 수 (@Formula 기반 값)
 * @property {string} createdDate               - 생성일 (ISO 문자열)
 * @property {string} [updatedDate]             - 최종 수정일 (ISO 문자열)
 * @property {boolean} isDeleted                - 삭제 여부
 * @property {string|null} [deletedDate]        - 삭제 일시 (ISO 문자열 또는 null)
 * @property {string|null} deleteUsername       - 삭제 수행자 username (null 이면 미삭제)
 * @property {ProjectMemberSummary[]} members   - 프로젝트 멤버 목록
 */
