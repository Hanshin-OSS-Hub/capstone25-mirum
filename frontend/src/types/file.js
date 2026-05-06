/**
 * @typedef {import('@/constants/fileConstants.js').FILE_CATEGORY} FILE_CATEGORY
 * @typedef {import('@/constants/fileConstants.js').FILE_VIEW_MODE} FILE_VIEW_MODE
 */

/**
 * 파일 엔티티 속성 정의
 * @typedef {object} FileData
 * @property {string} uuid                      - 파일 고유 식별자 (UUID)
 * @property {number} [projectId]               - 소속 프로젝트 ID
 * @property {number} [taskId]                  - 소속 작업 카드 ID
 * @property {string} originalFilename          - 원본 파일명
 * @property {number} size                      - 파일 크기 (Byte)
 * @property {string} contentType               - MIME 타입
 * @property {string | null} [previewUrl]       - 썸네일 또는 미리보기 URL
 * @property {string} uploadedDate              - 업로드 일시 (ISO 8601 문자열)
 * @property {string} uploadedBy                - 업로드 수행자 아이디
 * @property {string | null} [expiredDate]      - 만료 일시 (ISO 8601 문자열)
 * @property {boolean} [isDeleted]              - 삭제 여부 (소프트 삭제)
 * @property {string | null} [deletedDate]      - 삭제 일시 (ISO 8601 문자열)
 */

/**
 * UI 렌더링을 위해 정규화된 파일 아이템 타입
 * @typedef {object} NormalizedFileItem
 * @property {string} uuid
 * @property {string} originalFilename
 * @property {number} size
 * @property {string} contentType
 * @property {string | null} previewUrl
 * @property {string} uploadedBy
 * @property {string} uploadedDate
 * @property {string} displaySize
 * @property {string} displayDate
 * @property {FILE_CATEGORY[keyof FILE_CATEGORY]} category - 파일 카테고리 (Enum 기반)
 * @property {string} [taskName]                - 연결된 작업 이름
 */

/**
 * 파일 리스트 테이블에서 사용하는 확장 타입
 * @typedef {NormalizedFileItem & {
 *   downloadUrl?: string | null,
 *   itemCount?: number | null,
 * }} FileListItem
 */

export {};
