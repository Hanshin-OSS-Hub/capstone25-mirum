/**
 * @typedef {import('@/constants/userConstants.js').USER_ROLE} USER_ROLE
 * @typedef {import('@/constants/userConstants.js').SOCIAL_PROVIDER} SOCIAL_PROVIDER
 */

/**
 * 사용자 정보 엔티티 기반 데이터 모델
 * @see User.java
 * @typedef {object} UserData
 * @property {number} [id]                      - 시스템 내부 식별자
 * @property {string} username                  - 로그인 아이디 (고유)
 * @property {string} [nickname]                - 사용자 닉네임
 * @property {string} [email]                   - 사용자 이메일
 * @property {USER_ROLE[keyof USER_ROLE]} role  - 시스템 권한 (Enum 기반)
 * @property {boolean} [isLock]                 - 계정 잠금 여부
 * @property {boolean} [isSocial]               - 소셜 로그인 여부
 * @property {SOCIAL_PROVIDER[keyof SOCIAL_PROVIDER]} [socialProviderType] - 소셜 로그인 제공자
 * @property {string} createdDate               - 계정 생성 일시
 * @property {string} updatedDate               - 정보 수정 일시
 * @property {string} [profileImg]              - 프로필 이미지 URL
 */

export {};
