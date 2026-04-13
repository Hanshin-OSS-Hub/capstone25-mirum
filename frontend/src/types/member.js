/**
 * 프로젝트 내에서 사용되는 멤버 역할 타입
 * - ProjectMemberSummary.role 과 동일한 소스
 * @typedef {"LEADER" | "MEMBER"} ProjectMemberRole
 */

/**
 * 단일 프로젝트 기준 멤버 정보 타입
 * - projects_data.json 의 members 요소를 정식 타입으로 정의한 것
 * - 프론트에서 ProjectData.members 를 사용할 때 기본으로 쓰이는 타입입니다.
 *
 * @typedef {Object} ProjectMember
 * @property {string} username         - 사용자 ID (MemberUserSummary.username 과 동일)
 * @property {string} nickname         - 멤버 표시 이름 (MemberUserSummary.nickname 과 동일)
 * @property {ProjectMemberRole} role  - 프로젝트 내 역할 (LEADER / MEMBER)
 */

/**
 * 프로젝트 단위 멤버 목록 타입 헬퍼
 * @typedef {ProjectMember[]} ProjectMemberList
 */

/**
 * users_data.json 기반의 사용자 요약 타입
 * - 전체 UserData 의 서브셋으로, 프로젝트/멤버 컨텍스트에서 자주 쓰는 필드만 노출합니다.
 * - 필요 시 UserData 와 매핑하여 확장해서 사용합니다.
 *
 * @typedef {Object} MemberUserSummary
 * @property {string} username   - 사용자 ID (User.username)
 * @property {string} nickname   - 화면에 표시할 이름
 * @property {string} [email]    - 이메일 (선택)
 * @property {string} [profileImg] - 프로필 이미지 URL (선택)
 */

/**
 * 특정 사용자가 여러 프로젝트에 참여하고 있는 경우를 표현하기 위한 타입 (확장용)
 * - 지금은 직접 사용하지 않지만, 향후 "내가 속한 프로젝트들" 같은 뷰에서 재사용할 수 있습니다.
 *
 * @typedef {Object} UserProjectMembership
 * @property {string} username           - 사용자 ID
 * @property {number} projectId          - 참여 중인 프로젝트 ID
 * @property {ProjectMemberRole} role    - 해당 프로젝트에서의 역할
 */
