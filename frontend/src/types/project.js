/**
 * 프로젝트 내 멤버 요약 타입
 * @typedef {object} ProjectMemberSummary
 * @property {string} username   - 사용자 아이디
 * @property {string} nickname   - 사용자 닉네임
 * @property {'LEADER' | 'MEMBER'} role - 프로젝트 내 권한
 */

/**
 * 프로젝트 상세 데이터 모델
 * @see Project.java
 * @see ../../../../../backend/src/main/java/backend/dto/project/ProjectDTO.java
 * @typedef {object} ProjectData
 * @property {number} projectId                 - 프로젝트 고유 ID
 * @property {string} projectName               - 프로젝트 제목
 * @property {string} description               - 프로젝트 상세 설명
 * @property {number} taskProgress              - 프로젝트 전체 진행률 (0~100)
 * @property {number} memberCount               - 참여 중인 멤버 수
 * @property {string} creationDate               - 생성 일시 (ISO 문자열)
 * @property {string} [updatedDate]             - 최종 수정 일시 (ISO 문자열)
 * @property {boolean} isDeleted                - 삭제 여부
 * @property {string | null} [deletedDate]      - 삭제 일시 (ISO 문자열)
 * @property {string | null} deleteUsername     - 삭제 수행자 아이디
 * @property {ProjectMemberSummary[]} members   - 프로젝트 참여 멤버 목록
 */

/**
 * 프로젝트 목록 정보 DTO
 * @typedef {object} ProjectListDTO
 * @property {number} projectId
 * @property {string} projectName
 * @property {string} description
 * @property {number} memberCount
 * @property {number} taskProgress
 * @property {string} creationDate
 * @property {string} updatedDate
 */

export {};
