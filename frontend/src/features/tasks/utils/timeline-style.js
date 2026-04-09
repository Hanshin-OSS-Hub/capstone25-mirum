// 타임라인에서 사용하는 색상/스타일 관련 유틸 함수 모음

/**
 * HEX 색상 문자열(3자리 또는 6자리)을 RGB 객체로 변환한다.
 */
export function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean;

  const bigint = parseInt(full, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * HEX 색상과 alpha 값을 받아 rgba() 문자열을 생성한다.
 */
export function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Task 상태/색상 정보를 기반으로 타임라인 바의 시각적 스타일을 계산한다.
 */
export function getTaskVisual(task) {
  const base = task.color || '#4F46E5';

  switch (task.status) {
    case 'DONE':
      return {
        background: `linear-gradient(135deg, ${rgba(base, 0.95)}, ${rgba(base, 0.82)})`,
        border: rgba(base, 1),
        text: '#ffffff',
        shadow: `0 10px 24px ${rgba(base, 0.25)}`,
      };

    case 'IN_PROGRESS':
      return {
        background: `linear-gradient(135deg, ${rgba(base, 0.26)}, ${rgba(base, 0.48)})`,
        border: rgba(base, 0.76),
        text: '#1f2937',
        shadow: `0 8px 18px ${rgba(base, 0.12)}`,
      };

    default:
      return {
        background: `linear-gradient(135deg, ${rgba(base, 0.14)}, ${rgba(base, 0.24)})`,
        border: rgba(base, 0.42),
        text: '#374151',
        shadow: 'none',
      };
  }
}

