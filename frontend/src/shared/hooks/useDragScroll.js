import { useCallback, useRef, useState } from 'react';

/**
 * 드래그 앤 드롭으로 가로/세로 스크롤을 가능하게 하는 커스텀 훅
 * @returns {{
 *   ref: import('react').MutableRefObject<any>,
 *   onMouseDown: (e: import('react').MouseEvent) => void,
 *   onMouseLeave: () => void,
 *   onMouseUp: () => void,
 *   onMouseMove: (e: import('react').MouseEvent) => void,
 *   isDragging: boolean
 * }}
 */
export function useDragScroll() {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const onMouseDown = useCallback((e) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setStartY(e.pageY - ref.current.offsetTop);
    setScrollLeft(ref.current.scrollLeft);
    setScrollTop(ref.current.scrollTop);
    
    // 네이티브 드래그(이미지, 텍스트) 방지를 위해 onMouseDown에서 처리
    // 단, 내부 버튼 클릭 등은 작동해야 하므로 e.preventDefault()는 제한적으로 사용하거나 제외.
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseMove = useCallback(
    (e) => {
      if (!isDragging || !ref.current) return;
      e.preventDefault();

      const x = e.pageX - ref.current.offsetLeft;
      const y = e.pageY - ref.current.offsetTop;

      const walkX = x - startX;
      const walkY = y - startY;

      ref.current.scrollLeft = scrollLeft - walkX;
      ref.current.scrollTop = scrollTop - walkY;
    },
    [isDragging, startX, startY, scrollLeft, scrollTop],
  );

  return {
    ref,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    isDragging,
  };
}
