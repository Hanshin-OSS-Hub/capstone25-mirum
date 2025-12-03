import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // md 사이즈 기준 (Tailwind CSS)

/**
 * 현재 뷰포트(viewport)의 너비를 감지하여 모바일 여부를 반환하는 커스텀 훅.
 * @returns {{isMobile: boolean}} isMobile - 현재 화면이 모바일 크기인지 여부
 */
export const useViewport = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { isMobile };
};
