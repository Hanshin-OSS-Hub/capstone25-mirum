/**
 * 알림 전송 어댑터.
 * 전역 toast 이벤트를 발생시키고, 비브라우저 환경에서는 alert로 fallback 합니다.
 * @param type
 * @param message
 */
const emitToast = (type, message) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent('mirum:toast', {
      detail: { type, message },
    }),
  );
};

export const notify = {
  success: (message) => {
    emitToast('success', message);
  },
  error: (message) => {
    emitToast('error', message);
  },
  info: (message) => {
    emitToast('info', message);
  },
};
