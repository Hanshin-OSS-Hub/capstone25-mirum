/**
 * 시스템 공통 API 응답 구조
 * @template T
 * @typedef {object} ApiResponse
 * @property {boolean} success                  - 요청 처리 성공 여부
 * @property {string} message                   - 안내 또는 에러 메시지
 * @property {T} data                           - 실제 결과 데이터 (성공 시 T 타입, 실패 시 null 권장)
 */

/**
 * 표준 페이지네이션 응답 구조
 * @template T
 * @typedef {object} PageResponse
 * @property {T[]} content                      - 현재 페이지 데이터 목록
 * @property {number} totalElements             - 전체 데이터 개수
 * @property {number} totalPages                - 전체 페이지 수
 * @property {number} size                        - 한 페이지 크기
 * @property {number} number                      - 현재 페이지 번호 (0부터 시작)
 */

export {};
