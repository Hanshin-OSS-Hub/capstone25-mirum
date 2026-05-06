import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';

/**
 * 모달 등 오버레이가 열려 있는 동안 문서 스크롤을 잠급니다.
 * 여러 컴포넌트가 동시에 사용할 때도 안전하게 동작하도록 참조 카운트를 사용합니다.
 * @param {boolean} enabled
 */
export function useBodyScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const { documentElement } = document;

    if (lockCount === 0) {
      originalOverflow = documentElement.style.overflow;
      documentElement.style.overflow = 'hidden';
    }
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        documentElement.style.overflow = originalOverflow || 'auto';
      }
    };
  }, [enabled]);
}
