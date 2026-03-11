/**
 * 공통 API 응답 구조 (Generic Type)
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 성공 여부
 * @property {string} message - 응답 메시지
 * @property {T} data - 실제 데이터 (Generic)
 */

/**
 * 페이지네이션 응답 구조 (선택 사항)
 * @template T
 * @typedef {Object} PageResponse
 * @property {T[]} content - 데이터 목록
 * @property {number} totalElements - 전체 개수
 * @property {number} totalPages - 전체 페이지 수
 * @property {number} size - 페이지 크기
 * @property {number} number - 현재 페이지 번호
 */