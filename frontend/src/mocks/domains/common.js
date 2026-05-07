/**
 * MSW에서 사용하는 공통 응답 래퍼 유틸입니다.
 *
 * 실제 응답 JSON 구조는 {@link ../../api/types/common.js ApiResponse<T>} 타입과 일치합니다.
 * - successResponse: { success: true, message: '성공', data: T }
 * - errorResponse  : { success: false, message, data: null }
 */

/**
 * 공통 성공 응답 래퍼
 * @param {*} data - 응답 데이터(payload)
 * @param {number} [status=200] - HTTP 상태 코드
 * @returns {Response} JSON Response (ApiResponse<T> 구조)
 */
export const successResponse = (data, status = 200) => {
  // 204/205/304 응답은 HTTP 스펙상 body를 포함할 수 없습니다.
  if (status === 204 || status === 205 || status === 304) {
    return new Response(null, { status });
  }

  return Response.json(
    {
      success: true,
      message: '성공',
      data,
    },
    { status },
  );
};

/**
 * 공통 에러 응답 래퍼
 * @param {string} message - 에러 메시지
 * @param {number} [status=400] - HTTP 상태 코드
 * @returns {Response} JSON Response (ApiResponse<null> 구조)
 */
export const errorResponse = (message, status = 400) => {
  return Response.json(
    {
      success: false,
      message,
      data: null,
    },
    { status },
  );
};
