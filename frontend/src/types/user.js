/**
 * 사용자 Role 타입
 * - 백엔드 UserRoleType 과 매핑
 * @typedef {"ADMIN" | "USER" | "MANAGER"} UserRole
 */

/**
 * 소셜 로그인 제공자 타입
 * - 백엔드 SocialProviderType 과 매핑
 * @typedef {"GOOGLE" | "NAVER" | "KAKAO"} SocialProviderType
 */

/**
 * User Entity 기반 공통 사용자 데이터 타입
 * - 백엔드 User 엔티티 + 현재 mock 데이터(users_data.json)를 반영
 *
 * 주의:
 * - 실제 서버 응답에서 password 가 내려오지 않을 가능성이 높으므로, optional 로 정의
 * - isLock / isSocial / socialProviderType 은 아직 mock 에 없으므로 optional 로 처리
 * - role 은 백엔드 roleType 과 의미상 동일하다고 가정
 *
 * @typedef {Object} UserData
 * @property {number} [id]              - 사용자 식별자 (mock 데이터에는 없지만, 서버 응답에는 포함될 가능성 큼)
 * @property {string} username          - 로그인 ID (고유)
 * @property {string} [password]        - 비밀번호 (mock 에만 존재, 실제 응답에는 없을 수 있음)
 * @property {UserRole} role            - 사용자 권한 (mock 의 role, 엔티티의 roleType 과 매핑)
 * @property {boolean} [isLock]         - 계정 밴 여부 (백엔드 User.isLock, 기본값 false 예상)
 * @property {boolean} [isSocial]       - 소셜 로그인 계정 여부 (백엔드 User.isSocial)
 * @property {SocialProviderType} [socialProviderType] - 소셜 로그인 타입 (GOOGLE, NAVER 등)
 * @property {string} [nickname]        - 닉네임
 * @property {string} [email]           - 이메일
 * @property {string} createdDate       - 계정 생성일 (ISO 문자열, 예: "2025-01-01T00:00:00")
 * @property {string} updatedDate       - 최종 수정일 (ISO 문자열)
 * @property {string} [profileImg]      - 프로필 이미지 URL (mock 에 존재, 백엔드 필드엔 아직 없음)
 */
