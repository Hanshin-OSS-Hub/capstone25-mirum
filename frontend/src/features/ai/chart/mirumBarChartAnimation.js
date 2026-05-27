/**
 * Chart.js 막대 차트 공통 모션 (루트 `animation`).
 */
export const MIRUM_BAR_CHART_ANIMATION = {
  duration: 1100,
  easing: 'easeOutQuart',
  /** @param {{ type?: string, dataIndex?: number }} ctx */
  delay: (ctx) => (ctx.type === 'data' ? (ctx.dataIndex ?? 0) * 90 : 0),
};

/**
 * Chart.js 4 기본 `animations.numbers.properties`에 `width`/`height`가 없어
 * 막대(Rectangle) 트윈이 건너뛰어짐 → 막대 전용으로 보강.
 * @see https://www.chartjs.org/docs/latest/configuration/animations.html
 */
export const MIRUM_BAR_NUMBERS_ANIMATION = {
  type: 'number',
  properties: ['x', 'y', 'width', 'height'],
  easing: 'easeOutQuart',
  duration: 1100,
};
