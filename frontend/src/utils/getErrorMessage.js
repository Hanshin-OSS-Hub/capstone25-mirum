/**
 * 다양한 에러 타입에서 사용자 노출용 메시지를 안전하게 추출합니다.
 * @param {unknown} error
 * @param {string} fallbackMessage
 * @returns {string}
 */
export const getErrorMessage = (error, fallbackMessage = '요청 처리 중 오류가 발생했습니다.') => {
  if (error && typeof error === 'object') {
    // @ts-ignore custom field
    const status = error.status;
    if (typeof status === 'number') {
      if (status === 401) return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
      if (status === 403) return '이 작업을 수행할 권한이 없습니다.';
      if (status === 404) return '요청한 데이터를 찾을 수 없습니다.';
      if (status >= 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    }
  }
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return fallbackMessage;
};
