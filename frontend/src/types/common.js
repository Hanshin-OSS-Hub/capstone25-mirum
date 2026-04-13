/**
 * 공통 API 응답 구조 (MSW/common.js의 successResponse/errorResponse 형식과 일치)
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 요청 처리 성공 여부
 * @property {string} message - 응답 또는 에러 메시지
 * @property {T} data - 실제 응답 데이터 (성공 시 payload, 실패 시에는 주로 null)
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

export {}; // 타입 선언 전용 파일
